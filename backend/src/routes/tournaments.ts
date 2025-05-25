
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import db from '../db/db';

type Player = {
  id: string;
  name: string;
  source: 'friend' | 'guest';
  avatar?: string;
};

type TournamentPlayerDB = {
  player_id: number;
  source: string;
  avatar: string | null;
  name: string | null;
};

type UserDB = {
  username: string;
};

export default async function tournaments(fastify: FastifyInstance) {
  fastify.log.info(' Plugin tournaments chargé');

  // === Route POST : Créer un tournoi
  fastify.post('/tournaments/create', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      fastify.log.info(' Requête reçue sur /api/tournaments/create');
      const { players, name } = request.body as { players: Player[], name: string };

      if (!players || players.length < 2) {
        fastify.log.warn(' Pas assez de joueurs reçus');
        return reply.code(400).send({ error: 'Il faut au moins 2 joueurs pour créer un tournoi.' });
      }

      fastify.log.info(` Joueurs reçus : ${JSON.stringify(players)}`);
      fastify.log.info(` Nom du tournoi : ${name}`);

      const insertTournament = db.prepare(`INSERT INTO tournaments (name) VALUES (?)`);
      const result = insertTournament.run(name);
      const tournamentId = result.lastInsertRowid as number;

      fastify.log.info(` Tournoi créé avec ID : ${tournamentId}`);

      const insertPlayer = db.prepare(`
        INSERT INTO tournament_players (tournament_id, player_id, source, avatar, name)
        VALUES (?, ?, ?, ?, ?)
      `);
        // let guestIDCounter = 4;
        // Avant la boucle sur les joueurs :
        
        players.forEach(player => {
        let playerId: string;

        if (player.source === 'guest') {
          playerId = player.id; // ✅ 고유 문자열 그대로 저장
        } else {
          playerId = String(player.id);
        }

        insertPlayer.run(tournamentId, playerId, player.source, player.avatar || null, player.name || null);
        });

    //   players.forEach(player => {
    //     let playerId: number;

    //     if (player.source === 'guest') {
    //       playerId = Number(`${Date.now()}${Math.floor(Math.random() * 3) + 4}`);
    //     } else {
    //       playerId = parseInt(player.id, 10);
    //       if (isNaN(playerId)) {
    //         throw new Error(`ID invalide pour le joueur : ${player.name} (id: ${player.id})`);
    //       }
    //     }

    //     fastify.log.info(` Insertion joueur : ${player.name} (ID: ${playerId}, source: ${player.source})`);
    //     insertPlayer.run(tournamentId, playerId, player.source, player.avatar || null);
    //   });

      return reply.code(201).send({ message: 'Tournoi créé', tournamentId });

    } catch (error) {
      fastify.log.error(' Erreur lors de la création du tournoi : ' + (error as Error).message);
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur interne serveur' });
    }
  });

  // === Route GET : Récupéreration d'un tournoi avec ses joueurs
  fastify.get('/tournaments/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
  
    try {
      const tournament = db.prepare(`SELECT * FROM tournaments WHERE id = ?`).get(id) as { id: number; name: string; created_at: string } | undefined;
  
      if (!tournament) {
        fastify.log.warn(`Tournoi ID ${id} non trouvé`);
        return reply.code(404).send({ error: 'Tournoi non trouvé' });
      }
  
      const players = db.prepare(`SELECT player_id, source, avatar, name FROM tournament_players WHERE tournament_id = ?`).all(id) as TournamentPlayerDB[];
  
      const playerDetails = players.map((p) => {
        let username = '';
  
        if (p.source === 'friend') {
            // On essaye d'abord de récupérer un user classique
            const user = db.prepare(`SELECT username FROM users WHERE id = ?`).get(p.player_id) as UserDB | undefined;
          
            if (user) {
              username = user.username;
            } else 
            {
              // Sinon, on essaye depuis les potential_friends liés via user_friends
              const pf = db.prepare(`
                SELECT pf.username
                FROM user_friends uf
                JOIN potential_friends pf ON pf.id = uf.friend_id
                WHERE uf.friend_id = ? LIMIT 1
              `).get(p.player_id) as { username: string } | undefined;       
              username = pf ? pf.username : 'Inconnu';
            }
          }
           else if (p.source === 'guest') {
          username = p.name ?? 'Guest';
        }
  
        return {
          id: p.player_id,
          source: p.source as 'friend' | 'guest',
          avatar: p.avatar || undefined,
          username
        };
      });
  
      fastify.log.info(` Détails du tournoi ${id} récupérés`);
      return reply.send({ tournament, players: playerDetails });
  
    } catch (error) {
      fastify.log.error(' Erreur lors du chargement du tournoi : ' + (error as Error).message);
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erreur interne serveur' });
    }
  });

  
}

