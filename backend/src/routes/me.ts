import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import db from '../db/db';
import dotenv from 'dotenv';
import { authenticateToken } from './authMiddleware';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export async function meRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticateToken);

  app.get('/me', async (req, reply) => {
    const userId = req.user?.id;
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

    const user = db.prepare(`
      SELECT id, username, email, image, theme, is_2fa_enabled, seen_2fa_prompt
      FROM users WHERE id = ?
    `).get(userId);

    if (!user) return reply.code(404).send({ error: 'User not found' });
    
    const friends = db.prepare(`
      SELECT pf.id, pf.username, pf.status, pf.profile_picture
      FROM potential_friends pf
      JOIN user_friends upf ON pf.id = upf.friend_id
      WHERE upf.user_id = ? AND upf.is_friend = 1
      ORDER BY pf.username
    `).all(userId);

    const potentialFriends = db.prepare(`
      SELECT pf.id, pf.username, pf.status, pf.profile_picture
      FROM potential_friends pf
      LEFT JOIN user_friends upf ON pf.id = upf.friend_id AND upf.user_id = ?
      WHERE upf.is_friend IS NULL OR upf.is_friend = 0
      ORDER BY pf.username
    `).all(userId);
      // === Construction de l'objet de retour ===
      reply.send({
        ...user,
        friends,
        potentialFriends
      });
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
      const updatedUser = db.prepare('SELECT id, username, email, image, theme FROM users WHERE id = ?').get(userId);
      reply.send(updatedUser);

    } catch (err) {
      reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });

  app.post('/me/seen-2fa', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'Missing token' });
  
    try {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
      db.prepare('UPDATE users SET seen_2fa_prompt = 1 WHERE id = ?').run(payload.userId);
      reply.send({ message: 'seen_2fa_prompt updated' });
    } catch (err) {
      reply.code(401).send({ error: 'Invalid token' });
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


  app.patch('/me/theme', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'Missing token' });
  
    try {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const userId = payload.userId;
  
      const { theme } = req.body as { theme: string };
      if (!theme || typeof theme !== 'string') {
        return reply.code(400).send({ error: 'Invalid theme data' });
      }
  
      db.prepare('UPDATE users SET theme = ? WHERE id = ?').run(theme, userId);
  
      const updatedUser = db.prepare('SELECT id, username, email, image, theme FROM users WHERE id = ?').get(userId);
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
        SELECT username, email, image, theme, google_id, is_2fa_enabled, created_at
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

  // PATCH /api/me/2fa
  app.patch('/me/2fa', async (req, reply) => {
    const userId = req.user?.id;
    if (!userId)
        return reply.code(401).send({ error: 'Unauthorized' });

    const { enable } = req.body as { enable: boolean };

    if (typeof enable !== 'boolean') {
      return reply.code(400).send({ error: 'Missing or invalid "enable" field' });
    }

    const stmt = db.prepare('UPDATE users SET is_2fa_enabled = ? WHERE id = ?');
    stmt.run(enable ? 1 : 0, userId);

    reply.send({ success: true, is_2fa_enabled: enable });
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

