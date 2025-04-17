import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import db from '../db/db';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export async function meRoutes(app: FastifyInstance) {
  app.get('/api/me', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'Missing token' });

    try {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const user = db.prepare('SELECT id, username, email, image FROM users WHERE id = ?').get(payload.userId);
      reply.send(user);
    } catch {
      reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });
}
