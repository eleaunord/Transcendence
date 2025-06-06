import Database from 'better-sqlite3';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

const DB_PATH = process.env.DB_PATH || './database/data.db';
const db = new Database(DB_PATH);

// === Création ou vérification de la table users ===
db.prepare(`
 CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT NOT NULL UNIQUE,
 email TEXT NOT NULL UNIQUE,
 password_hash TEXT DEFAULT NULL,
 image TEXT DEFAULT 'default.jpg'
 )
`).run();

// === Ensure theme column exists and is populated ===
function ensureThemeColumn() {

  const columns = db.prepare(`PRAGMA table_info(users)`).all() as {
    name: string;
    notnull: number;
  }[];
  
  // Check if theme column exists
  const themeColumnExists = columns.some(c => c.name === 'theme');

  if (!themeColumnExists) {
    // Add the theme column
    db.prepare(`
      ALTER TABLE users 
      ADD COLUMN theme TEXT DEFAULT '/assets/Backgrounds/bg_th1.jpg'
    `).run();
  }

  // Ensure all existing users have a theme
  db.prepare(`
    UPDATE users 
    SET theme = '/assets/Backgrounds/bg_th1.jpg' 
    WHERE theme IS NULL OR theme = ''
  `).run();
}

// Run theme column migration
ensureThemeColumn();

// === Insertion des utilisateurs spéciaux si non présents ===
db.prepare(`
 INSERT OR IGNORE INTO users (id, username, email, theme) 
 VALUES (1, 'PlayerOne', 'player1@example.com', '/assets/Backgrounds/bg_th1.jpg')
`).run();
db.prepare(`
 INSERT OR IGNORE INTO users (id, username, email, theme) 
 VALUES (2, 'AI', 'ai@game.com', '/assets/Backgrounds/bg_th1.jpg')
`).run();
db.prepare(`
 INSERT OR IGNORE INTO users (id, username, email, theme) 
 VALUES (3, 'Guest', 'guest@game.com', '/assets/Backgrounds/bg_th1.jpg')
`).run();

// === Création de la table games ===
db.prepare(`
 CREATE TABLE IF NOT EXISTS games (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL,
 opponent_id INTEGER NOT NULL,
 winner_id INTEGER,
 created_at TIMESTAMP DEFAULT (datetime('now', '+2 hours')),
 FOREIGN KEY (user_id) REFERENCES users(id)
 )
`).run();


// === Création de la table scores ===
db.prepare(`
 CREATE TABLE IF NOT EXISTS scores (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 game_id INTEGER NOT NULL,
 player_id INTEGER NOT NULL,
 score INTEGER NOT NULL,
 FOREIGN KEY (game_id) REFERENCES games(id)
)
`).run();

export default db;
