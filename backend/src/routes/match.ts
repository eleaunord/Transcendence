// MERGE RIME
import { FastifyInstance } from 'fastify';
import { authenticateToken } from './authMiddleware';
import jwt from 'jsonwebtoken';
import db from '../db/db';

// In-memory storage for active matches
const activeMatches = new Map<number, {
  user_id: number | undefined;
  opponent_id: number;
  created_at: Date;
}>();
let nextMatchId = 1;

export async function matchRoutes(app: FastifyInstance) {
  // --- JWT 인증 훅 (shared) ---
  app.addHook('onRequest', async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      req.auth = undefined;
      return;
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
      req.auth = { userId: payload.userId };
    } catch {
      return reply.status(401).send({ error: 'Invalid token' });
    }
  });

  // --- Cleanup expired in-memory matches every 10 minutes ---
  const cleanupExpiredMatches = () => {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    for (const [id, match] of activeMatches.entries()) {
      if (match.created_at < cutoff) {
        activeMatches.delete(id);
      }
    }
  };
  setInterval(cleanupExpiredMatches, 10 * 60 * 1000);

  // --- Start a match (in-memory only) ---
  app.post('/match/start', async (req, reply) => {
    const { user_id, opponent_id } = req.body as {
      user_id?: number;
      opponent_id: number;
    };
    const finalUserId = user_id ?? req.auth?.userId;
    const isGuestVsGuest = (finalUserId === undefined || finalUserId < 0) && req.auth === undefined;

    if (!isGuestVsGuest && (!finalUserId || !opponent_id)) {
      return reply.status(400).send({ error: 'Missing user or opponent ID' });
    }

    const userExists =
      finalUserId === undefined || finalUserId < 0
        ? true
        : !!db.prepare('SELECT id FROM users WHERE id = ?').get(finalUserId) ||
          !!db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(finalUserId);
    const opponentExists =
      opponent_id < 0 ||
      !!db.prepare('SELECT id FROM users WHERE id = ?').get(opponent_id) ||
      !!db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(opponent_id);

    if (!userExists || !opponentExists) {
      console.error('❌ Invalid user or opponent in /match/start');
      return reply.status(400).send({ error: 'Invalid user or opponent ID' });
    }

    try {
      const gameId = nextMatchId++;
      activeMatches.set(gameId, {
        user_id: finalUserId,
        opponent_id,
        created_at: new Date(),
      });
      reply.send({ status: 'created', gameId });
    } catch (err) {
      console.error('❌ Error creating match:', err);
      reply.status(500).send({ error: 'Match creation failed' });
    }
  });

  // --- End a match (persist to DB) ---
  app.post('/match/end', async (req, reply) => {
    const { gameId, user_id, opponent_id, score1, score2 } = req.body as {
      gameId: number;
      user_id?: number;
      opponent_id: number;
      score1: number;
      score2: number;
    };

    const activeMatch = activeMatches.get(gameId);
    if (!activeMatch) {
      return reply.status(404).send({ error: 'Match not found or already completed' });
    }

    const finalUserId = user_id ?? req.auth?.userId;
    const isGuestVsGuest = (finalUserId === undefined || finalUserId < 0) && opponent_id < 0;

    if (
      !isGuestVsGuest &&
      (!finalUserId || opponent_id === undefined || score1 === undefined || score2 === undefined)
    ) {
      return reply.status(400).send({ error: 'Missing parameters' });
    }

    if (activeMatch.user_id !== finalUserId || activeMatch.opponent_id !== opponent_id) {
      return reply.status(400).send({ error: 'Match participants do not match' });
    }

    const userExists =
      finalUserId === undefined || finalUserId < 0
        ? true
        : !!db.prepare('SELECT id FROM users WHERE id = ?').get(finalUserId) ||
          !!db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(finalUserId);
    const opponentExists =
      opponent_id < 0 ||
      !!db.prepare('SELECT id FROM users WHERE id = ?').get(opponent_id) ||
      !!db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(opponent_id);

    if (!userExists || !opponentExists) {
      console.error('❌ Invalid user or opponent in /match/end');
      return reply.status(400).send({ error: 'Invalid user or opponent ID' });
    }

    const winner_id = score1 > score2 ? finalUserId! : opponent_id;

    try {
      const result = db.prepare(`
        INSERT INTO games (user_id, opponent_id, winner_id, created_at)
        VALUES (?, ?, ?, ?)
      `).run(
        finalUserId ?? -9999,
        opponent_id,
        winner_id,
        activeMatch.created_at.toISOString()
      );
      const dbGameId = result.lastInsertRowid as number;

      const insertScore = db.prepare(`
        INSERT INTO scores (game_id, player_id, score)
        VALUES (?, ?, ?)
      `);
      insertScore.run(dbGameId, finalUserId ?? -9999, score1);
      insertScore.run(dbGameId, opponent_id, score2);

      activeMatches.delete(gameId);

      reply.send({ status: 'match completed', winner_id, dbGameId });
    } catch (err) {
      console.error('❌ Error saving completed match:', err);
      reply.status(500).send({ error: 'Failed to save match' });
    }
  });

  // --- User’s last 10 completed games with win/loss ---
  app.get('/me/pong-games', { preHandler: authenticateToken }, async (req, reply) => {
    const userId = req.user?.id;
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

    try {
      const stmt = db.prepare(`
        SELECT
          g.created_at AS timestamp,
          COALESCE(u2.username, 'Guest') AS opponent,
          s1.score AS score1,
          s2.score AS score2,
          CASE WHEN g.winner_id = ? THEN 'win' ELSE 'loss' END AS result
        FROM games g
        JOIN users u1 ON g.user_id = u1.id
        LEFT JOIN users u2 ON g.opponent_id = u2.id
        JOIN scores s1 ON s1.game_id = g.id AND s1.player_id = u1.id
        JOIN scores s2 ON s2.game_id = g.id AND s2.player_id = g.opponent_id
        WHERE g.user_id = ? AND g.winner_id IS NOT NULL
        ORDER BY g.created_at DESC
        LIMIT 10
      `);
      const games = stmt.all(userId, userId);
      reply.send(games);
    } catch (err) {
      console.error('❌ Error fetching Pong history:', err);
      reply.status(500).send({ error: 'Pong history failed' });
    }
  });

  // --- Debug: view active in-memory matches ---
  app.get('/matches/active', async (_req, reply) => {
    reply.send({
      activeMatches: activeMatches.size,
      matches: Array.from(activeMatches.entries()).map(([id, m]) => ({
        id,
        user_id: m.user_id,
        opponent_id: m.opponent_id,
        created_at: m.created_at,
      })),
    });
  });
}


// import { FastifyInstance } from 'fastify';
// import { authenticateToken } from './authMiddleware';
// import jwt from 'jsonwebtoken';
// import db from '../db/db';

// // In-memory storage for active matches
// const activeMatches = new Map<number, {
//   user_id: number | undefined;
//   opponent_id: number;
//   created_at: Date;
// }>();

// // Generate unique match ID for in-memory tracking
// let nextMatchId = 1;

// export async function matchRoutes(app: FastifyInstance) {
//   // JWT 인증 훅
//   app.addHook('onRequest', async (req, reply) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader?.startsWith('Bearer ')) {
//       req.auth = undefined; // 토큰 없는 상태도 허용
//       return;
//     }
  
//     const token = authHeader.split(' ')[1];
//     try {
//       const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
//       req.auth = { userId: payload.userId };
//     } catch {
//       return reply.status(401).send({ error: 'Invalid token' });
//     }
//   });
  
//   // Clean up expired matches (older than 30 minutes)
//   const cleanupExpiredMatches = () => {
//     const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
//     for (const [matchId, match] of activeMatches.entries()) {
//       if (match.created_at < thirtyMinutesAgo) {
//         activeMatches.delete(matchId);
//       }
//     }
//   };

//   // Run cleanup every 10 minutes
//   setInterval(cleanupExpiredMatches, 10 * 60 * 1000);

//   // Start a match (store in memory only)
//   app.post('/match/start', async (req, reply) => {
//     const { user_id, opponent_id } = req.body as {
//       user_id?: number;
//       opponent_id: number;
//     };
  
//     // 우선순위: 요청에서 보낸 user_id → 없으면 JWT 토큰에서 추출
//     const finalUserId = user_id ?? req.auth?.userId;
  
//     // 게스트 vs 게스트인 경우 user_id가 undefined로 올 수 있음 (인증 불필요)
//     const isGuestVsGuest = (user_id === undefined || user_id < 0) && req.auth === undefined;

//     // 게스트끼리 아닐 경우에는 user_id/opponent_id 필수
//     if (!isGuestVsGuest && (!finalUserId || !opponent_id)) {
//       return reply.status(400).send({ error: 'Missing user or opponent ID' });
//     }
  
//     // 유저 존재 여부 확인 (users 또는 potential_friends에 있는지 확인)
//     const userExists =
//       finalUserId === undefined || finalUserId < 0 
//         ? true
//         : db.prepare('SELECT id FROM users WHERE id = ?').get(finalUserId) ||
//           db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(finalUserId);
  
//     const opponentExists =
//       opponent_id < 0 || // 음수 ID는 guest로 간주
//       db.prepare('SELECT id FROM users WHERE id = ?').get(opponent_id) ||
//       db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(opponent_id);
  
//     if (!userExists || !opponentExists) {
//       console.error('❌ Invalid user or opponent');
//       return reply.status(400).send({ error: 'Invalid user or opponent ID' });
//     }
  
//     try {
//       // Store match in memory instead of database
//       const gameId = nextMatchId++;
//       activeMatches.set(gameId, {
//         user_id: finalUserId,
//         opponent_id: opponent_id,
//         created_at: new Date()
//       });

//       reply.send({ status: 'created', gameId });
//     } catch (err) {
//       console.error('❌ Erreur lors de la création du match :', err);
//       reply.status(500).send({ error: 'Match creation failed' });
//     }
//   });
  
//   // 경기 종료 및 점수 저장 (only now save to database)
//   app.post('/match/end', async (req, reply) => {
//     const { gameId, user_id, opponent_id, score1, score2 } = req.body as {
//       gameId: number;
//       user_id?: number;
//       opponent_id: number;
//       score1: number;
//       score2: number;
//     };

//     // Check if match exists in memory
//     const activeMatch = activeMatches.get(gameId);
//     if (!activeMatch) {
//       return reply.status(404).send({ error: 'Match not found or already completed' });
//     }
  
//     // 수정된 부분: 로그인 유저가 없으면 게스트 user_id 사용
//     const finalUserId = user_id ?? req.auth?.userId; 
      
//     // 수정된 부분: 게스트 vs 게스트 판별 강화
//     const isGuestVsGuest = (finalUserId === undefined || finalUserId < 0) && opponent_id < 0;
  
//     // 기존과 동일한 파라미터 유효성 체크
//     if (
//       !isGuestVsGuest &&
//       (!finalUserId || !gameId || opponent_id === undefined || score1 === undefined || score2 === undefined)
//     ) {
//       return reply.status(400).send({ error: 'Missing parameters' });
//     }

//     // Verify match participants match the active match
//     if (activeMatch.user_id !== finalUserId || activeMatch.opponent_id !== opponent_id) {
//       return reply.status(400).send({ error: 'Match participants do not match' });
//     }
  
//       gameId,
//       finalUserId,
//       opponent_id,
//       score1,
//       score2
//     });
  
//     // user_id < 0이면 게스트로 간주하여 DB 체크 생략
//     const userExists =
//       finalUserId === undefined || finalUserId < 0
//         ? true
//         : db.prepare('SELECT id FROM users WHERE id = ?').get(finalUserId) ||
//           db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(finalUserId);
  
//     const opponentExists =
//       opponent_id < 0
//         ? true
//         : db.prepare('SELECT id FROM users WHERE id = ?').get(opponent_id) ||
//           db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(opponent_id);
  
//     if (!userExists || !opponentExists) {
//       console.error('❌ Invalid user or opponent in /match/end');
//       return reply.status(400).send({ error: 'Invalid user or opponent ID' });
//     }
  
//     const winner_id = score1 > score2 ? finalUserId! : opponent_id;
  

//     try {
//       // Now save the completed match to database
//       const result = db.prepare(`
//         INSERT INTO games (user_id, opponent_id, winner_id, created_at) VALUES (?, ?, ?, ?)
//       `).run(finalUserId ?? -9999, opponent_id, winner_id, activeMatch.created_at.toISOString());
      
//       const dbGameId = result.lastInsertRowid as number;

//       // Save scores to database
//       const stmtScore = db.prepare(`
//         INSERT INTO scores (game_id, player_id, score) VALUES (?, ?, ?)
//       `);
//       stmtScore.run(dbGameId, finalUserId ?? -9999, score1);
//       stmtScore.run(dbGameId, opponent_id, score2);

//       // Remove from active matches
//       activeMatches.delete(gameId);

//         memoryGameId: gameId, 
//         dbGameId, 
//         score1, 
//         score2, 
//         winner_id 
//       });

//       reply.send({ status: 'match completed', winner_id, dbGameId });
//     } catch (err) {
//       console.error('❌ Error saving completed match to database:', err);
//       reply.status(500).send({ error: 'Failed to save match' });
//     }
//   });

//   // Get user's completed pong games
//   app.get('/me/pong-games', { preHandler: authenticateToken }, async (req, reply) => {
//     const userId = req.user?.id;
//     if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

//     try {
//       const stmt = db.prepare(`
//         SELECT g.created_at as timestamp,
//                COALESCE(u2.username, 'Guest') as opponent,
//                s1.score as score1,
//                s2.score as score2,
//                CASE WHEN g.winner_id = ? THEN 'win' ELSE 'loss' END as result
//         FROM games g
//         JOIN users u1 ON g.user_id = u1.id
//         LEFT JOIN users u2 ON g.opponent_id = u2.id
//         JOIN scores s1 ON s1.game_id = g.id AND s1.player_id = u1.id
//         JOIN scores s2 ON s2.game_id = g.id AND s2.player_id = g.opponent_id
//         WHERE g.user_id = ? AND g.winner_id IS NOT NULL
//         ORDER BY g.created_at DESC
//         LIMIT 10
//       `);

//       const games = stmt.all(userId, userId);
//       reply.send(games);
//     } catch (err) {
//       console.error('❌ Erreur récupération parties Pong :', err);
//       reply.status(500).send({ error: 'Pong history failed' });
//     }
//   });

//   // Optional: Get active matches count (for debugging)
//   app.get('/matches/active', async (req, reply) => {
//     reply.send({ 
//       activeMatches: activeMatches.size,
//       matches: Array.from(activeMatches.entries()).map(([id, match]) => ({
//         id,
//         user_id: match.user_id,
//         opponent_id: match.opponent_id,
//         created_at: match.created_at
//       }))
//     });
//   });
// }
// // OLD : error unfinished pong versus mode history

// // import { FastifyInstance } from 'fastify';
// // import { authenticateToken } from './authMiddleware';
// // import jwt from 'jsonwebtoken';
// // import db from '../db/db';


// // export async function matchRoutes(app: FastifyInstance) {
// //   // JWT 인증 훅
// //   app.addHook('onRequest', async (req, reply) => {
// //     const authHeader = req.headers.authorization;
// //     if (!authHeader?.startsWith('Bearer ')) {
// //       req.auth = undefined; // 토큰 없는 상태도 허용
// //       return;
// //     }
  
// //     const token = authHeader.split(' ')[1];
// //     try {
// //       const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
// //       req.auth = { userId: payload.userId };
// //     } catch {
// //       return reply.status(401).send({ error: 'Invalid token' });
// //     }
// //   });
  

// //   // Créer un nouveau match (game + scores)
// //   app.post('/match/start', async (req, reply) => {
// //     const { user_id, opponent_id } = req.body as {
// //       user_id?: number;
// //       opponent_id: number;
// //     };
  
// //     // 우선순위: 요청에서 보낸 user_id → 없으면 JWT 토큰에서 추출
// //     const finalUserId = user_id ?? req.auth?.userId;
  
// //     // 게스트 vs 게스트인 경우 user_id가 undefined로 올 수 있음 (인증 불필요)
// //     const isGuestVsGuest = (user_id === undefined || user_id < 0) && req.auth === undefined;

// //     // 게스트끼리 아닐 경우에는 user_id/opponent_id 필수
// //     if (!isGuestVsGuest && (!finalUserId || !opponent_id)) {
// //       return reply.status(400).send({ error: 'Missing user or opponent ID' });
// //     }
  
// //     // 유저 존재 여부 확인 (users 또는 potential_friends에 있는지 확인)
// //     const userExists =
// //       finalUserId === undefined || finalUserId < 0 
// //         ? true
// //         : db.prepare('SELECT id FROM users WHERE id = ?').get(finalUserId) ||
// //           db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(finalUserId);
  
// //     const opponentExists =
// //       opponent_id < 0 || // 음수 ID는 guest로 간주
// //       db.prepare('SELECT id FROM users WHERE id = ?').get(opponent_id) ||
// //       db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(opponent_id);
  
// //     if (!userExists || !opponentExists) {
// //       console.error('❌ Invalid user or opponent');
// //       return reply.status(400).send({ error: 'Invalid user or opponent ID' });
// //     }
  
// //     try {
// //       const result = db.prepare(`
// //         INSERT INTO games (user_id, opponent_id) VALUES (?, ?)
// //       `).run(finalUserId ?? -9999, opponent_id); // guest 전용 -9999 fallback 사용
// //       const gameId = result.lastInsertRowid as number;
  
// //       // 점수 초기화 (게임 시작 시)
// //       const stmtScore = db.prepare(`
// //         INSERT INTO scores (game_id, player_id, score) VALUES (?, ?, ?)
// //       `);
// //       stmtScore.run(gameId, finalUserId ?? -9999, 0); // -9999 사용시 이 값도 동일하게 적용
// //       stmtScore.run(gameId, opponent_id, 0);
  
// //       reply.send({ status: 'created', gameId });
// //     } catch (err) {
// //       console.error('❌ Erreur lors de la création du match :', err);
// //       reply.status(500).send({ error: 'Match creation failed' });
// //     }
// //   });
  
// //   // 경기 종료 및 점수 저장
// //   app.post('/match/end', async (req, reply) => {
// //     //  수정된 부분: user_id도 body에서 받음 (게스트용)
// //     const { gameId, user_id, opponent_id, score1, score2 } = req.body as {
// //       gameId: number;
// //       user_id?: number;
// //       opponent_id: number;
// //       score1: number;
// //       score2: number;
// //     };
  
// //     // 수정된 부분: 로그인 유저가 없으면 게스트 user_id 사용
// //     const finalUserId = user_id ?? req.auth?.userId; 
      
// //     // 수정된 부분: 게스트 vs 게스트 판별 강화
// //     const isGuestVsGuest = (finalUserId === undefined || finalUserId < 0) && opponent_id < 0;
  
// //     // 기존과 동일한 파라미터 유효성 체크
// //     if (
// //       !isGuestVsGuest &&
// //       (!finalUserId || !gameId || opponent_id === undefined || score1 === undefined || score2 === undefined)
// //     ) {
// //       return reply.status(400).send({ error: 'Missing parameters' });
// //     }
  
// //       gameId,
// //       finalUserId,
// //       opponent_id,
// //       score1,
// //       score2
// //     });
  
// //     // user_id < 0이면 게스트로 간주하여 DB 체크 생략
// //     const userExists =
// //       finalUserId === undefined || finalUserId < 0
// //         ? true
// //         : db.prepare('SELECT id FROM users WHERE id = ?').get(finalUserId) ||
// //           db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(finalUserId);
  
// //     const opponentExists =
// //       opponent_id < 0
// //         ? true
// //         : db.prepare('SELECT id FROM users WHERE id = ?').get(opponent_id) ||
// //           db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(opponent_id);
  
// //     if (!userExists || !opponentExists) {
// //       console.error('❌ Invalid user or opponent in /match/end');
// //       return reply.status(400).send({ error: 'Invalid user or opponent ID' });
// //     }
  
// //     //  수정된 부분: 정확한 finalUserId를 winner로 사용
// //     const winner_id = score1 > score2 ? finalUserId! : opponent_id;
  
  
// //     // 점수 저장
// //     db.prepare(`UPDATE scores SET score = ? WHERE game_id = ? AND player_id = ?`)
// //       .run(score1, gameId, finalUserId!);
// //     db.prepare(`UPDATE scores SET score = ? WHERE game_id = ? AND player_id = ?`)
// //       .run(score2, gameId, opponent_id);
  
// //     // 승자 기록
// //     db.prepare(`UPDATE games SET winner_id = ? WHERE id = ?`)
// //       .run(winner_id, gameId);
  
  
// //     reply.send({ status: 'match updated', winner_id });
// //   });

// //     app.get('/me/pong-games', { preHandler: authenticateToken }, async (req, reply) => {
// //     const userId = req.user?.id;
// //     if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

// //     try {
// //       const stmt = db.prepare(`
// //         SELECT g.created_at as timestamp,
// //                COALESCE(u2.username, 'Guest') as opponent,
// //                s1.score as score1,
// //                s2.score as score2
// //         FROM games g
// //         JOIN users u1 ON g.user_id = u1.id
// //         LEFT JOIN users u2 ON g.opponent_id = u2.id
// //         JOIN scores s1 ON s1.game_id = g.id AND s1.player_id = u1.id
// //         JOIN scores s2 ON s2.game_id = g.id AND s2.player_id = g.opponent_id
// //         WHERE g.user_id = ?
// //         ORDER BY g.created_at DESC
// //         LIMIT 10
// //       `);

// //       const games = stmt.all(userId);
// //       reply.send(games);
// //     } catch (err) {
// //       console.error('❌ Erreur récupération parties Pong :', err);
// //       reply.status(500).send({ error: 'Pong history failed' });
// //     }
// //   });

// // }