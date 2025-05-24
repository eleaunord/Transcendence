import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
import db from '../db/db';
import { User } from '../types'; 
import { sendEmail } from '../utils/sendEmail';
import { generate2FACode } from '../utils/generate2FA';
import { GoogleUser } from '../types';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost';

export async function authRoutes(app: FastifyInstance) {
  // ----- Route de validation de token ----- \\
  app.get('/validate-token', async (req, reply) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({ valid: false, error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

      // Vérifier que l'utilisateur existe toujours en base
      const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(decoded.userId) as User | undefined;
      
      if (!user) {
        return reply.code(401).send({ valid: false, error: 'User not found' });
      }

      // Token valide et utilisateur existe
      reply.send({ 
        valid: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });

    } catch (err: any) {
      console.log('[TokenValidation] Invalid token:', err.message);
      reply.code(401).send({ valid: false, error: 'Invalid token' });
    }
  });

 // ----- Authentification Classique ------ \\
  app.post('/signup', async (req, reply) => {
    const { username: rawUsername, email: rawEmail, password } = req.body as any;
    // Nettoyage des espaces
    const username = rawUsername?.trim();
    const email = rawEmail?.trim();
    if (!username || !email || !password) {
      return reply.code(400).send({ error: 'auth.missing_fields' });
    }
    // Vérification de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return reply.code(400).send({ error: 'auth.invalid_email' });
    }
    // Vérification du username (3 à 20 caractères, lettres, chiffres ou underscore)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return reply.code(400).send({ error: 'auth.invalid_username' });
    }
    // Vérification du mot de passe( Au moins 8 caractères,au moins une majuscule, une minuscule, un chiffre, et un caractère spécial.)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return reply.code(400).send({
        error: "auth.invalid_password",
    });
    }

    const existing = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) 
      return reply.code(409).send({ error: 'auth.duplicate_user' });

    const hashed = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(username, email, hashed);

    // On récupère le user pour générer un token
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User;
    if (!user) {
      return reply.code(500).send({ error: 'User creation failed' });}
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    reply.code(201).send({ message: 'auth.creation_failed', token });  
  });

  app.post('/login', async (req, reply) => {
    const { username, password } = req.body as any;

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;

    if (!user) return reply.code(401).send({ error: 'auth.user_not_found' });

    const match = await bcrypt.compare(password, user.password_hash || '');
    if (!match) return reply.code(401).send({ error: 'auth.incorrect_password' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    console.log('[STANDARD LOGIN] USER EMAIL:', user.email);
    // 0805 수정
    // reply.send({ token });
    reply.send({
      token,
      user: {
        email: user.email,
        is_2fa_enabled: !!user.is_2fa_enabled,
        seen_2fa_prompt: !!user.seen_2fa_prompt,
      },
    });
  });

  // ----- Google OAuth -----
  app.get('/auth/google', async (_, reply) => {
    console.log('[DEBUG] Sending redirect_uri to Google:', GOOGLE_REDIRECT_URL);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URL}&response_type=code&scope=profile email&access_type=offline`;
    reply.redirect(authUrl);
  });

  app.get('/auth/google/callback', async (req, reply) => {
    const { code, error } = req.query as { code?: string; error?: string };

    if (error === 'access_denied') {
      //사용자가 Google 로그인 취소 → 프론트엔드에 리디렉트하면서 query 넘김
      const redirectUrl = `${FRONTEND_URL}/auth/google?error=access_denied`;
      return reply.redirect(redirectUrl);
    }
    
    if (!code) return reply.code(400).send({ error: 'auth.missing_code' });

    try {
      const tokenRes = await axios.post<{ access_token: string }>(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: GOOGLE_REDIRECT_URL,
          grant_type: 'authorization_code',
        }
      );

      const accessToken = tokenRes.data.access_token;

      const userInfo = await axios.get<GoogleUser>(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const { id: googleId, email, name, picture } = userInfo.data;

      let username = name.replace(/\s+/g, '_');
      let suffix = 1;
      while (db.prepare('SELECT * FROM users WHERE username = ?').get(username)) {
        username = `${name}_${suffix++}`;
      }

      let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId) as User | undefined;

      if (!user) {
        const res = db.prepare(`
          INSERT INTO users (username, email, google_id, image, is_2fa_enabled, seen_2fa_prompt)
          VALUES (?, ?, ?, ?, 0, 0)
        `).run(username, email, googleId, picture);      

        user = db.prepare('SELECT * FROM users WHERE id = ?').get(res.lastInsertRowid) as User;
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      // 0805 수정
      // const redirectUrl = `${FRONTEND_URL}/auth/google?token=${token}&email=${encodeURIComponent(email)}&is_2fa_enabled=${user.is_2fa_enabled}&seen_2fa_prompt=${user.seen_2fa_prompt}`;
      const redirectUrl = `${FRONTEND_URL}/auth/google?token=${token}&email=${encodeURIComponent(email)}&id=${user.id}&is_2fa_enabled=${user.is_2fa_enabled}&seen_2fa_prompt=${user.seen_2fa_prompt}`;
      console.log('[GOOGLE OAUTH] Redirecting to:', redirectUrl);
      reply.redirect(redirectUrl);

    } catch (err: any) {
      console.error('Google Auth Error:', err?.response?.data || err.message);
      reply.code(500).send({ error: 'auth.oauth_failed' });
    }
  });
  
  // ----- 2FA Enable -----
  app.post('/enable-2fa', async (req, reply) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'auth.unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as User | undefined;
      console.log('[2FA] decoded userId:', decoded.userId); //debug
      if (!user) 
        return reply.code(404).send({ error: 'User not found' });

      const code = generate2FACode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분 유효

      db.prepare(`
        UPDATE users SET
          two_fa_code = ?,
          two_fa_expires_at = ?
        WHERE id = ?
      `).run(code, expiresAt.toISOString(), decoded.userId);

      console.log('[2FA] User Email:', user.email); // debug
      console.log('[2FA] Sending code to email...'); // debug
      
      await sendEmail(user.email, 'Your 2FA Code', `Your code is ${code}. It will expire in 5 minutes.`);
      reply.send({ message: 'auth.2fa_code_sent' });

    } catch (err) {
      console.error('2FA enable error:', err);
      reply.code(500).send({ error: 'auth.2fa_enable_failed' });
    }
  });

  // ----- 2FA Verification -----
  app.post('/verify-2fa', async (req, reply) => {
    try {
      const { code } = req.body as { code: string };
      const authHeader = req.headers.authorization;
  
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'auth.unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as User | undefined;
      if (!user || !user.two_fa_code || !user.two_fa_expires_at) {
        return reply.code(400).send({ error: 'auth.2fa_not_initiated' });
      }

      const now = new Date();
      const expiresAt = new Date(user.two_fa_expires_at);
  
      if (now > expiresAt) {
        return reply.code(400).send({ error: 'auth.2fa_expired' });
      }

      if (code !== user.two_fa_code) {
        return reply.code(400).send({ error: 'auth.2fa_invalid' });
      }

      // 인증 성공 처리
      db.prepare(`
        UPDATE users
        SET is_2fa_enabled = 1,
            two_fa_code = NULL,
            two_fa_expires_at = NULL
        WHERE id = ?
      `).run(user.id);

      const finalToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      reply.send({ token: finalToken });

    } catch (err) {
      console.error('2FA verification error:', err);
      reply.code(500).send({ error: 'auth.2fa_verification_failed' });
    }
  });

  app.get('/users', async () => {
    const users = db.prepare('SELECT id, username, email FROM users').all();
    return users;
  });
}