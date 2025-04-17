// // ========== Imports ==========
import Fastify from 'fastify';
import { authRoutes } from './routes/auth';
import { meRoutes } from './routes/me';
import { themeRoutes } from './routes/theme';
import './db/migrations'; // open migration file and execute first.

// // ========== Constantes =========
const app = Fastify();

// // ========== Middleware JSON ==========
// //    === Ajout d'un parseur JSON ==
// //    === indispensable pour POST JSON ===
// //    === sinon Fastify ne parse pas le body ===
// //    === et on a une erreur 500 ===
app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  try {
    const json = JSON.parse(body as string);
    done(null, json);
  } catch (err) {
    done(err as Error);
  }
});

// Enregistrement des routes
authRoutes(app);
meRoutes(app);
themeRoutes(app);

// Démarrage du serveur
const PORT = parseInt(process.env.PORT || '3001');
const HOST = process.env.HOST || '0.0.0.0';

app.listen({ port: PORT, host: HOST }, () => {
  console.log(`✅ Backend running on http://${HOST}:${PORT}`);
});





