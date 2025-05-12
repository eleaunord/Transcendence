import { FastifyInstance } from 'fastify';
import db from '../db/db';
import { LeaderboardRow } from '../types';

export function leaderboardRoutes(app: FastifyInstance) {
  // Get leaderboard data - top players by total points
  app.get('/leaderboard', async (request, reply) => {
    try {
      console.log('Leaderboard endpoint accessed');
      
      //how many times each user was marked as winner_id in the games table.
      const query = `
        SELECT
          u.id,
          u.username,
          COUNT(g.id) as wins
        FROM users u
        LEFT JOIN games g ON u.id = g.winner_id
        GROUP BY u.id, u.username
        ORDER BY wins DESC
        LIMIT 10
      `;
      const rows = db.prepare(query).all();
      const leaderboard = rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        totalPoints: row.wins * 10 // 1 win = 10 points
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
