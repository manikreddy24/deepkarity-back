const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function initializeDatabase() {
  try {
    const dbPath = path.join(__dirname, '..', 'resume_analyzer.db');
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create the resumes table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name TEXT NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        name TEXT,
        email TEXT,
        phone TEXT,
        linkedin_url TEXT,
        portfolio_url TEXT,
        summary TEXT,
        work_experience TEXT,
        education TEXT,
        technical_skills TEXT,
        soft_skills TEXT,
        projects TEXT,
        certifications TEXT,
        resume_rating INTEGER,
        improvement_areas TEXT,
        upskill_suggestions TEXT
      )
    `);

    console.log('✅ SQLite database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Error initializing SQLite database:', error);
    throw error;
  }
}

module.exports = initializeDatabase;