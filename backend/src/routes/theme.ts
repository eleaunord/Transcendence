import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import db from '../db';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export async function themeRoutes(app: FastifyInstance) {
  app.post('/api/theme', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'Missing token' });

    try {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const { image } = req.body as { image: string };

      db.prepare('UPDATE users SET image = ? WHERE id = ?').run(image, payload.userId);
      reply.send({ message: 'Theme updated' });
    } catch {
      reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });
}
