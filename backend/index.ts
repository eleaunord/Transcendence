import Fastify from 'fastify'
import Database from 'better-sqlite3'

const app = Fastify()

// 🔧 Ajout du parseur JSON (indispensable pour POST JSON)
app.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    const json = JSON.parse(body as string)
    done(null, json)
  } catch (err) {
    done(err as Error, undefined)
  }
})

// 🔌 Connexion à SQLite
const db = new Database('./database/data.db')

// 📦 Création de la table "users" si elle n'existe pas
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`).run()

app.get('/api/ping', async () => {
  return { pong: true }
})

// 🧪 Route GET : récupérer tous les utilisateurs
app.get('/api/users', async () => {
  const users = db.prepare('SELECT * FROM users').all()
  return users
})

// ➕ Route POST : ajouter un utilisateur
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

