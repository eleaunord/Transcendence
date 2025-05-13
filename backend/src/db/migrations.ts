// migrations.ts
import { profile } from 'console';
import db from  './db';


// ========== SQLite Setup ==========
// === Connexion à la base de données ===
// === Création de la table users (si elle n'existe pas) ===

// Fonction pour ajouter une colonne si elle n'existe pas
function safeAlter(column: string, type: string) {
  const columns = db.prepare(`PRAGMA table_info(users)`).all() as { name: string }[];
  const exists = columns.some(c => c.name === column);
  if (!exists) {
    db.prepare(`ALTER TABLE users ADD COLUMN ${column} ${type}`).run();
    console.log(` ==== Added column '${column}' to users table ==== `);
  }
}

// NEW
// Insert required users BEFORE any foreign key dependencies
db.prepare(`
  INSERT OR IGNORE INTO users (id, username, email)
  VALUES
    (1, 'PlayerOne', 'player1@example.com'),
    (2, 'AI', 'ai@game.com'),
    (3, 'Guest', 'guest@game.com')
`).run();

console.log('✅ Utilisateurs spéciaux insérés dans la table `users`');


// --- add new vairables in DB --- \\

// Fonction principale qui gère toutes les migrations
async function migrate() {
  // GOOGLE OAUTH
  safeAlter('google_id', 'TEXT');

  // 2FA
  safeAlter('is_2fa_enabled', 'INTEGER DEFAULT 0');
  safeAlter('two_fa_code', 'TEXT');
  safeAlter('two_fa_expires_at', 'TEXT');
  safeAlter('seen_2fa_prompt', 'INTEGER DEFAULT 0'); // 추가 : 0805

  //Image profile(securise)
  safeAlter('image', 'TEXT');

  // Theme de fond personnalisé
  safeAlter('theme', "TEXT DEFAULT '/assets/profile-themes/arabesque.png'");

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

  /* ==========================
     AJOUT DE LA TABLE potential_friends 
     POUR LES AMIS FICTIFS
  ========================== */
  await db.exec(`
    CREATE TABLE IF NOT EXISTS potential_friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      status TEXT DEFAULT 'online',
      profile_picture TEXT
    );
  `);
  console.log('✅ Table `potential_friends` créée');

  /* ==========================
     AJOUT DE LA TABLE user_friends
     POUR GÉRER LES LIENS ENTRE L'USER ET LES AMIS FICTIFS
  ========================== */
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_friends (
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      is_friend BOOLEAN DEFAULT 0,
      PRIMARY KEY (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (friend_id) REFERENCES potential_friends(id)
    );
  `);
  console.log('✅ Table `user_friends` créée');

  /* ==========================
     ⚠️ SUPPRESSION DES ANCIENS AMIS POUR EVITER LES DOUBLONS
  ========================== */
  await db.exec(`DELETE FROM potential_friends`);
  console.log('🗑️ Tous les anciens amis fictifs ont été supprimés');

  /* ==========================
     INSÉRER LES AMIS FICTIFS (5 au total)
  ========================== */
  const potentialFriends = [
    { username: 'Fixer', status: 'online', profile_picture: '/assets/profile-pictures/Fixer.png' },
    { username: 'Lady Aurora', status: 'online', profile_picture: '/assets/profile-pictures/Lady_Aurora.png' },
    { username: 'Grunthor', status: 'offline', profile_picture: '/assets/profile-pictures/Grunthor.png' },
    { username: 'Stormblade', status: 'online', profile_picture: '/assets/profile-pictures/Stormblade.png' },
    { username: 'ByteWarrior', status: 'online', profile_picture: '/assets/profile-pictures/ByteWarrior.png' }
  ];

  const insertFriend = db.prepare(`
    INSERT INTO potential_friends (username, status, profile_picture) VALUES (?, ?, ?)
  `);

  potentialFriends.forEach((friend) => {
    insertFriend.run(friend.username, friend.status, friend.profile_picture);
    console.log(`✅ Ami fictif ajouté : ${friend.username}`);
  });

  console.log('✅ Amis fictifs insérés dans la base de données');
}

// Exécuter la migration
migrate().catch(console.error);