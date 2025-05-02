import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import db from '../db/db';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export async function meRoutes(app: FastifyInstance) {
  app.get('/me', async (req, reply) => {
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
   // Mise à jour du username
   app.patch('/me', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'Missing token' });

    try {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const userId = payload.userId;

      const { username } = req.body as { username: string };
    
      // Vérification du username (3 à 20 caractères, lettres, chiffres ou underscore)
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!username || typeof username !== 'string' || !usernameRegex.test(username)) {
      return reply.code(400).send({
        error: 'Invalid username. Use 3-20 letters, numbers or underscores.'
      });
      }
      // Mise à jour en base de données
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, userId);

      // On retourne l'utilisateur mis à jour
      const updatedUser = db.prepare('SELECT id, username, email, image FROM users WHERE id = ?').get(userId);
      reply.send(updatedUser);

    } catch (err) {
      reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });
}
