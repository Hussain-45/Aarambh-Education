const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const NEW_ADMIN_USER = 'aarambheducation8@gmail.com';
const NEW_ADMIN_PASS = 'Neeraj@aarambh';

async function resetAllData() {
  const hash = await bcrypt.hash(NEW_ADMIN_PASS, 10);
  console.log('Generated bcrypt hash for new admin credentials.');

  // 1. Reset Local SQLite database
  const dbPath = path.resolve(__dirname, 'aarambh.db');
  if (require('fs').existsSync(dbPath)) {
    const db = new sqlite3.Database(dbPath);
    db.serialize(() => {
      console.log('[SQLite] Deleting all non-admin users, fees, attendance, etc...');
      db.run(`DELETE FROM users`);
      db.run(`DELETE FROM fees`);
      db.run(`DELETE FROM attendance`);
      db.run(`DELETE FROM registration_requests`);
      db.run(`DELETE FROM doubt_tickets`);
      db.run(`DELETE FROM assignments`);
      db.run(`DELETE FROM library`);
      db.run(`DELETE FROM expenses`);
      db.run(`DELETE FROM announcements`);
      db.run(`DELETE FROM quiz_attempts`);
      db.run(`DELETE FROM quiz_questions`);
      db.run(`DELETE FROM quizzes`);
      db.run(`DELETE FROM student_badges`);
      db.run(`DELETE FROM flashcard_decks`);
      db.run(`DELETE FROM study_planner`);
      db.run(`DELETE FROM batch_messages`);
      db.run(`DELETE FROM leads`);
      db.run(`DELETE FROM support_tickets`);
      db.run(`DELETE FROM audit_logs`);

      db.run(
        `INSERT INTO users (name, username, password, role, email) VALUES (?, ?, ?, ?, ?)`,
        ['System Admin', NEW_ADMIN_USER, hash, 'admin', NEW_ADMIN_USER],
        (err) => {
          if (err) console.error('[SQLite Error Seeding Admin]', err.message);
          else console.log('[SQLite] Admin reset successfully to:', NEW_ADMIN_USER);
        }
      );
    });
  }

  // 2. Reset Supabase Cloud PostgreSQL database
  const supabaseUrl = 'postgresql://postgres.zwnfzayfvosqpbtebcen:Aarambh.2026@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
  console.log('[Supabase Cloud] Connecting to reset cloud database...');
  
  const pool = new Pool({
    connectionString: supabaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await pool.query(`DELETE FROM users`);
    console.log('[Supabase Cloud] Cleared users table.');

    await pool.query(
      `INSERT INTO users (name, username, password, role, email) VALUES ($1, $2, $3, $4, $5)`,
      ['System Admin', NEW_ADMIN_USER, hash, 'admin', NEW_ADMIN_USER]
    );
    console.log('[Supabase Cloud] Admin account reset successfully to:', NEW_ADMIN_USER);

  } catch (err) {
    console.error('[Supabase Cloud Error]', err.message);
  } finally {
    await pool.end();
    console.log('Reset complete!');
  }
}

resetAllData();
