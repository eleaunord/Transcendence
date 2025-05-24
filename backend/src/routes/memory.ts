import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateToken } from './authMiddleware';
import db from '../db/db';

export async function memoryRoutes(app: FastifyInstance) {
  console.log('✅ memoryRoutes enregistré');

  app.addHook('preHandler', authenticateToken);

  app.post('/memory/end', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user?.id;
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

    const {
      opponent,
      score1,
      score2,
      winner,
      pairCount,
      turnTime,
      timestamp,
    } = req.body as {
      opponent: string;
      score1: number;
      score2: number;
      winner: string;
      pairCount: number;
      turnTime: number;
      timestamp: string;
    };

    console.log('📥 Reçu POST /memory/end', {
      user_id: userId, opponent, score1, score2, winner, pairCount, turnTime, timestamp
    });

    try {
      const stmt = db.prepare(`
        INSERT INTO memory_games (
          user_id, opponent, score1, score2, winner,
          pair_count, turn_time, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        userId, opponent, score1, score2, winner,
        pairCount, turnTime, timestamp
      );

      reply.send({ status: 'created' });
    } catch (err) {
      console.error('❌ Erreur lors de la sauvegarde du match Memory :', err);
      reply.status(500).send({ error: 'Memory game save failed' });
    }
  });


  app.get('/me/memory-games', async (req, reply) => {
    const userId = req.user?.id;
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

    try {
      const games = db.prepare(`
        SELECT opponent, score1, score2, winner, timestamp
        FROM memory_games
        WHERE user_id = ?
        ORDER BY timestamp DESC
        LIMIT 10
      `).all(userId);

      reply.send(games);
    } catch (err) {
      console.error('❌ Erreur récupération parties Memory :', err);
      reply.status(500).send({ error: 'Memory history failed' });
    }
  });



}

