import Fastify from 'fastify';
import { authRoutes } from './routes/auth';
import { meRoutes } from './routes/me';
import { themeRoutes } from './routes/theme';

const app = Fastify();

// Middleware JSON parser
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



// // ========== Imports ==========
// import Fastify from 'fastify'
// import Database from 'better-sqlite3'
// import bcrypt from 'bcrypt' //Pour le Hashage des mots de passe (securite)
// import jwt from 'jsonwebtoken'//Pour creer et lire les token JWT (authentification)
// import axios from 'axios'; // npm install axios (google oauth) 
// import dotenv from 'dotenv'; // npm install dotenv
// import db from './db'; // Connexion DB déjà prête

// //dotenv.config(); // Charge les variables depuis .env

// // ========== Constantes =========

// //    === Creation du serveur ===
// const app = Fastify()
// const PORT = parseInt(process.env.PORT || '3001');
// const HOST = process.env.HOST || '0.0.0.0';
// const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
// const DB_PATH = process.env.DB_PATH || './database/data.db';

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
// const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8081';



// // ========== Middleware JSON ==========
// //    === Ajout d'un parseur JSON ==
// //    === indispensable pour POST JSON ===
// //    === sinon Fastify ne parse pas le body ===
// //    === et on a une erreur 500 ===
// app.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
//   try {
//     const json = JSON.parse(body as string)
//     done(null, json)
//   } catch (err) {
//     done(err as Error, undefined)
//   }
// })
   
    
//     if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URL) {
//       console.error('Missing required Google OAuth environment variables');
//       process.exit(1);
//     }

// app.post('/api/theme', async (request, reply) => {
//   const auth = request.headers.authorization;
//   if (!auth) return reply.code(401).send({ error: 'Missing token' });

//   try {
//     const token = auth.split(' ')[1];
//     const payload = jwt.verify(token, SECRET) as any;

//     const { image } = request.body as { image: string };
//     db.prepare('UPDATE users SET image = ? WHERE id = ?').run(image, payload.userId);
//     reply.send({ message: 'Theme updated' });

//   } catch {
//     reply.code(401).send({ error: 'Invalid or expired token' });
//   }
// });

// // Route GET : récupérer tous les utilisateurs
// // app.get('/api/users', async () => {
// //   const users = db.prepare('SELECT id, username FROM users').all()
// //   return users
// // })
// app.get('/api/users', async () => {
//   const users = db.prepare('SELECT * FROM users').all()
//   return users
// })

// // Route POST : ajouter un utilisateur
// // app.post('/api/users', async (request, reply) => {
// //   const { name } = request.body as { name: string }

// //   if (!name) {
// //     reply.code(400).send({ error: 'Le champ "name" est requis.' })
// //     return
// //   }

// //   const result = db.prepare('INSERT INTO users (name) VALUES (?)').run(name)
// //   return { id: result.lastInsertRowid, name }
// // })

// // 🚀 Lancement du serveur
// app.listen({ port: 3001, host: '0.0.0.0' }, () => {
//   console.log('✅ Backend running on http://localhost:3001')
// })

// // Sign up 


// app.post('/api/signup', async (request, reply) => {
//   const { username, email, password } = request.body as
//   {
//     username: string;
//     email:string;
//     password:string;
//   };
// //Verification de base
//   if (!username || !email || !password) {
//     return reply.code(400).send({ error: 'All fields are required' })
//   }
//   try{
//   //Est ce que l'utilisateur existe deja?
//     const existingUser = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?')
//     .get(username,email);
//     if (existingUser)
//     {
//       return reply.code(409).send({error: 'Username or email already exists'});
//     }
//   //Hash du mot de passe
//   const hashed = await bcrypt.hash(password, 10);
//   //Insertion dans la base de donnee
//   //console.log('Creating user:', { username, email, hashed });
//   db.prepare('INSERT INTO users (username,email, password_hash) VALUES(?, ?, ?)').run(username, email, hashed);
//   return reply.code(201).send({message: 'User created successfully'});
//   }
//   catch(err) {
//     console.error('Signup error:', err);
//     reply.code(500).send({ error: 'Internal server error'})
//   }
// })

// // sign in

// // Explication : Quand quelqu'un envoie une demande POST (envoie de donnees au serveur, ici les identifiants)
// // a l'adresse /api/login alors on execute cette fonction 
// app.post('/api/login', async (request, reply) => {
//   const { username, password } = request.body as {
//     username: string
//     password: string
//   } 
//   //on verifie les champs
//   if (!username || !password) {
//     return reply.code(400).send({ error: 'All fields are required' });
//   }
//   //on recupere l'utilisateur depuis la base de donnee
//   const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
//   | { id: number; username: string; password_hash: string }
//   | undefined;


//   if (!user) return reply.code(401).send({ error: 'Username not found' })
//     //on compare le mot de passe
//   const match = await bcrypt.compare(password, user.password_hash)
//   if (!match) return reply.code(401).send({ error: 'Incorrect password' })
//     //creation du token JWT
//   const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' })
//   return reply.send({ token })
// })

// //protection de la route avec le token
// app.get('/api/me', async (request, reply) => {
//   const auth = request.headers.authorization
//   if (!auth) return reply.code(401).send({ error: 'Missing token' })

//   try {
//     const token = auth.split(' ')[1]
//     const payload = jwt.verify(token, SECRET) as any
//     const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(payload.userId)
//     reply.send(user)
//   } catch {
//     reply.code(401).send({ error: 'Invalid or expired token' })
//   }
// })

// app.get('/api/debug-users', async () => {
//   return db.prepare('SELECT * FROM users').all()
// })


