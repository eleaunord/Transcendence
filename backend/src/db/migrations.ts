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

// Fonction principale qui gère toutes les migrations
async function migrate() {
  // GOOGLE OAUTH
  safeAlter('google_id', 'TEXT');

  // 2FA
  safeAlter('is_2fa_enabled', 'INTEGER DEFAULT 0');
  safeAlter('two_fa_code', 'TEXT');
  safeAlter('two_fa_expires_at', 'TEXT');

  // GAME : création de la table match
  await db.exec(`
    CREATE TABLE IF NOT EXISTS match (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1 TEXT NOT NULL,
      player2 TEXT NOT NULL,
      score1 INTEGER,
      score2 INTEGER,
      winner TEXT,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Table `match` vérifiée ou créée');
}

// Exécuter la migration
migrate().catch(console.error);
