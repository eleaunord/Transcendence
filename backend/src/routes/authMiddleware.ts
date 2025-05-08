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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as User | undefined;
    if (!user) {
      return reply.code(401).send({ error: 'User not found' });
    }
    
    // Add user object to request
    request.user = user;
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}