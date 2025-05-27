import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth';
import { meRoutes } from './routes/me';
import { matchRoutes } from './routes/match';
import { leaderboardRoutes } from './routes/leaderboard';  // NEW
import { friendsRoutes } from './routes/friends'; // NEW
import { memoryRoutes } from './routes/memory'; // NEW
import tournaments from './routes/tournaments';

import './db/migrations';

async function main() {
  const app = Fastify({
    bodyLimit: 20 * 1024 * 1024, // 20 Mo pour upload image profil
  });

  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try {
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err) {
      done(err as Error);
    }
  });

  // register CORS
  await app.register(cors, {
    origin: 'https://localhost',
    credentials: true,
    // added
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  // Enregistrement des routes
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(meRoutes, { prefix: '/api' });
  await app.register(friendsRoutes, { prefix: '/api' });
  await app.register(leaderboardRoutes, { prefix: '/api' });
  await app.register(matchRoutes, { prefix: '/api' });
  await app.register(memoryRoutes, { prefix: '/api' });
  await app.register(tournaments, { prefix: '/api' }); // NEW

  app.get('/', async () => {
    return { message: 'Backend is running' };
  });
  
  const PORT = parseInt(process.env.PORT || '3001');
  const HOST = process.env.HOST || '0.0.0.0';

  app.listen({ port: PORT, host: HOST }, () => {
  });
  
  // app.get('/', async () => {
  //   return { message: 'Backend is running' };
  // });
}

// process
main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
