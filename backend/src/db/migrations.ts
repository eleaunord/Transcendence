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
// Ajoute la colonne 'name' à tournament_players si elle n'existe pas
function safeAlterTournamentPlayers(column: string, type: string) {
  const columns = db.prepare(`PRAGMA table_info(tournament_players)`).all() as { name: string }[];
  const exists = columns.some(c => c.name === column);
  if (!exists) {
    db.prepare(`ALTER TABLE tournament_players ADD COLUMN ${column} ${type}`).run();
    console.log(` ==== Added column '${column}' to tournament_players table ==== `);
  }
}

// 1705 추가 email NOT NULL 제거용 함수 (remove email not null condition)
function relaxEmailConstraint() {
  const columns = db.prepare(`PRAGMA table_info(users)`).all() as { name: string; notnull: number }[];
  const emailCol = columns.find(col => col.name === 'email');

  if (emailCol && emailCol.notnull === 1) {
    console.log('이메일 NOT NULL 제약 해제 중...');

    db.exec(`
      PRAGMA foreign_keys = OFF;

      DROP TABLE IF EXISTS users_tmp;  -- ✅ 여기 추가됨

      CREATE TABLE users_tmp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT DEFAULT NULL,
        image TEXT DEFAULT 'default.jpg',
        theme TEXT DEFAULT '/assets/profile-themes/arabesque.png',
        google_id TEXT,
        is_2fa_enabled INTEGER DEFAULT 0,
        two_fa_code TEXT,
        two_fa_expires_at TEXT,
        seen_2fa_prompt INTEGER DEFAULT 0,
        created_at TIMESTAMP,
        is_anonymized INTEGER DEFAULT 0
      );

      INSERT INTO users_tmp (
        id, username, email, password_hash, image
      )
      SELECT id, username, email, password_hash, image FROM users;

      DROP TABLE users;

      ALTER TABLE users_tmp RENAME TO users;

      PRAGMA foreign_keys = ON;
    `);

    console.log('[DEBUG MIGRATION] 이메일 NOT NULL 제약 제거 완료');
  } else {
    console.log('[DEBUG MIGRATION] 이메일 컬럼은 이미 nullable 상태.');
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
  relaxEmailConstraint();
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

  // flag for anonymization (익명화 여부 플래그)
  safeAlter('is_anonymized', 'INTEGER DEFAULT 0');


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
     INSÉRER LES AMIS FICTIFS (5 au total)
  ========================== */
    const potentialFriends = [
      { id: 6, username: 'Lilix', status: 'online', profile_picture: '/assets/profile-pictures/Avatar1.png' },
      { id: 7, username: 'Gnouma', status: 'online', profile_picture: '/assets/profile-pictures/avatar5.png' },
      { id: 8, username: 'Rime', status: 'online', profile_picture: '/assets/profile-pictures/avatar3.png' },
      { id: 9, username: 'Shinhye', status: 'online', profile_picture: '/assets/profile-pictures/avatar2.png' },
      { id: 10, username: 'Eleonore', status: 'online', profile_picture: '/assets/profile-pictures/Avatar4.png' }
    ];

    const insertFriend = db.prepare(`
      INSERT OR IGNORE INTO potential_friends (id, username, status, profile_picture)
      VALUES (?, ?, ?, ?)
    `);

    potentialFriends.forEach((friend) => {
      insertFriend.run(friend.id, friend.username, friend.status, friend.profile_picture);
      console.log(`✅ Ami fictif ajouté : ${friend.username}`);
    });
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table `tournaments` créée');
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tournament_players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        source TEXT NOT NULL, -- 'friend' ou 'guest'
        avatar TEXT,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
      );
    `);

    console.log('✅ Table `tournament_players` créée');

  console.log('✅ Amis fictifs insérés dans la base de données');
  safeAlterTournamentPlayers('name', 'TEXT');

  /* ==========================
     AJOUT DDE LA TABLE POUR LE MEMORY
  ========================== */

    await db.exec(`
    CREATE TABLE IF NOT EXISTS memory_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      opponent TEXT NOT NULL,
      score1 INTEGER NOT NULL,
      score2 INTEGER NOT NULL,
      winner TEXT NOT NULL,
      pair_count INTEGER NOT NULL,
      turn_time INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  console.log('✅ Table `memory_games` créée');

}

// Exécuter la migration
migrate().catch(console.error);
