import { FastifyInstance } from 'fastify';
import db from '../db/db';

export async function matchRoutes(app: FastifyInstance) {
  // Créer un nouveau match (game + scores)
  app.post('/match/start', async (req, reply) => {
    const { user_id, opponent_id } = req.body as {
      user_id: number;
      opponent_id: number;
    };

    console.log('📥 Reçu POST /match/start', { user_id, opponent_id });

    try {
      const stmtGame = db.prepare(`
        INSERT INTO games (user_id, opponent_id) VALUES (?, ?)
      `);
      const result = stmtGame.run(user_id, opponent_id);
      const gameId = result.lastInsertRowid as number;

      console.log('✅ Match inséré avec gameId =', gameId);

      const stmtScore = db.prepare(`
        INSERT INTO scores (game_id, player_id, score) VALUES (?, ?, ?)
      `);
      stmtScore.run(gameId, user_id, 0);
      stmtScore.run(gameId, opponent_id, 0);

      reply.send({ status: 'created', gameId });
    } catch (err) {
      console.error('❌ Erreur lors de la création du match :', err);
      reply.status(500).send({ error: 'Match creation failed' });
    }
  });

  // Enregistrer les scores à la fin d’un match
  app.post('/match/end', async (req, reply) => {
    const { gameId, user_id, opponent_id, score1, score2 } = req.body as {
      gameId: number;
      user_id: number;
      opponent_id: number;
      score1: number;
      score2: number;
    };

    const winner_id = score1 > score2 ? user_id : opponent_id;

    db.prepare(`UPDATE scores SET score = ? WHERE game_id = ? AND player_id = ?`)
      .run(score1, gameId, user_id);
    db.prepare(`UPDATE scores SET score = ? WHERE game_id = ? AND player_id = ?`)
      .run(score2, gameId, opponent_id);

    db.prepare(`UPDATE games SET winner_id = ? WHERE id = ?`)
      .run(winner_id, gameId);

    console.log('🎯 Match mis à jour', { gameId, score1, score2, winner_id });

    reply.send({ status: 'match updated', winner_id });
  });

  // Historique d’un joueur
  app.get('/match/history', async (req, reply) => {
    const playerId = parseInt((req.query as any).player_id);

    const stmt = db.prepare(`
      SELECT g.id as game_id, g.created_at, g.winner_id,
             u1.username as player1, u2.username as player2,
             s1.score as score1, s2.score as score2
      FROM games g
      JOIN users u1 ON g.user_id = u1.id
      JOIN users u2 ON g.opponent_id = u2.id
      JOIN scores s1 ON s1.game_id = g.id AND s1.player_id = u1.id
      JOIN scores s2 ON s2.game_id = g.id AND s2.player_id = u2.id
      WHERE g.user_id = ? OR g.opponent_id = ?
      ORDER BY g.created_at DESC
    `);

    const games = stmt.all(playerId, playerId);
    reply.send(games);
  });

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

  //     reply.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  //     reply.header('Access-Control-Allow-Credentials', 'true');
  //     reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  //     reply.header('Access-Control-Allow-Headers', 'Content-Type');

  //     return { leaderboard };
  //   } catch (error) {
  //     console.error('Error fetching leaderboard:', error);
  //     reply.status(500).send({ error: 'Failed to fetch leaderboard data' });
  //   }
  // });
}