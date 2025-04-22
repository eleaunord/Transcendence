import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
import db from '../db/db';
import { User } from '../types'; 

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8081';

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/signup', async (req, reply) => {
    const { username, email, password } = req.body as any;
    if (!username || !email || !password) {
      return reply.code(400).send({ error: 'All fields are required' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) return reply.code(409).send({ error: 'Username or email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, hashed);

    // On récupère le user pour générer un token
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User;
    if (!user) {
      return reply.code(500).send({ error: 'User creation failed' });}
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    reply.code(201).send({ message: 'User created successfully', token });  
  });

  app.post('/api/login', async (req, reply) => {
    const { username, password } = req.body as any;

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;

    if (!user) return reply.code(401).send({ error: 'Username not found' });

    const match = await bcrypt.compare(password, user.password_hash || '');
    if (!match) return reply.code(401).send({ error: 'Incorrect password' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    reply.send({ token });
  });

  app.get('/api/auth/google', async (_, reply) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URL}&response_type=code&scope=profile email&access_type=offline`;
    reply.redirect(authUrl);
  });

  interface GoogleUser {
    id: string;
    email: string;
    name: string;
    picture: string;
  }
  

  app.get('/api/auth/google/callback', async (req, reply) => {
    const { code } = req.query as { code: string };
    if (!code) return reply.code(400).send({ error: 'Missing code' });

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
      
      // const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      //   code,
      //   client_id: GOOGLE_CLIENT_ID,
      //   client_secret: GOOGLE_CLIENT_SECRET,
      //   redirect_uri: GOOGLE_REDIRECT_URL,
      //   grant_type: 'authorization_code',
      // });

      // const accessToken = tokenRes.data.access_token;

      // const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      // });

      // const { id: googleId, email, name, picture } = userInfo.data;

      let username = name.replace(/\s+/g, '_');
      let suffix = 1;
      while (db.prepare('SELECT * FROM users WHERE username = ?').get(username)) {
        username = `${name}_${suffix++}`;
      }

      let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId) as User | undefined;

      if (!user) {
        const res = db.prepare(
          'INSERT INTO users (username, email, google_id, image) VALUES (?, ?, ?, ?)'
        ).run(username, email, googleId, picture);

        user = db.prepare('SELECT * FROM users WHERE id = ?').get(res.lastInsertRowid) as User;
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      reply.redirect(`${FRONTEND_URL}/profile-creation?token=${token}`);
    } catch (err: any) {
      console.error('Google Auth Error:', err?.response?.data || err.message);
      reply.code(500).send({ error: 'Authentication failed' });
    }
  });
  app.get('/api/users', async () => {
    const users = db.prepare('SELECT id, username, email FROM users').all();
    return users;
  });
}
