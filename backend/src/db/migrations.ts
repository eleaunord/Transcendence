
// migrations.ts
import { profile } from 'console';
import db from  './db';


// ========== SQLite Setup ==========
// === Connexion à la base de données ===
// === Création de la table users (si elle n'existe pas) ===


// functions that adds new Data in DB
function safeAlter(column: string, type: string) {
  const columns = db.prepare(`PRAGMA table_info(users)`).all() as { name: string }[];
  const exists = columns.some(c => c.name === column);
  if (!exists) {
    db.prepare(`ALTER TABLE users ADD COLUMN ${column} ${type}`).run();
    console.log(` ==== Added column '${column}' to users table ==== `);
  }
}

// --- add new vairables in DB --- \\

/*
GOOGLE OAUTH
*/
safeAlter('google_id', 'TEXT');

/* 
2FA DATAS
*/
safeAlter('is_2fa_enabled', 'INTEGER DEFAULT 0');
safeAlter('two_fa_code', 'TEXT');
safeAlter('two_fa_expires_at', 'TEXT');

//Image profile(securise)
safeAlter('image', 'TEXT');
