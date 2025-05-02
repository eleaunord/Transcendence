// src/routes/match.ts

import { FastifyInstance } from 'fastify';
import db from '../db/db';

export async function matchRoutes(app: FastifyInstance) {
  // Créer un nouveau match
  app.post('/match/start', async (req, reply) => {
    const { player1, player2 } = req.body as { player1: string, player2: string };

    const stmt = db.prepare(`
      INSERT INTO match (player1, player2) VALUES (?, ?)
    `);
    const result = stmt.run(player1, player2);

    reply.send({ matchId: result.lastInsertRowid });
  });

  // Enregistrer le score d’un match terminé
  app.post('/match/end', async (req, reply) => {
    const { matchId, score1, score2 } = req.body as { matchId: number, score1: number, score2: number };

    const winner = score1 > score2 ? 'player1' : 'player2';

    const stmt = db.prepare(`
      UPDATE match SET score1 = ?, score2 = ?, winner = ? WHERE id = ?
    `);
    stmt.run(score1, score2, winner, matchId);

    reply.send({ status: 'match updated' });
  });

  // Afficher l’historique d’un joueur
  app.get('/match/history', async (req, reply) => {
    const player = (req.query as any).player;

    const stmt = db.prepare(`
      SELECT * FROM match
      WHERE player1 = ? OR player2 = ?
      ORDER BY played_at DESC
    `);
    const matches = stmt.all(player, player);

    reply.send(matches);
  });
}
