import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/polls.db' // Render persistent disk
  : join(__dirname, process.env.DB_PATH || '../data/polls.db');

export let db;

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err);
        reject(err);
        return;
      }

      console.log('✅ Connected to SQLite database');

      // Ensure sequential execution
      db.serialize(() => {
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');

        // Create polls table
        db.run(`
          CREATE TABLE IF NOT EXISTS polls (
            id TEXT PRIMARY KEY,
            question TEXT NOT NULL,
            options TEXT NOT NULL,
            expiry DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create votes table
        db.run(`
          CREATE TABLE IF NOT EXISTS votes (
            id TEXT PRIMARY KEY,
            poll_id TEXT NOT NULL,
            choice INTEGER NOT NULL,
            voter_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (poll_id) REFERENCES polls (id) ON DELETE CASCADE,
            UNIQUE(poll_id, voter_hash)
          )
        `, (err) => {
          if (err) {
            console.error('❌ Error creating votes table:', err);
            reject(err);
          } else {
            console.log('✅ Database initialized successfully');
            resolve();
          }
        });
      });
    });
  });
}

export function getDatabase() {
  return db;
}
