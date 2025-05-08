import { FastifyInstance } from 'fastify';
import db from '../db/db';
import { FriendRow } from '../types';
import { authenticateToken } from './authMiddleware';

export async function friendsRoutes(app: FastifyInstance) {
  // Register the authentication check for all routes in this plugin
  app.addHook('preHandler', authenticateToken);

  // Get friends data for a user
  app.get('/friends', async (request, reply) => {
    try {
      console.log('Friends endpoint accessed');
      const userId = request.user!.id;
      const query = `
        SELECT
          u.id,
          u.username,
          uf.status
        FROM
          users u
        JOIN
          user_friends uf ON u.id = uf.friend_id
        WHERE
          uf.user_id = ?
        ORDER BY
          u.username
      `;
      const rows = db.prepare(query).all(userId) as FriendRow[];
      console.log(`Retrieved ${rows.length} friends entries`);
      
      const friends = rows.map(row => ({
        id: row.id,
        username: row.username,
        status: row.status
      }));
      
      return { friends };
    } catch (error) {
      console.error('Error fetching friends:', error);
      reply.code(500).send({ error: 'Failed to fetch friends data' });
    }
  });

  // Add a friend
  app.post('/friends', async (request, reply) => {
    try {
      const { friendId } = request.body as { friendId: number };
      const userId = request.user!.id;
      
      // Validate friendId
      if (!friendId) {
        return reply.code(400).send({ error: 'Friend ID is required' });
      }
      
      // Check if the friend exists
      const friendExists = db.prepare('SELECT id FROM users WHERE id = ?').get(friendId);
      if (!friendExists) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      // Check if friendship already exists
      const existingFriendship = db.prepare(
        'SELECT * FROM user_friends WHERE user_id = ? AND friend_id = ?'
      ).get(userId, friendId);
      
      if (existingFriendship) {
        return reply.code(409).send({ error: 'Friend already added' });
      }
      
      const query = `
        INSERT INTO user_friends (user_id, friend_id, status)
        VALUES (?, ?, 'offline')
      `;
      db.prepare(query).run(userId, friendId);
      
      reply.code(200).send({ message: 'Friend added successfully' });
    } catch (error) {
      console.error('Error adding friend:', error);
      reply.code(500).send({ error: 'Failed to add friend' });
    }
  });

  // Remove a friend
  app.delete('/friends', async (request, reply) => {
    try {
      const { friendId } = request.body as { friendId: number };
      const userId = request.user!.id;
      
      // Validate friendId
      if (!friendId) {
        return reply.code(400).send({ error: 'Friend ID is required' });
      }
      
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
      console.error('Error removing friend:', error);
      reply.code(500).send({ error: 'Failed to remove friend' });
    }
  });
}