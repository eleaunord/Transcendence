import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import db from '../db/db';
import dotenv from 'dotenv';
import { authenticateToken } from './authMiddleware';
import { generateAnonymousUsername } from '../utils/anonymize';
import { RecentGame } from '../types';


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

type ExportedGame = {
  game_id: number;
  user_id: number;
  opponent_id: number;
  winner_id: number;
  created_at: string;
  user_username: string | null;
  opponent_username: string | null;
};

export async function meRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticateToken);

  app.get('/me', async (req, reply) => {
    const userId = req.user?.id;
    if (!userId) return reply.code(401).send({ error: 'me.error.unauthorized' });

    const user = db.prepare(`
      SELECT id, username, email, image, theme, is_2fa_enabled, seen_2fa_prompt
      FROM users WHERE id = ?
    `).get(userId);

    if (!user) return reply.code(404).send({ error: 'me.error.user_not_found' });
    
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
      if (!req.user) {
        console.error('[me] req.user est undefined malgré token valide');
        return reply.code(500).send({ error: 'Internal error: missing user' });
      }
      
    });
  
  app.get('/me/recent-games', async (req, reply) => {
    const userId = req.user?.id;
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

    try {
      const games = db.prepare(`
        SELECT created_at, opponent_id
        FROM games
        WHERE user_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT 3
      `).all(userId) as { created_at: string; opponent_id: number }[];

      const formatted = games.map((game) => {
        const date = new Date(game.created_at);
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = `${month}/${day}/${year}`;

        // Map opponent_id to name
        let opponentName = 'Unknown';
        if (game.opponent_id === 2) opponentName = 'AI';
        else if (game.opponent_id === 3) opponentName = 'Guest';

        return `You played a game against ${opponentName} at ${time} on ${formattedDate}.`;
      });

      reply.send(formatted);
    } catch (err) {
      console.error('Error fetching recent games:', err);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  
   // Mise à jour du username
  app.patch('/me', async (req, reply) => {
   const auth = req.headers.authorization;
   if (!auth) return reply.code(401).send({ error: 'me.error.missing_token' });
   try {
     const token = auth.split(' ')[1];
     const payload = jwt.verify(token, JWT_SECRET) as any;
     const userId = payload.userId;

     const { username } = req.body as { username: string };
    
      // Vérification du username (3 à 20 caractères, lettres, chiffres ou underscore)
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!username || typeof username !== 'string' || !usernameRegex.test(username)) {
      return reply.code(400).send({
        error: 'me.error.invalid_username'
      });
      }
      // Mise à jour en base de données
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, userId);

      // On retourne l'utilisateur mis à jour
      const updatedUser = db.prepare('SELECT id, username, email, image, theme FROM users WHERE id = ?').get(userId);
      reply.send(updatedUser);

    } catch (err) {
      reply.code(401).send({ error: 'me.error.missing_token' });
    }
  });

  app.post('/me/seen-2fa', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'me.error.missing_token' });
  
    try {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
      db.prepare('UPDATE users SET seen_2fa_prompt = 1 WHERE id = ?').run(payload.userId);
      reply.send({ message: 'me.updated.seen2fa' });
    } catch (err) {
      reply.code(401).send({ error: 'me.error.invalid_token' });
    }
  });

  app.patch('/me/image', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'me.error.missing_token' });
  
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
      reply.code(401).send({ error: 'me.error.invalid_token' });
    }
  });


  app.patch('/me/theme', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'me.error.missing_token' });
  
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
      reply.code(401).send({ error: 'me.error.invalid_token' });
    }
  });

  //test 1705 
  app.get('/me/export', async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return reply.status(401).send({ error: 'me.error.missing_token' });
  
    const token = authHeader.split(' ')[1];
    let payload: any;
  
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return reply.status(401).send({ error: 'me.error.invalid_token' });
    }
  
    const userId = payload.userId;
  
    // 유저 정보 가져오기
    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
  
    // 참여한 게임 가져오기
    const games = db.prepare(`
      SELECT 
        g.id as game_id,
        g.user_id,
        g.opponent_id,
        g.winner_id,
        g.created_at,
        u1.username as user_username,
        u2.username as opponent_username
      FROM games g
      LEFT JOIN users u1 ON g.user_id = u1.id
      LEFT JOIN users u2 ON g.opponent_id = u2.id
      WHERE g.user_id = ? OR g.opponent_id = ?
    `).all(userId, userId) as ExportedGame[];;
  
    // 게스트 opponent/user 이름 보정
    for (const game of games) {
      if (game.opponent_id < 0 && !game.opponent_username) {
        game.opponent_username = 'Invité';
      }
      if (game.user_id < 0 && !game.user_username) {
        game.user_username = 'Invité';
      }
    }

    // 게임별 점수 가져오기
    const gameScores = db.prepare(`
      SELECT 
        s.game_id,
        s.player_id,
        u.username,
        s.score
      FROM scores s
      JOIN users u ON s.player_id = u.id
      WHERE s.player_id = ?
    `).all(userId);
  
    const exportData = {
      user,
      games,
      scores: gameScores,
    };
  
    const json = JSON.stringify(exportData, null, 2);
    reply
      .header('Content-Type', 'application/json')
      .header('Content-Disposition', 'attachment; filename=mes-donnees.json')
      .send(json);
  });

  // PATCH /api/me/2fa
  app.patch('/me/2fa', async (req, reply) => {
    const userId = req.user?.id;
    if (!userId)
        return reply.code(401).send({ error: 'me.error.unauthorized' });

    const { enable } = req.body as { enable: boolean };

    if (typeof enable !== 'boolean') {
      return reply.code(400).send({ error: 'Missing or invalid "enable" field' });
    }

    const stmt = db.prepare('UPDATE users SET is_2fa_enabled = ? WHERE id = ?');
    stmt.run(enable ? 1 : 0, userId);

    reply.send({ success: true, is_2fa_enabled: enable });
  });
  
  app.delete('/me/anonymize', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'me.error.missing_token' });

    try {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const userId = payload.userId;

      // create an anonymous username 유저네임 익명화해줌.
      const anonymizedName = generateAnonymousUsername(userId);

      const stmt = db.prepare(`
        UPDATE users
        SET
          email = NULL,
          username = ?,
          password_hash = NULL,
          image = NULL,
          google_id = NULL,
          is_2fa_enabled = 0,
          seen_2fa_prompt = 0
        WHERE id = ?
      `);
      stmt.run(anonymizedName, userId);

      return reply.code(200).send({ message: 'me.anonymized.success' });
    } catch (err: any) {
      console.error('me.anonymized.failed:', err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

app.delete('/me', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) {
      return reply.code(401).send({ error: 'me.error.missing_token' });
    }

    let payload: any;
    try {
      payload = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    } catch {
      return reply.code(401).send({ error: 'me.error.invalid_token' });
    }
    const userId: number = payload.userId;

    try {
      // wrap in one transaction so either ALL deletes succeed or none do
      db.transaction(() => {
        // 1) delete every score in games the user ever played (whether player_id === them or not)
        db.prepare(`
          DELETE FROM scores
          WHERE game_id IN (
            SELECT id FROM games
            WHERE user_id = ? OR opponent_id = ?
          )
        `).run(userId, userId);

        // 2) just in case there are stray scores not covered above
        db.prepare(`DELETE FROM scores WHERE player_id = ?`)
          .run(userId);

        // 3) delete memory_games
        db.prepare(`DELETE FROM memory_games WHERE user_id = ?`)
          .run(userId);

        // 4) delete all friend‐relations
        db.prepare(`
          DELETE FROM user_friends
          WHERE user_id = ? OR friend_id = ?
        `).run(userId, userId);

        // 5) now delete the games themselves
        db.prepare(`
          DELETE FROM games
          WHERE user_id = ? OR opponent_id = ?
        `).run(userId, userId);

        // 6) finally delete the user
        const result = db.prepare(`DELETE FROM users WHERE id = ?`)
                         .run(userId);
        if (result.changes === 0) {
          throw new Error('me.error.user_not_found');
        }
      })();

      return reply.send({ message: 'me.deleted.success' });
    } catch (err: any) {
      console.error('Delete error:', err);

      if (err.message === 'me.error.user_not_found') {
        return reply.code(404).send({ error: err.message });
      }
      return reply.code(500).send({ error: 'me.error.delete_failed' });
    }
  });

}