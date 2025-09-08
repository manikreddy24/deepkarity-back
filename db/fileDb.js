const fs = require('fs').promises;
const path = require('path');

class FileDb {
  constructor() {
    this.dbPath = process.env.NODE_ENV === 'production' 
      ? '/tmp/resume_analyzer.json'
      : path.join(__dirname, '..', 'resume_analyzer.json');
    this.data = { resumes: [], nextId: 1 };
  }

  async init() {
    try {
      const fileContent = await fs.readFile(this.dbPath, 'utf8');
      this.data = JSON.parse(fileContent);
      console.log('✅ Database loaded from file');
    } catch (error) {
      // File doesn't exist, start with empty data
      await this.save();
      console.log('✅ New database file created');
    }
    return this;
  }

  async save() {
    await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  async all(query, params) {
    // Simple query parsing for demonstration
    if (query.includes('SELECT') && query.includes('FROM resumes')) {
      let results = this.data.resumes;
      
      // Handle ORDER BY
      if (query.includes('ORDER BY uploaded_at DESC')) {
        results = [...results].sort((a, b) => 
          new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
      }
      
      // Handle specific field selection
      if (query.includes('id, file_name, uploaded_at, name, email, resume_rating')) {
        results = results.map(resume => ({
          id: resume.id,
          file_name: resume.file_name,
          uploaded_at: resume.uploaded_at,
          name: resume.name,
          email: resume.email,
          resume_rating: resume.resume_rating
        }));
      }
      
      return results;
    }
    return [];
  }

  async get(query, params) {
    if (query.includes('SELECT') && query.includes('WHERE id = ?')) {
      return this.data.resumes.find(r => r.id === params[0]);
    }
    return null;
  }

  async run(query, params) {
    if (query.includes('INSERT INTO resumes')) {
      const resume = {
        id: this.data.nextId++,
        file_name: params[0],
        uploaded_at: new Date().toISOString(),
        name: params[1],
        email: params[2],
        phone: params[3],
        linkedin_url: params[4],
        portfolio_url: params[5],
        summary: params[6],
        work_experience: params[7],
        education: params[8],
        technical_skills: params[9],
        soft_skills: params[10],
        projects: params[11],
        certifications: params[12],
        resume_rating: params[13],
        improvement_areas: params[14],
        upskill_suggestions: params[15]
      };
      
      this.data.resumes.push(resume);
      await this.save();
      return { lastID: resume.id, changes: 1 };
    }

    if (query.includes('DELETE FROM resumes WHERE id = ?')) {
      const initialLength = this.data.resumes.length;
      this.data.resumes = this.data.resumes.filter(r => r.id !== params[0]);
      await this.save();
      return { changes: initialLength - this.data.resumes.length };
    }

    return { changes: 0 };
  }
}

module.exports = FileDb;