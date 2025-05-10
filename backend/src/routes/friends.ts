import { FastifyInstance } from 'fastify';
import db from '../db/db';
import { FriendRow } from '../types';
import { authenticateToken } from './authMiddleware';

export async function friendsRoutes(app: FastifyInstance) {
  // Register the authentication check for all routes in this plugin
  app.addHook('preHandler', authenticateToken);

  /* ==========================
     ✅ Récupération des amis fictifs
     uniquement ceux qui sont marqués "amis"
  ========================== */
  app.get('/friends', async (request, reply) => {
    try {
      console.log('Friends endpoint accessed');
      const userId = request.user!.id;

      // Requête SQL pour récupérer les amis fictifs marqués comme "amis"
      const query = `
        SELECT
          pf.id,
          pf.username,
          pf.status,
          pf.profile_picture
        FROM
          potential_friends pf
        JOIN
          user_friends upf ON pf.id = upf.friend_id
        WHERE
          upf.user_id = ? AND upf.is_friend = 1
        ORDER BY
          pf.username
      `;
      const rows = db.prepare(query).all(userId) as FriendRow[];
      console.log(`✅ Retrieved ${rows.length} friend(s)`);

      // On formatte les données pour le frontend
      const friends = rows.map(row => ({
        id: row.id,
        username: row.username,
        status: row.status,
        profile_picture: row.profile_picture
      }));

      return { friends };
    } catch (error) {
      console.error('❌ Error fetching friends:', error);
      reply.code(500).send({ error: 'Failed to fetch friends data' });
    }
  });

  /* ==========================
     ✅ Ajouter un ami fictif
  ========================== */
  app.post('/friends', async (request, reply) => {
    try {
      const { friendId } = request.body as { friendId: number };
      const userId = request.user!.id;

      // Validation de l'ID
      if (!friendId) {
        return reply.code(400).send({ error: 'Friend ID is required' });
      }

      // Vérification de l'existence de l'ami fictif
      const friendExists = db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(friendId);
      if (!friendExists) {
        return reply.code(404).send({ error: 'Friend not found' });
      }

      // Vérification si le lien existe déjà
      const existingFriendship = db.prepare(
        'SELECT * FROM user_friends WHERE user_id = ? AND friend_id = ?'
      ).get(userId, friendId);

      if (existingFriendship) {
        return reply.code(409).send({ error: 'Friend already added' });
      }

      // Insertion dans la table user_friends
      const query = `
        INSERT INTO user_friends (user_id, friend_id, is_friend)
        VALUES (?, ?, 1)
      `;
      db.prepare(query).run(userId, friendId);

      reply.code(200).send({ message: 'Friend added successfully' });
    } catch (error) {
      console.error('❌ Error adding friend:', error);
      reply.code(500).send({ error: 'Failed to add friend' });
    }
  });

  /* ==========================
     ✅ Supprimer un ami fictif
  ========================== */
  app.delete('/friends', async (request, reply) => {
    try {
      const { friendId } = request.body as { friendId: number };
      const userId = request.user!.id;

      // Validation de l'ID
      if (!friendId) {
        return reply.code(400).send({ error: 'Friend ID is required' });
      }

      // Suppression dans la table user_friends
      const query = `
        DELETE FROM user_friends
        WHERE user_id = ? AND friend_id = ?
      `;
      const result = db.prepare(query).run(userId, friendId);

      if (result.changes === 0) {
        return reply.code(404).send({ error: 'Friend relationship not found' });
      }

      reply.code(200).send({ message: 'Friend removed successfully' });
    } catch (error) {
      console.error('❌ Error removing friend:', error);
      reply.code(500).send({ error: 'Failed to remove friend' });
    }
  });

  /* ==========================
     ✅ Récupérer les amis potentiels (pas encore ajoutés)
  ========================== */
  app.get('/potential-friends', async (request, reply) => {
    try {
      const userId = request.user!.id;

      // Requête pour récupérer tous les amis fictifs qui ne sont pas encore amis
      const query = `
        SELECT
          pf.id,
          pf.username,
          pf.status,
          pf.profile_picture
        FROM
          potential_friends pf
        LEFT JOIN
          user_friends upf ON pf.id = upf.friend_id AND upf.user_id = ?
        WHERE
          upf.is_friend IS NULL OR upf.is_friend = 0
        ORDER BY
          pf.username
      `;
      const rows = db.prepare(query).all(userId) as FriendRow[];

      const potentialFriends = rows.map(row => ({
        id: row.id,
        username: row.username,
        status: row.status,
        profile_picture: row.profile_picture
      }));

      reply.code(200).send({ potentialFriends });
    } catch (error) {
      console.error('❌ Error fetching potential friends:', error);
      reply.code(500).send({ error: 'Failed to fetch potential friends data' });
    }
  });
}
