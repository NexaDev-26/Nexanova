const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/nexanova.db');
const dataDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory:', dataDir);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
  } else {
    console.log('✅ Connected to database:', dbPath);
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        console.error('Error enabling foreign keys:', err);
      } else {
        console.log('✅ Foreign keys enabled');
      }
    });
  }
});

const initDatabase = () => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    path TEXT CHECK(path IN ('mind_reset', 'money_builder', 'habit_transformer', 'all')),
    ai_personality TEXT CHECK(ai_personality IN ('wise_sage', 'coach', 'friend')),
    mood_score INTEGER DEFAULT 0,
    anonymous_mode BOOLEAN DEFAULT 0,
    offline_mode BOOLEAN DEFAULT 1,
    store_chat BOOLEAN DEFAULT 1,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'TZS',
    country_code VARCHAR(10),
    city VARCHAR(100),
    region VARCHAR(100),
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Habits table - Enhanced for full habit tracking
  db.run(`CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    type TEXT CHECK(type IN ('break', 'build')) NOT NULL,
    category VARCHAR(50),
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
    frequency TEXT DEFAULT 'daily',
    reminder_time VARCHAR(10),
    description TEXT,
    "trigger" TEXT,
    replacement TEXT,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completed DATE,
    total_completions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    target_streak INTEGER DEFAULT 30,
    start_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Habit completions table - Enhanced with journaling support
  db.run(`CREATE TABLE IF NOT EXISTS habit_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    completion_date DATE NOT NULL,
    notes TEXT,
    mood INTEGER CHECK(mood >= 1 AND mood <= 10),
    "trigger" TEXT,
    location TEXT,
    time_of_day VARCHAR(20),
    completion_time TIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, completion_date)
  )`);

  // Habit journal entries table - Separate from completions for detailed journaling
  db.run(`CREATE TABLE IF NOT EXISTS habit_journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    entry_date DATE NOT NULL,
    reflection TEXT,
    mood_before INTEGER CHECK(mood_before >= 1 AND mood_before <= 10),
    mood_after INTEGER CHECK(mood_after >= 1 AND mood_after <= 10),
    "trigger" TEXT,
    challenges_faced TEXT,
    successes TEXT,
    lessons_learned TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  )`);

  // Habit streaks history - Track streak milestones and resets
  db.run(`CREATE TABLE IF NOT EXISTS habit_streaks_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    streak_value INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  )`);

  // Habit challenges - Track challenge participation
  db.run(`CREATE TABLE IF NOT EXISTS habit_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_type TEXT CHECK(challenge_type IN ('30_day', 'stacking', 'micro', 'custom')),
    challenge_name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    target_habits TEXT,
    target_streak INTEGER DEFAULT 30,
    current_progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT 0,
    badge_earned BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Habit templates - Store user's custom templates
  db.run(`CREATE TABLE IF NOT EXISTS habit_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
    frequency TEXT DEFAULT 'daily',
    description TEXT,
    "trigger" TEXT,
    replacement TEXT,
    is_public BOOLEAN DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Habit analytics - Store aggregated analytics data
  db.run(`CREATE TABLE IF NOT EXISTS habit_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date DATE NOT NULL,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    average_mood DECIMAL(3,1),
    completion_count INTEGER DEFAULT 0,
    streak_value INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, date)
  )`);

  // Habit reminders - Store reminder settings
  db.run(`CREATE TABLE IF NOT EXISTS habit_reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    reminder_time TIME NOT NULL,
    days_of_week TEXT,
    is_enabled BOOLEAN DEFAULT 1,
    notification_type TEXT CHECK(notification_type IN ('push', 'email', 'sms')) DEFAULT 'push',
    last_sent DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  )`);

  // Finance table
  db.run(`CREATE TABLE IF NOT EXISTS finance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT CHECK(type IN ('income', 'expense')),
    category VARCHAR(50),
    amount DECIMAL(12,2),
    date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // AI Chats table
  db.run(`CREATE TABLE IF NOT EXISTS ai_chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT,
    response TEXT,
    mood_score INTEGER,
    path_context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Rewards / Badges table
  db.run(`CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT CHECK(type IN ('habit', 'financial', 'mind_reset')),
    title VARCHAR(100),
    description TEXT,
    awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Journey blueprint table
  db.run(`CREATE TABLE IF NOT EXISTS journey_blueprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    path TEXT,
    ai_personality TEXT,
    plan_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Journal entries table
  db.run(`CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title VARCHAR(200),
    content TEXT,
    mood INTEGER DEFAULT 5,
    tags TEXT,
    date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Create indexes for better performance (with error handling)
  db.run(`CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id)`, (err) => {
    if (err) console.error('Error creating index idx_habits_user_id:', err);
  });
  db.run(`CREATE INDEX IF NOT EXISTS idx_habits_type ON habits(type)`, (err) => {
    if (err) console.error('Error creating index idx_habits_type:', err);
  });
  db.run(`CREATE INDEX IF NOT EXISTS idx_habits_category ON habits(category)`, (err) => {
    if (err) console.error('Error creating index idx_habits_category:', err);
  });
  db.run(`CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits(user_id, is_active)`, (err) => {
    if (err) console.error('Error creating index idx_habits_user_active:', err);
  });
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON habit_completions(habit_id)`, (err) => {
    if (err) console.error('Error creating index idx_completions_habit_id:', err);
  });
  db.run(`CREATE INDEX IF NOT EXISTS idx_completions_date ON habit_completions(completion_date)`, (err) => {
    if (err) console.error('Error creating index idx_completions_date:', err);
  });
  db.run(`CREATE INDEX IF NOT EXISTS idx_completions_habit_date ON habit_completions(habit_id, completion_date)`, (err) => {
    if (err) console.error('Error creating index idx_completions_habit_date:', err);
  });
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_journal_habit_id ON habit_journal_entries(habit_id)`, (err) => {
    if (err) console.error('Error creating index idx_journal_habit_id:', err);
  });
  db.run(`CREATE INDEX IF NOT EXISTS idx_journal_date ON habit_journal_entries(entry_date)`, (err) => {
    if (err) console.error('Error creating index idx_journal_date:', err);
  });
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_streaks_habit_id ON habit_streaks_history(habit_id)`, (err) => {
    if (err) console.error('Error creating index idx_streaks_habit_id:', err);
  });
  db.run(`CREATE INDEX IF NOT EXISTS idx_streaks_active ON habit_streaks_history(habit_id, is_active)`, (err) => {
    if (err) console.error('Error creating index idx_streaks_active:', err);
  });
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON habit_challenges(user_id)`, (err) => {
    if (err) console.error('Error creating index idx_challenges_user_id:', err);
  });
  db.run(`CREATE INDEX IF NOT EXISTS idx_challenges_active ON habit_challenges(user_id, is_completed)`, (err) => {
    if (err) console.error('Error creating index idx_challenges_active:', err);
  });
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_analytics_habit_date ON habit_analytics(habit_id, date)`, (err) => {
    if (err) console.error('Error creating index idx_analytics_habit_date:', err);
  });
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_reminders_habit_id ON habit_reminders(habit_id)`, (err) => {
    if (err) console.error('Error creating index idx_reminders_habit_id:', err);
  });
  db.run(`CREATE INDEX IF NOT EXISTS idx_reminders_enabled ON habit_reminders(is_enabled)`, (err) => {
    if (err) console.error('Error creating index idx_reminders_enabled:', err);
  });

  // Migrate existing habits table to add new columns if they don't exist
  migrateHabitsTable();

  console.log('✅ Database initialized with all habit tracking tables');
  console.log('✅ Indexes created for optimal performance');
};

// Migration function to add missing columns to existing habits table
const migrateHabitsTable = () => {
  db.get("PRAGMA table_info(habits)", (err, result) => {
    if (err) {
      console.error('Error checking habits table:', err);
      return;
    }

    // Get all column names
    db.all("PRAGMA table_info(habits)", (err, columns) => {
      if (err) {
        console.error('Error getting column info:', err);
        return;
      }

      const columnNames = columns.map(col => col.name);
      console.log('📊 Existing habits columns:', columnNames.join(', '));

      // Add missing columns
      const columnsToAdd = [
        { name: 'longest_streak', sql: 'ALTER TABLE habits ADD COLUMN longest_streak INTEGER DEFAULT 0' },
        { name: 'total_completions', sql: 'ALTER TABLE habits ADD COLUMN total_completions INTEGER DEFAULT 0' },
        { name: 'is_active', sql: 'ALTER TABLE habits ADD COLUMN is_active BOOLEAN DEFAULT 1' },
        { name: 'target_streak', sql: 'ALTER TABLE habits ADD COLUMN target_streak INTEGER DEFAULT 30' },
        { name: 'start_date', sql: 'ALTER TABLE habits ADD COLUMN start_date DATE' },
        { name: 'updated_at', sql: 'ALTER TABLE habits ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP' }
      ];

      columnsToAdd.forEach(({ name, sql }) => {
        if (!columnNames.includes(name)) {
          db.run(sql, (err) => {
            if (err) {
              console.error(`Error adding column ${name}:`, err);
            } else {
              console.log(`✅ Added column: ${name}`);
            }
          });
        }
      });

      // Check if category exists (might be missing in old databases)
      if (!columnNames.includes('category')) {
        db.run('ALTER TABLE habits ADD COLUMN category VARCHAR(50)', (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding category column:', err);
          } else {
            console.log('✅ Added column: category');
          }
        });
      }

      // Check for other potentially missing columns
      const optionalColumns = [
        { name: 'difficulty', sql: 'ALTER TABLE habits ADD COLUMN difficulty TEXT CHECK(difficulty IN (\'easy\', \'medium\', \'hard\')) DEFAULT \'easy\'' },
        { name: 'frequency', sql: 'ALTER TABLE habits ADD COLUMN frequency TEXT DEFAULT \'daily\'' },
        { name: 'reminder_time', sql: 'ALTER TABLE habits ADD COLUMN reminder_time VARCHAR(10)' },
        { name: 'description', sql: 'ALTER TABLE habits ADD COLUMN description TEXT' },
        { name: 'trigger', sql: 'ALTER TABLE habits ADD COLUMN "trigger" TEXT' },
        { name: 'replacement', sql: 'ALTER TABLE habits ADD COLUMN replacement TEXT' }
      ];

      optionalColumns.forEach(({ name, sql }) => {
        if (!columnNames.includes(name)) {
          db.run(sql, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error(`Error adding column ${name}:`, err);
            } else if (!err) {
              console.log(`✅ Added column: ${name}`);
            }
          });
        }
      });
    });
  });

  // Migrate habit_completions table
  db.all("PRAGMA table_info(habit_completions)", (err, columns) => {
    if (!err && columns) {
      const columnNames = columns.map(col => col.name);
      
      const completionColumnsToAdd = [
        { name: 'mood', sql: 'ALTER TABLE habit_completions ADD COLUMN mood INTEGER CHECK(mood >= 1 AND mood <= 10)' },
        { name: 'trigger', sql: 'ALTER TABLE habit_completions ADD COLUMN "trigger" TEXT' },
        { name: 'location', sql: 'ALTER TABLE habit_completions ADD COLUMN location TEXT' },
        { name: 'time_of_day', sql: 'ALTER TABLE habit_completions ADD COLUMN time_of_day VARCHAR(20)' },
        { name: 'completion_time', sql: 'ALTER TABLE habit_completions ADD COLUMN completion_time TIME' }
      ];

      completionColumnsToAdd.forEach(({ name, sql }) => {
        if (!columnNames.includes(name)) {
          db.run(sql, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error(`Error adding column ${name} to habit_completions:`, err);
            } else if (!err) {
              console.log(`✅ Added column to habit_completions: ${name}`);
            }
          });
        }
      });
    }
  });
};

module.exports = { db, initDatabase };

