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
import { FastifyReply, FastifyRequest } from 'fastify'; 

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost';

async function preventIfLoggedIn(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      jwt.verify(token, JWT_SECRET);
      // token is valid → user is “logged in”
      return reply
        .code(400)
        .send({ error: 'auth.already_authenticated', message: 'You must log out before signing in or signing up again.' });
    } catch (_err) {
      // token invalid or expired → allow them through
    }
  }
}

export async function authRoutes(app: FastifyInstance) {
  // ----- Route de validation de token ----- \\
  app.get('/validate-token', async (req, reply) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ valid: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; pending_2fa?: boolean };

    // Get user info
    const user = db.prepare('SELECT id, username, email, image, is_2fa_enabled FROM users WHERE id = ?').get(decoded.userId) as User | undefined;
    
    if (!user) {
      return reply.code(401).send({ valid: false, error: 'User not found' });
    }

    // If user has 2FA enabled and token is marked as pending 2FA
    if (user.is_2fa_enabled && decoded.pending_2fa) {
      return reply.code(403).send({ 
        valid: false, 
        error: '2FA verification required',
        pending_2fa: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    }

    // Token is fully valid
    reply.send({ 
      valid: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        image: user.image
      }
    });

  } catch (err: any) {
    console.log('[TokenValidation] Invalid token:', err.message);
    reply.code(401).send({ valid: false, error: 'Invalid token' });
  }
  });
  
 // ----- Authentification Classique ------ \\
  app.post('/signup', { preHandler: preventIfLoggedIn }, async (req, reply) => {
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

  app.post('/login', { preHandler: preventIfLoggedIn }, async (req, reply) => {
    const { username, password } = req.body as any;

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;

    if (!user) return reply.code(401).send({ error: 'auth.user_not_found' });

    const match = await bcrypt.compare(password, user.password_hash || '');
    if (!match) return reply.code(401).send({ error: 'auth.incorrect_password' });

    // Create payload based on 2FA status
    const payload: any = { userId: user.id };
    
    // If 2FA is enabled, mark token as pending 2FA verification
    if (user.is_2fa_enabled) {
      payload.pending_2fa = true;
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    console.log('[STANDARD LOGIN] USER EMAIL:', user.email, 'HAS_2FA:', !!user.is_2fa_enabled);

    reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        is_2fa_enabled: !!user.is_2fa_enabled,
        seen_2fa_prompt: !!user.seen_2fa_prompt,
      },
      requires_2fa: !!user.is_2fa_enabled // Add explicit flag
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
// ----- 2FA Enable -----
app.post('/enable-2fa', async (req, reply) => {
  try {
    // 1) Authenticate & parse token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'auth.unauthorized' });
    }
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // 2) Load the user
    const user = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(decoded.userId) as User | undefined;
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    // 3) Generate a new code + expiry
    const code = generate2FACode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // valid 5 minutes

    // 4) Mark 2FA enabled AND store the code
    db.prepare(`
      UPDATE users SET
        is_2fa_enabled     = 1,
        two_fa_code        = ?,
        two_fa_expires_at  = ?
      WHERE id = ?
    `).run(code, expiresAt.toISOString(), decoded.userId);

    // 5) Send the email
    await sendEmail(
      user.email,
      'Your 2FA Code',
      `Your code is ${code}. It will expire in 5 minutes.`
    );

    // 6) Reply success
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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; pending_2fa?: boolean };

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

    // Clear 2FA code from database
    db.prepare(`
      UPDATE users
      SET two_fa_code = NULL,
          two_fa_expires_at = NULL
      WHERE id = ?
    `).run(user.id);

    // Create a new token WITHOUT the pending_2fa flag
    const finalToken = jwt.sign(
      { userId: user.id }, // No pending_2fa flag
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    reply.send({ 
      token: finalToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        image: user.image
      }
    });

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