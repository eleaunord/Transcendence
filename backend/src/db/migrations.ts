// migrations.ts
import db from './db';

function safeAlter(column: string, type: string) {
  const columns = db.prepare(`PRAGMA table_info(users)`).all() as { name: string }[];
  const exists = columns.some(c => c.name === column);
  if (!exists) {
    db.prepare(`ALTER TABLE users ADD COLUMN ${column} ${type}`).run();
  }
}

function safeAlterTournamentPlayers(column: string, type: string) {
  const columns = db.prepare(`PRAGMA table_info(tournament_players)`).all() as { name: string }[];
  const exists = columns.some(c => c.name === column);
  if (!exists) {
    db.prepare(`ALTER TABLE tournament_players ADD COLUMN ${column} ${type}`).run();
  }
}

function relaxEmailConstraint() {
  const columns = db.prepare(`PRAGMA table_info(users)`).all() as { name: string; notnull: number }[];
  const emailCol = columns.find(col => col.name === 'email');

  if (emailCol && emailCol.notnull === 1) {

    db.exec(`
      PRAGMA foreign_keys = OFF;

      DROP TABLE IF EXISTS users_tmp;

      CREATE TABLE users_tmp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT DEFAULT NULL,
        image TEXT DEFAULT 'default.jpg',
        theme TEXT DEFAULT '/assets/Backgrounds/bg_th1.jpg',
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

  } else {
  }
}

// --- NEW ---
function tableExists(tableName: string): boolean {
  const result = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name=?
  `).get(tableName);
  return !!result;
}

// --- NEW ---

async function migrate() {
  relaxEmailConstraint();
  safeAlter('google_id', 'TEXT');
  safeAlter('is_2fa_enabled', 'INTEGER DEFAULT 0');
  safeAlter('two_fa_code', 'TEXT');
  safeAlter('two_fa_expires_at', 'TEXT');
  safeAlter('seen_2fa_prompt', 'INTEGER DEFAULT 0');
  safeAlter('image', 'TEXT');
  safeAlter('theme', "TEXT DEFAULT '/assets/Backgrounds/bg_th1.jpg'");
  safeAlter('created_at', 'TIMESTAMP');
  safeAlter('is_anonymized', 'INTEGER DEFAULT 0');

  // // --- NEW --- condition
  if (!tableExists('games')) {
    await db.exec(`
      CREATE TABLE games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, -- NULL 허용됨
        opponent_id INTEGER NOT NULL,
        winner_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } else {
  }

  if (!tableExists('scores')) {
    await db.exec(`
      CREATE TABLE scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        FOREIGN KEY (game_id) REFERENCES games(id)
      );
    `);
  } else {
  }

  db.prepare(`
    INSERT OR IGNORE INTO users (id, username, email)
    VALUES
      (1, 'PlayerOne', 'player1@example.com'),
      (2, 'AI', 'ai@game.com'),
      (3, 'Guest', 'guest@game.com')
  `).run();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS potential_friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      status TEXT DEFAULT 'online',
      profile_picture TEXT
    );
  `);

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

  const potentialFriends = [
    { id: 6, username: 'Alix', status: 'online', profile_picture: '/assets/Team_cards/card_alix.png' },
    { id: 7, username: 'Gnouma', status: 'online', profile_picture: '/assets/Team_cards/card_gnouma.png' },
    { id: 8, username: 'Rime', status: 'online', profile_picture: '/assets/Team_cards/card_rime.png' },
    { id: 9, username: 'Shinhye', status: 'online', profile_picture: '/assets/Team_cards/card_shinhye.png' },
    { id: 10, username: 'Eleonore', status: 'online', profile_picture: '/assets/Team_cards/card_eleonore.png' }
  ];

  const insertFriend = db.prepare(`
    INSERT OR IGNORE INTO potential_friends (id, username, status, profile_picture)
    VALUES (?, ?, ?, ?)
  `);

  potentialFriends.forEach((friend) => {
    insertFriend.run(friend.id, friend.username, friend.status, friend.profile_picture);
  });

  db.prepare(`
    INSERT OR IGNORE INTO users (id, username, image)
    SELECT id, username, profile_picture FROM potential_friends
  `).run();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tournament_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      player_id TEXT NOT NULL,
      source TEXT NOT NULL,
      avatar TEXT,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
    );
  `);

  safeAlterTournamentPlayers('name', 'TEXT');

  /* ==========================
     AJOUT DE LA TABLE POUR LE MEMORY
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
}

migrate().catch(console.error);