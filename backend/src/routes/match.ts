import { FastifyInstance } from 'fastify';
import { authenticateToken } from './authMiddleware';
import jwt from 'jsonwebtoken';
import db from '../db/db';


export async function matchRoutes(app: FastifyInstance) {
  // JWT 인증 훅
  app.addHook('onRequest', async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      req.auth = undefined; // ✅ 토큰 없는 상태도 허용
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
  

  // Créer un nouveau match (game + scores)
  app.post('/match/start', async (req, reply) => {
    const { user_id, opponent_id } = req.body as {
      user_id?: number;
      opponent_id: number;
    };
  
    // 우선순위: 요청에서 보낸 user_id → 없으면 JWT 토큰에서 추출
    const finalUserId = user_id ?? req.auth?.userId;
  
    // 게스트 vs 게스트인 경우 user_id가 undefined로 올 수 있음 (인증 불필요)
    const isGuestVsGuest = (user_id === undefined || user_id < 0) && req.auth === undefined;

    // 게스트끼리 아닐 경우에는 user_id/opponent_id 필수
    if (!isGuestVsGuest && (!finalUserId || !opponent_id)) {
      return reply.status(400).send({ error: 'Missing user or opponent ID' });
    }
  
    // 유저 존재 여부 확인 (users 또는 potential_friends에 있는지 확인)
    const userExists =
      finalUserId === undefined || finalUserId < 0 
        ? true
        : db.prepare('SELECT id FROM users WHERE id = ?').get(finalUserId) ||
          db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(finalUserId);
  
    const opponentExists =
      opponent_id < 0 || // 음수 ID는 guest로 간주
      db.prepare('SELECT id FROM users WHERE id = ?').get(opponent_id) ||
      db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(opponent_id);
  
    if (!userExists || !opponentExists) {
      console.error('❌ Invalid user or opponent');
      return reply.status(400).send({ error: 'Invalid user or opponent ID' });
    }
  
    try {
      reply.send({ status: 'ready' });

    } catch (err) {
      console.error('❌ Erreur lors de la création du match :', err);
      reply.status(500).send({ error: 'Match creation failed' });
    }
  });
  
  // 경기 종료 및 점수 저장
  app.post('/match/end', async (req, reply) => {
    //  수정된 부분: user_id도 body에서 받음 (게스트용)
  const { user_id, opponent_id, score1, score2 } = req.body as {
    user_id?: number;
    opponent_id: number;
    score1: number;
    score2: number;
  };

    // 수정된 부분: 로그인 유저가 없으면 게스트 user_id 사용
    const finalUserId = user_id ?? req.auth?.userId; 
      
    // 수정된 부분: 게스트 vs 게스트 판별 강화
    const isGuestVsGuest = (finalUserId === undefined || finalUserId < 0) && opponent_id < 0;
  
    // 기존과 동일한 파라미터 유효성 체크
    if (
      !isGuestVsGuest &&
      (!finalUserId || opponent_id === undefined || score1 === undefined || score2 === undefined)
    ) {
      return reply.status(400).send({ error: 'Missing parameters' });
    }
  
    console.log('[DEBUG GAME DATA BACKEND] Reçu POST /match/end', {
      finalUserId,
      opponent_id,
      score1,
      score2
    });
  
    // user_id < 0이면 게스트로 간주하여 DB 체크 생략
    const userExists =
      finalUserId === undefined || finalUserId < 0
        ? true
        : db.prepare('SELECT id FROM users WHERE id = ?').get(finalUserId) ||
          db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(finalUserId);
  
    const opponentExists =
      opponent_id < 0
        ? true
        : db.prepare('SELECT id FROM users WHERE id = ?').get(opponent_id) ||
          db.prepare('SELECT id FROM potential_friends WHERE id = ?').get(opponent_id);
  
    if (!userExists || !opponentExists) {
      console.error('❌ Invalid user or opponent in /match/end');
      return reply.status(400).send({ error: 'Invalid user or opponent ID' });
    }
  
    //  수정된 부분: 정확한 finalUserId를 winner로 사용
    const winner_id = score1 > score2 ? finalUserId! : opponent_id;
  
    console.log(`[DEBUG GAME DATA BACKEND] Winner determined: winner_id=${winner_id}`);
  
    const result = db.prepare(`
      INSERT INTO games (user_id, opponent_id, winner_id) VALUES (?, ?, ?)
    `).run(finalUserId ?? -9999, opponent_id, winner_id);

    const insertedGameId = result.lastInsertRowid as number;

    // 2. Insert scores
    const stmtScore = db.prepare(`
      INSERT INTO scores (game_id, player_id, score) VALUES (?, ?, ?)
    `);
    stmtScore.run(insertedGameId, finalUserId ?? -9999, score1);
    stmtScore.run(insertedGameId, opponent_id, score2);


  
    console.log('🎯 Match mis à jour', { insertedGameId, score1, score2, winner_id });
  
    reply.send({ status: 'match updated', winner_id });
  });

    app.get('/me/pong-games', { preHandler: authenticateToken }, async (req, reply) => {
    const userId = req.user?.id;
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

    try {
      const stmt = db.prepare(`
        SELECT g.created_at as timestamp,
               u2.username as opponent,
               s1.score as score1,
               s2.score as score2
        FROM games g
        JOIN users u1 ON g.user_id = u1.id
        JOIN users u2 ON g.opponent_id = u2.id
        JOIN scores s1 ON s1.game_id = g.id AND s1.player_id = u1.id
        JOIN scores s2 ON s2.game_id = g.id AND s2.player_id = u2.id
        WHERE g.user_id = ?
        ORDER BY g.created_at DESC
        LIMIT 10
      `);

      const games = stmt.all(userId);
      reply.send(games);
    } catch (err) {
      console.error('❌ Erreur récupération parties Pong :', err);
      reply.status(500).send({ error: 'Pong history failed' });
    }
  });

}