<<<<<<< HEAD
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth';
import { meRoutes } from './routes/me';
import { themeRoutes } from './routes/theme';
import { matchRoutes } from './routes/match';
=======
// ========== Imports ==========
import Fastify from 'fastify';
import cors from '@fastify/cors'; // DONT REMOVE :added to solve "CORS (Cross-Origin Resource Sharing)" problem
import { authRoutes } from './routes/auth';
import { meRoutes } from './routes/me';
import { themeRoutes } from './routes/theme';
>>>>>>> 0205_merge_front_back
import './db/migrations';

async function main() {
  const app = Fastify();

<<<<<<< HEAD
  // Active CORS
  await app.register(cors, {
    origin: '*',
  });

  // Parseur JSON
=======
>>>>>>> 0205_merge_front_back
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try {
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err) {
      done(err as Error);
    }
  });

<<<<<<< HEAD
  // Enregistre les routes
  authRoutes(app);
  meRoutes(app);
  themeRoutes(app);
  matchRoutes(app);

  app.get('/', async () => {
    return { message: 'Backend is running' };
  });

=======
  // register CORS
  await app.register(cors, {
    origin: 'http://localhost:8080',
    credentials: true,
  });

  // Enregistrement des routes
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(meRoutes, { prefix: '/api' });
  await app.register(themeRoutes, { prefix: '/api' });

>>>>>>> 0205_merge_front_back
  const PORT = parseInt(process.env.PORT || '3001');
  const HOST = process.env.HOST || '0.0.0.0';

  app.listen({ port: PORT, host: HOST }, () => {
<<<<<<< HEAD
    console.log(`✅ Backend running on http://${HOST}:${PORT}`);
  });
}

main(); // lance l'appli


=======
    console.log(`Backend is running on http://${HOST}:${PORT}`);
  });
}

// process
main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
>>>>>>> 0205_merge_front_back
