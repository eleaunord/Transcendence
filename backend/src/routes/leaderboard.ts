import { FastifyInstance } from 'fastify';
import db from '../db/db';

export function leaderboardRoutes(app: FastifyInstance) {
  // Get pong leaderboard data - top players by total points
  app.get('/leaderboard', async (request, reply) => {
    try {
      const query = `
        SELECT
          u.id,
          u.username,
          SUM(s.score) AS totalPoints
        FROM users u
        LEFT JOIN scores s ON u.id = s.player_id
        WHERE u.username NOT IN ('AI','Guest','PlayerOne')
        GROUP BY u.id, u.username
        ORDER BY totalPoints DESC
        LIMIT 10
      `;
      const rows = db.prepare(query).all();
      const leaderboard = rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        totalPoints: row.totalPoints || 0
      }));

      // CORS headers
      reply
        .header('Access-Control-Allow-Origin', 'https://localhost')
        .header('Access-Control-Allow-Credentials', 'true')
        .header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .header('Access-Control-Allow-Headers', 'Content-Type')
        .header('Cache-Control', 'no-store');

      return { leaderboard };
    } catch (error) {
      console.error('Error fetching pong leaderboard:', error);
      reply.status(500).send({ error: 'Failed to fetch pong leaderboard data' });
    }
  });

  // Get memory leaderboard data - top players by number of memory match wins
  app.get('/memory-leaderboard', async (request, reply) => {
    try {
      // 1 point for each game where score1 > score2
      const query = `
        SELECT
          u.id,
          u.username,
          COUNT(mg.id) AS totalGames,
          SUM(CASE WHEN mg.score1 > mg.score2 THEN 1 ELSE 0 END) AS totalPoints
        FROM users u
        INNER JOIN memory_games mg ON u.id = mg.user_id
        WHERE u.username NOT IN ('AI','Guest','PlayerOne')
        GROUP BY u.id, u.username
        HAVING totalGames > 0
        ORDER BY totalPoints DESC, totalGames DESC
        LIMIT 10
      `;
      const rows = db.prepare(query).all();
      let leaderboard = rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        totalPoints: row.totalPoints || 0,
        totalGames: row.totalGames || 0
      }));

      // Fallback empty state
      if (leaderboard.length === 0) {
        const fakeUsers = db.prepare(`
          SELECT id, username FROM users
          WHERE username NOT IN ('AI','Guest','PlayerOne')
          LIMIT 5
        `).all();
        leaderboard = fakeUsers.map((user: any) => ({
          id: user.id,
          username: user.username,
          totalPoints: 0,
          totalGames: 0
        }));
      }

      // CORS headers
      reply
        .header('Access-Control-Allow-Origin', 'https://localhost')
        .header('Access-Control-Allow-Credentials', 'true')
        .header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .header('Access-Control-Allow-Headers', 'Content-Type')
        .header('Cache-Control', 'no-store');

      return { leaderboard };
    } catch (error) {
      console.error('Error fetching memory leaderboard:', error);
      reply.status(500).send({ error: 'Failed to fetch memory leaderboard data' });
    }
  });

  // CORS preflight for Pong
  app.options('/leaderboard', (request, reply) => {
    reply
      .header('Access-Control-Allow-Origin', 'https://localhost')
      .header('Access-Control-Allow-Credentials', 'true')
      .header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .header('Access-Control-Allow-Headers', 'Content-Type')
      .send();
  });

  // CORS preflight for Memory
  app.options('/memory-leaderboard', (request, reply) => {
    reply
      .header('Access-Control-Allow-Origin', 'https://localhost')
      .header('Access-Control-Allow-Credentials', 'true')
      .header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .header('Access-Control-Allow-Headers', 'Content-Type')
      .send();
  });
}
