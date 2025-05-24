import { FastifyInstance } from 'fastify';
import db from '../db/db';


export function leaderboardRoutes(app: FastifyInstance) {
  // Get pong leaderboard data - top players by total points
  app.get('/leaderboard', async (request, reply) => {
    try {
      console.log('Pong leaderboard endpoint accessed');
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
      reply.header('Access-Control-Allow-Origin', 'https://localhost');
      reply.header('Access-Control-Allow-Credentials', 'true');
      reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type');
      reply.header('Cache-Control', 'no-store');
      
      return { leaderboard };
    } catch (error) {
      console.error('Error fetching pong leaderboard:', error);
      reply.status(500).send({ error: 'Failed to fetch pong leaderboard data' });
    }
  });

  // Get memory leaderboard data - top players by memory game performance
  app.get('/memory-leaderboard', async (request, reply) => {
    try {
      console.log('Memory leaderboard endpoint accessed');
      const query = `
        SELECT 
          u.id,
          u.username,
          COUNT(mg.id) as total_games,
          SUM(CASE WHEN mg.winner = u.username THEN 1 ELSE 0 END) as wins,
          SUM(CASE 
            WHEN mg.winner = u.username THEN 
              CASE 
                WHEN mg.pair_count = 8 THEN 100  -- Easy mode win
                WHEN mg.pair_count = 12 THEN 150 -- Medium mode win  
                WHEN mg.pair_count = 18 THEN 200 -- Hard mode win
                ELSE 50 -- Default win points
              END
            ELSE 
              CASE 
                WHEN mg.pair_count = 8 THEN 25   -- Easy mode participation
                WHEN mg.pair_count = 12 THEN 35  -- Medium mode participation
                WHEN mg.pair_count = 18 THEN 50  -- Hard mode participation  
                ELSE 15 -- Default participation points
              END
          END) as totalPoints
        FROM users u
        INNER JOIN memory_games mg ON u.id = mg.user_id
        WHERE u.username NOT IN ('AI','Guest','PlayerOne')
        GROUP BY u.id, u.username
        HAVING total_games > 0
        ORDER BY totalPoints DESC, wins DESC, total_games DESC
        LIMIT 10
      `;


      const rows = db.prepare(query).all();

      let leaderboard = rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        totalPoints: row.totalPoints || 0,
        wins: row.wins || 0,
        totalGames: row.total_games || 0
      }));

      // If empty, return fake data using users table
      if (leaderboard.length === 0) {
        const fakeUsers = db.prepare(`
          SELECT id, username FROM users
          WHERE username NOT IN ('AI', 'Guest','PlayerOne')
          LIMIT 5
        `).all();

        leaderboard = fakeUsers.map((user: any, index: number) => ({
          id: user.id,
          username: user.username,
          totalPoints: 0,
          wins: 0,
          totalGames: 0
        }));
      }


      // CORS headers
      reply.header('Access-Control-Allow-Origin', 'https://localhost');
      reply.header('Access-Control-Allow-Credentials', 'true');
      reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type');
      reply.header('Cache-Control', 'no-store');
      
      return { leaderboard };
    } catch (error) {
      console.error('Error fetching memory leaderboard:', error);
      reply.status(500).send({ error: 'Failed to fetch memory leaderboard data' });
    }
  });

  // Add OPTIONS handlers for CORS preflight requests
  app.options('/leaderboard', (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'https://localhost');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
    reply.send();
  });

  app.options('/memory-leaderboard', (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'https://localhost');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
    reply.send();
  });
}