const Database = require('better-sqlite3');
const path = require('path');

function initializeDatabase() {
  try {
    const dbPath = process.env.NODE_ENV === 'production' 
      ? '/tmp/resume_analyzer.db'  // Use /tmp directory in production
      : path.join(__dirname, '..', 'resume_analyzer.db');
    
    console.log('📊 Database path:', dbPath);
    
    const db = new Database(dbPath);
    
    // Create the resumes table if it doesn't exist
    db.exec(`
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

    // Create indexes for better performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_resumes_email ON resumes(email);
      CREATE INDEX IF NOT EXISTS idx_resumes_uploaded_at ON resumes(uploaded_at);
    `);

    console.log('✅ SQLite database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Error initializing SQLite database:', error);
    throw error;
  }
}

module.exports = initializeDatabase;
