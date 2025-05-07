import { FastifyInstance } from 'fastify';
import db from '../db/db';
import { LeaderboardRow } from '../types';

export function leaderboardRoutes(app: FastifyInstance) {
  // Get leaderboard data - top players by total points
  app.get('/leaderboard', async (request, reply) => {
    try {
      console.log('Leaderboard endpoint accessed');
      
      // Query to get total points for each player across all games
      const query = `
        SELECT
          u.id,
          u.username,
          COALESCE(SUM(s.score), 0) as total_points
        FROM
          users u
        LEFT JOIN
          scores s ON u.id = s.player_id
        GROUP BY
          u.id, u.username
        ORDER BY
          total_points DESC
        LIMIT 10
      `;
      
      // Use Better-SQLite3's API to execute the query and assert the type
      const rows = db.prepare(query).all() as LeaderboardRow[];
      
      console.log(`Retrieved ${rows.length} leaderboard entries`);
      
      // Format the results
      const leaderboard = rows.map(row => ({
        id: row.id,
        username: row.username,
        totalPoints: row.total_points || 0
      }));
      
      // Set the CORS headers explicitly for this route
      reply.header('Access-Control-Allow-Origin', 'http://localhost:8080');
      reply.header('Access-Control-Allow-Credentials', 'true');
      reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type');
      
      return { leaderboard };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      reply.status(500).send({ error: 'Failed to fetch leaderboard data' });
    }
  });
  
  // Add an OPTIONS handler for CORS preflight requests
  app.options('/api/leaderboard', (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
    reply.send();
  });
}
