const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create schema
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS steps (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id  INTEGER NOT NULL,
    date       TEXT NOT NULL,
    steps      INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_steps_member_date ON steps(member_id, date);
`);

function seedDatabase() {
  const count = db.prepare('SELECT COUNT(*) as c FROM members').get().c;
  if (count > 0) return;

  console.log('Seeding database with sample data...');

  const seedNames = ['Alex Kim', 'Sam Rivera', 'Jordan Lee', 'Taylor Wong', 'Morgan Chen'];
  const insertMember = db.prepare('INSERT INTO members (name) VALUES (?)');
  const insertSteps = db.prepare(
    'INSERT OR IGNORE INTO steps (member_id, date, steps) VALUES (?, ?, ?)'
  );

  // Use a seeded pseudo-random for reproducibility
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  const today = new Date();

  db.transaction(() => {
    for (const name of seedNames) {
      const { lastInsertRowid: memberId } = insertMember.run(name);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const steps = Math.floor(6000 + rand() * 9001);
        insertSteps.run(memberId, dateStr, steps);
      }
    }
  })();

  console.log('Seeding complete.');
}

seedDatabase();

module.exports = db;
