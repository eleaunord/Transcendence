import { FastifyInstance } from 'fastify';
import db from '../db/db';
import { LeaderboardRow } from '../types';

export function leaderboardRoutes(app: FastifyInstance) {
  // Get leaderboard data - top players by total points
app.get('/leaderboard', async (request, reply) => {
  try {
    console.log('Leaderboard endpoint accessed');

    const query = `
      SELECT
        u.id,
        u.username,
        SUM(s.score) AS totalPoints
      FROM users u
      LEFT JOIN scores s ON u.id = s.player_id
      GROUP BY u.id, u.username
      ORDER BY totalPoints DESC
      LIMIT 5
    `;

    const rows = db.prepare(query).all();

    const leaderboard = rows.map((row: any) => ({
      id: row.id,
      username: row.username,
      totalPoints: row.totalPoints || 0
    }));

    // CORS headers
    reply.header('Access-Control-Allow-Origin', 'https://localhost');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
    reply.header('Cache-Control', 'no-store');

    

    return { leaderboard };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    reply.status(500).send({ error: 'Failed to fetch leaderboard data' });
  }
});


  
  // Add an OPTIONS handler for CORS preflight requests
  app.options('/api/leaderboard', (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'https://localhost');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
    reply.send();
  });
}
