const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path
const dbPath = path.join(__dirname, '../data/nexanova.db');
const dataDir = path.dirname(dbPath);

// Ensure /data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory:', dataDir);
}

// Connect to SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
  } else {
    console.log('✅ Connected to database:', dbPath);
    db.run('PRAGMA foreign_keys = ON');
  }
});

// ============================
// 🔥 DATABASE INITIALIZATION
// ============================
const initDatabase = async () => {
  console.log("🚀 Initializing SQLite database...");

  // USERS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      path TEXT,
      ai_personality TEXT,
      mood_score INTEGER DEFAULT 0,
      anonymous_mode INTEGER DEFAULT 0,
      offline_mode INTEGER DEFAULT 1,
      store_chat INTEGER DEFAULT 1,
      language TEXT DEFAULT 'en',
      currency TEXT DEFAULT 'TZS',
      country_code TEXT,
      city TEXT,
      region TEXT,
      points INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // HABITS
  db.run(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT,
      category TEXT,
      difficulty TEXT DEFAULT 'easy',
      frequency TEXT DEFAULT 'daily',
      reminder_time TEXT,
      description TEXT,
      trigger TEXT,
      replacement TEXT,
      streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_completed TEXT,
      total_completions INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      target_streak INTEGER DEFAULT 30,
      start_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // HABIT COMPLETIONS
  db.run(`
    CREATE TABLE IF NOT EXISTS habit_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      completion_date TEXT NOT NULL,
      notes TEXT,
      mood INTEGER,
      trigger TEXT,
      location TEXT,
      time_of_day TEXT,
      completion_time TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(habit_id, completion_date),
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    )
  `);

  // HABIT JOURNAL ENTRIES
  db.run(`
    CREATE TABLE IF NOT EXISTS habit_journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      entry_date TEXT NOT NULL,
      reflection TEXT,
      mood_before INTEGER,
      mood_after INTEGER,
      trigger TEXT,
      challenges_faced TEXT,
      successes TEXT,
      les
