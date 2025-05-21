import { FastifyInstance } from 'fastify';
import db from '../db/db';

export async function memoryRoutes(app: FastifyInstance) {
  console.log('✅ memoryRoutes enregistré');

  app.post('/memory/end', async (req, reply) => {
    const {
      user_id,
      opponent,
      score1,
      score2,
      winner,
      pairCount,
      turnTime,
      timestamp,
    } = req.body as {
      user_id: number;
      opponent: string;
      score1: number;
      score2: number;
      winner: string;
      pairCount: number;
      turnTime: number;
      timestamp: string;
    };

    console.log('📥 Reçu POST /memory/end', {
      user_id, opponent, score1, score2, winner, pairCount, turnTime, timestamp
    });

    try {
      const stmt = db.prepare(`
        INSERT INTO memory_games (
          user_id, opponent, score1, score2, winner,
          pair_count, turn_time, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        user_id, opponent, score1, score2, winner,
        pairCount, turnTime, timestamp
      );

      reply.send({ status: 'created' });
    } catch (err) {
      console.error('❌ Erreur lors de la sauvegarde du match Memory :', err);
      reply.status(500).send({ error: 'Memory game save failed' });
    }
  });
}
