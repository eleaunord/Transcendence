import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth';
import { meRoutes } from './routes/me';
import { themeRoutes } from './routes/theme';
import { matchRoutes } from './routes/match';
import './db/migrations';

async function main() {
  const app = Fastify();

  // Active CORS
  await app.register(cors, {
    origin: '*',
  });

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

  app.get('/', async () => {
    return { message: 'Backend is running' };
  });

  const PORT = parseInt(process.env.PORT || '3001');
  const HOST = process.env.HOST || '0.0.0.0';

  app.listen({ port: PORT, host: HOST }, () => {
    console.log(`✅ Backend running on http://${HOST}:${PORT}`);
  });
}

main(); // lance l'appli


