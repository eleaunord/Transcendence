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

  app.patch('/me/image', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'Missing token' });
  
    try {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const userId = payload.userId;
  
      const { image } = req.body as { image: string };
      if (!image || typeof image !== 'string') {
        return reply.code(400).send({ error: 'Invalid image data' });
      }
  
      db.prepare('UPDATE users SET image = ? WHERE id = ?').run(image, userId);
  
      const updatedUser = db.prepare('SELECT id, username, email, image FROM users WHERE id = ?').get(userId);
      reply.send(updatedUser);
    } catch (err) {
      reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });

  app.get('/me/export', async (req, reply) => {
    const auth = req.headers.authorization;
    console.log('[EXPORT API] Authorization header:', auth); // debug 추가

    if (!auth)
      return reply.code(401).send({ error: 'Missing token' });
  
    try {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const userId = payload.userId;
  
      const user = db.prepare(`
        SELECT username, email, image, google_id, is_2fa_enabled, created_at
        FROM users WHERE id = ?
      `).get(userId);
  
      if (!user) return reply.code(404).send({ error: 'User not found' });
  
      reply.header('Content-Type', 'application/json');
      reply.header('Content-Disposition', 'attachment; filename="my-data.json"');
      reply.send(user);
    } catch (err) {
      console.error('[EXPORT API] JWT verification failed:', err); // debug 추가
      reply.code(500).send({ error: 'Server error during export' });
    }
  });

  app.delete('/me', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'Missing token' });
  
    try {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const userId = payload.userId;
  
      // 실제 삭제 (ON DELETE CASCADE 가 있으면 연관 테이블도 자동 정리됨)
      const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  
      if (result.changes > 0) {
        reply.send({ message: 'User deleted successfully' });
      } else {
        reply.code(404).send({ error: 'User not found' });
      }
    } catch (err) {
      console.error('Delete error:', err);
      reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });
}
