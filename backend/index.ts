import Fastify from 'fastify'
import Database from 'better-sqlite3'
import bcrypt from 'bcrypt' //Pour le Hashage des mots de passe (securite)
import jwt from 'jsonwebtoken'//Pour creer et lire les token JWT (authentification)

// Creation du serveur
const app = Fastify()

// Ajout d'un parseur JSON (indispensable pour POST JSON)
app.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    const json = JSON.parse(body as string)
    done(null, json)
  } catch (err) {
    done(err as Error, undefined)
  }
})

//  Connexion à SQLite
const db = new Database('./database/data.db')

// Création de la table "users" si elle n'existe pas
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    image TEXT -- chemin relatif de l'image
  )
`).run()

// db.prepare('UPDATE users SET image = ? WHERE id = ?').run('dust.jpg', userId)

app.post('/api/theme', async (request, reply) => {
  const auth = request.headers.authorization;
  if (!auth) return reply.code(401).send({ error: 'Missing token' });

  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, SECRET) as any;

    const { image } = request.body as { image: string };
    db.prepare('UPDATE users SET image = ? WHERE id = ?').run(image, payload.userId);
    reply.send({ message: 'Theme updated' });

  } catch {
    reply.code(401).send({ error: 'Invalid or expired token' });
  }
});
// app.get('/api/ping', async () => {
//   return { pong: true }
// })

// Route GET : récupérer tous les utilisateurs
// app.get('/api/users', async () => {
//   const users = db.prepare('SELECT id, username FROM users').all()
//   return users
// })
app.get('/api/users', async () => {
  const users = db.prepare('SELECT * FROM users').all()
  return users
})

// Route POST : ajouter un utilisateur
app.post('/api/users', async (request, reply) => {
  const { name } = request.body as { name: string }

  if (!name) {
    reply.code(400).send({ error: 'Le champ "name" est requis.' })
    return
  }

  const result = db.prepare('INSERT INTO users (name) VALUES (?)').run(name)
  return { id: result.lastInsertRowid, name }
})

// 🚀 Lancement du serveur
app.listen({ port: 3001, host: '0.0.0.0' }, () => {
  console.log('✅ Backend running on http://localhost:3001')
})

// Sign up 

const SECRET = 'super-secret-key' // 🔐 à remplacer avec une vraie clé d'env

app.post('/api/signup', async (request, reply) => {
  const { username, password } = request.body as any

  if (!username || !password) {
    return reply.code(400).send({ error: "Username and password required" })
  }

  const hashed = await bcrypt.hash(password, 10)

  try {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashed)
    reply.send({ message: 'User created' })
  } catch {
    reply.code(409).send({ error: 'User already exists' })
  }
})

// login

// Explication : Quand quelqu'un envoie une demande POST (envoie de donnees au serveur, ici les identifiants)
// a l'adresse /api/login alors on execute cette fonction 
app.post('/api/login', async (request, reply) => {
  const { username, password } = request.body as any
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as {
    id: number
    username: string
    password: string
  } | undefined
  

  if (!user) return reply.code(401).send({ error: 'Username not found' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return reply.code(401).send({ error: 'Password not found' })

  const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' })
  reply.send({ token })
})

//protection de la route avec le token
app.get('/api/me', async (request, reply) => {
  const auth = request.headers.authorization
  if (!auth) return reply.code(401).send({ error: 'Missing token' })

  try {
    const token = auth.split(' ')[1]
    const payload = jwt.verify(token, SECRET) as any
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(payload.userId)
    reply.send(user)
  } catch {
    reply.code(401).send({ error: 'Invalid or expired token' })
  }
})

app.get('/api/debug-users', async () => {
  return db.prepare('SELECT * FROM users').all()
})


