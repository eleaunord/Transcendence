import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth';
import { meRoutes } from './routes/me';
import { themeRoutes } from './routes/theme';
import { matchRoutes } from './routes/match';
import { leaderboardRoutes } from './routes/leaderboard';  // NEW
import './db/migrations';

async function main() {
  const app = Fastify();

  // Active CORS
  // await app.register(cors, {
  //   origin: '*',
  // });

  // Parseur JSON
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try {
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err) {
      done(err as Error);
    }
  });

  // Enregistre les routes
  authRoutes(app);
  meRoutes(app);
  themeRoutes(app);
  matchRoutes(app);

  leaderboardRoutes(app); // NEW

  app.get('/', async () => {
    return { message: 'Backend is running' };
  });

  // register CORS
  await app.register(cors, {
    origin: 'http://localhost:8080',
    credentials: true,
  });

  // Enregistrement des routes
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(meRoutes, { prefix: '/api' });
  await app.register(themeRoutes, { prefix: '/api' });
    
  await app.register(leaderboardRoutes, { prefix: '/api' });

  const PORT = parseInt(process.env.PORT || '3001');
  const HOST = process.env.HOST || '0.0.0.0';

  app.listen({ port: PORT, host: HOST }, () => {
    console.log(`✅ Backend running on http://${HOST}:${PORT}`);
  });
}

// process
main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
