const db = require('../db');
const { extractTextFromPDF, analyzeResumeWithGemini } = require('../services/analaysisService');

async function deleteResume(req, res) {
  try {
    const { id } = req.params;
    
    // First check if the resume exists
    const checkQuery = 'SELECT * FROM resumes WHERE id = ?';
    const existingResume = await db.get(checkQuery, [id]);
    
    if (!existingResume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Delete the resume
    const deleteQuery = 'DELETE FROM resumes WHERE id = ?';
    await db.run(deleteQuery, [id]);
    
    console.log(`✅ Resume with ID ${id} deleted successfully`);
    res.json({ 
      success: true, 
      message: 'Resume deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: error.message });
  }
}

async function uploadResume(req, res) {
  try {
    console.log('Upload resume request received');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname);

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(req.file.buffer);
    console.log('PDF text extracted successfully');
    
    // Analyze with our service
    const analysisResult = await analyzeResumeWithGemini(resumeText);
    console.log('Resume analysis completed');
    
    // Save to SQLite database
    const query = `
      INSERT INTO resumes (
        file_name, name, email, phone, linkedin_url, portfolio_url, summary,
        work_experience, education, technical_skills, soft_skills, projects,
        certifications, resume_rating, improvement_areas, upskill_suggestions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      req.file.originalname,
      analysisResult.name,
      analysisResult.email,
      analysisResult.phone,
      analysisResult.linkedin_url,
      analysisResult.portfolio_url,
      analysisResult.summary,
      JSON.stringify(analysisResult.work_experience || []),
      JSON.stringify(analysisResult.education || []),
      JSON.stringify(analysisResult.technical_skills || []),
      JSON.stringify(analysisResult.soft_skills || []),
      JSON.stringify(analysisResult.projects || []),
      JSON.stringify(analysisResult.certifications || []),
      analysisResult.resume_rating,
      analysisResult.improvement_areas,
      JSON.stringify(analysisResult.upskill_suggestions || [])
    ];
    
    const result = await db.run(query, values);
    const insertedId = result.lastID;
    
    // Get the inserted record
    const insertedRecord = await db.get('SELECT * FROM resumes WHERE id = ?', [insertedId]);
    
    res.json({
      success: true,
      data: insertedRecord
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getAllResumes(req, res) {
  try {
    const query = `
      SELECT id, file_name, uploaded_at, name, email, resume_rating
      FROM resumes 
      ORDER BY uploaded_at DESC
    `;
    const result = await db.all(query);
    res.json(result);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getResumeById(req, res) {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM resumes WHERE id = ?';
    const result = await db.get(query, [id]);
    
    if (!result) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  uploadResume,
  getAllResumes,
  getResumeById,
  deleteResume 
};