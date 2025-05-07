// migrations.ts
import db from './db';

// Fonction pour ajouter une colonne si elle n'existe pas
function safeAlter(column: string, type: string) {
  const columns = db.prepare(`PRAGMA table_info(users)`).all() as { name: string }[];
  const exists = columns.some(c => c.name === column);
  if (!exists) {
    db.prepare(`ALTER TABLE users ADD COLUMN ${column} ${type}`).run();
    console.log(` ==== Added column '${column}' to users table ==== `);
  }
}

// --- add new vairables in DB --- \\

// Fonction principale qui gère toutes les migrations
async function migrate() {
  // GOOGLE OAUTH
  safeAlter('google_id', 'TEXT');

  // 2FA
  safeAlter('is_2fa_enabled', 'INTEGER DEFAULT 0');
  safeAlter('two_fa_code', 'TEXT');
  safeAlter('two_fa_expires_at', 'TEXT');

  //Image profile(securise)
  safeAlter('image', 'TEXT');

  // Account creation time
  safeAlter('created_at', 'TIMESTAMP');

  // GAME : création de la table match
  await db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      opponent_id INTEGER NOT NULL,
      winner_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (opponent_id) REFERENCES users(id)
    );
  `);
  console.log('✅ Table `games` créée');
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id),
      FOREIGN KEY (player_id) REFERENCES users(id)
    );
  `);
  console.log('✅ Table `scores` créée');
}

// Exécuter la migration
migrate().catch(console.error);
