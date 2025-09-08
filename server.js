const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// MANUAL ENVIRONMENT VARIABLE LOADING - MUST BE FIRST!
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
  console.log('✅ Manually loaded environment variables');
  console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'Present' : 'Missing');
} else {
  console.log('ℹ️  No .env file found');
}

// NOW import other modules that need environment variables
const resumeRoutes = require('./routes/resumeRoute');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/resumes', resumeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Resume Analyzer API is running',
    gemini_configured: !!process.env.GOOGLE_API_KEY
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Gemini API configured: ${!!process.env.GOOGLE_API_KEY}`);
});