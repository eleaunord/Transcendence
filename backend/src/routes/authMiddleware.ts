import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import db from '../db/db';
import { User } from '../types';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;

// Add custom types for Fastify to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; pending_2fa?: boolean };
    
    // Check if user exists first
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as User | undefined;
    if (!user) {
      console.warn('[auth] User not found with ID:', decoded.userId);
      return reply.code(401).send({ error: 'User not found' });
    }

    // For 2FA-enabled users, check if they need to complete 2FA
    if (user.is_2fa_enabled && decoded.pending_2fa) {
      return reply.code(403).send({
        error: '2FA verification required',
        pending_2fa: true,
        redirect: '/2fa?mode=input'
      });
    }

    // Add user object to request
    request.user = user;
  } catch (err) {
    console.warn('[auth] Token verification failed:', err);
    return reply.code(401).send({ error: 'Invalid token' });
  }
}