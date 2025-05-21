import { FastifyInstance } from 'fastify';
import db from '../db/db';
import { authenticateToken } from './authMiddleware';

export async function matchRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticateToken);

  app.post('/match/start', async (req, reply) => {
    const user_id = req.user?.id;
    const { opponent_id } = req.body as { opponent_id: number };

    if (!user_id) return reply.status(401).send({ error: 'Unauthorized' });

    try {
      const result = db.prepare(`
        INSERT INTO games (user_id, opponent_id) VALUES (?, ?)
      `).run(user_id, opponent_id);

      const gameId = result.lastInsertRowid as number;

      db.prepare(`INSERT INTO scores (game_id, player_id, score) VALUES (?, ?, ?)`)
        .run(gameId, user_id, 0);
      db.prepare(`INSERT INTO scores (game_id, player_id, score) VALUES (?, ?, ?)`)
        .run(gameId, opponent_id, 0);

      reply.send({ status: 'created', gameId });
    } catch (err) {
      console.error('❌ Erreur lors de la création du match :', err);
      reply.status(500).send({ error: 'Match creation failed' });
    }
  });

  app.post('/match/end', async (req, reply) => {
    const user_id = req.user?.id;
    const { gameId, opponent_id, score1, score2 } = req.body as {
      gameId: number;
      opponent_id: number;
      score1: number;
      score2: number;
    };

    if (!user_id) return reply.status(401).send({ error: 'Unauthorized' });

    const winner_id = score1 > score2 ? user_id : opponent_id;

    try {
      db.prepare(`UPDATE scores SET score = ? WHERE game_id = ? AND player_id = ?`)
        .run(score1, gameId, user_id);
      db.prepare(`UPDATE scores SET score = ? WHERE game_id = ? AND player_id = ?`)
        .run(score2, gameId, opponent_id);

      db.prepare(`UPDATE games SET winner_id = ? WHERE id = ?`)
        .run(winner_id, gameId);

      reply.send({ status: 'match updated', winner_id });
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour du match :', err);
      reply.status(500).send({ error: 'Match update failed' });
    }
  });

  app.get('/me/pong-games', { preHandler: authenticateToken }, async (req, reply) => {
    const userId = req.user?.id;
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

    try {
      const stmt = db.prepare(`
        SELECT g.created_at as timestamp,
               u2.username as opponent,
               s1.score as score1,
               s2.score as score2
        FROM games g
        JOIN users u1 ON g.user_id = u1.id
        JOIN users u2 ON g.opponent_id = u2.id
        JOIN scores s1 ON s1.game_id = g.id AND s1.player_id = u1.id
        JOIN scores s2 ON s2.game_id = g.id AND s2.player_id = u2.id
        WHERE g.user_id = ?
        ORDER BY g.created_at DESC
        LIMIT 10
      `);

      const games = stmt.all(userId);
      reply.send(games);
    } catch (err) {
      console.error('❌ Erreur récupération parties Pong :', err);
      reply.status(500).send({ error: 'Pong history failed' });
    }
  });
}

  // app.get('/leaderboard', async (request, reply) => {
  //   try {
  //     console.log('Leaderboard endpoint accessed');

  //     const query = `
  //     SELECT
  //       u.id,
  //       u.username,
  //       COUNT(g.id) as wins
  //     FROM users u
  //     LEFT JOIN games g ON u.id = g.winner_id
  //     GROUP BY u.id, u.username
  //     ORDER BY wins DESC
  //     LIMIT 10
  //   `;

  //     const rows = db.prepare(query).all();

  //     const leaderboard = rows.map((row: any) => ({
  //       id: row.id,
  //       username: row.username,
  //       totalPoints: row.wins * 1000 // 1 victoire = 1000 pts
  //     }));

  //     reply.header('Access-Control-Allow-Origin', 'https://localhost');
  //     reply.header('Access-Control-Allow-Credentials', 'true');
  //     reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  //     reply.header('Access-Control-Allow-Headers', 'Content-Type');

  //     return { leaderboard };
  //   } catch (error) {
  //     console.error('Error fetching leaderboard:', error);
  //     reply.status(500).send({ error: 'Failed to fetch leaderboard data' });
  //   }
  // });