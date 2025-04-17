import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config(); // Charge les variables depuis .env

const DB_PATH = process.env.DB_PATH || './database/data.db';
const db = new Database(DB_PATH);

export default db;


// //    ===Création de la table "games" ===
// db.prepare(`
//   CREATE TABLE IF NOT EXISTS games (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     user_id INTEGER NOT NULL,
//     opponent_id INTEGER NOT NULL,
//     winner_id INTEGER,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (user_id) REFERENCES users(id),
//     FOREIGN KEY (opponent_id) REFERENCES users(id)
//   )
// `).run()
// //    ===Création de la table "scores" ===
// db.prepare(`
//   CREATE TABLE IF NOT EXISTS scores (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     game_id INTEGER NOT NULL,
//     player_id INTEGER NOT NULL,
//     score INTEGER NOT NULL,
//     FOREIGN KEY (game_id) REFERENCES games(id),
//     FOREIGN KEY (player_id) REFERENCES users(id)
//   )
// `).run()
// //    ===Création de la table "friends" ===
// db.prepare(`
//   CREATE TABLE IF NOT EXISTS friends (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     user_id INTEGER NOT NULL,
//     friend_id INTEGER NOT NULL,
//     status TEXT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (user_id) REFERENCES users(id),
//     FOREIGN KEY (friend_id) REFERENCES users(id)
//   )
// `).run()