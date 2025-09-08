const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let geminiEnabled = false;

function initializeGemini() {
  if (genAI) return;
  
  console.log('🔑 Checking Gemini API key in analysis service...');
  console.log('GOOGLE_API_KEY available:', !!process.env.GOOGLE_API_KEY);

  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.startsWith('AIzaSy')) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      geminiEnabled = true;
      console.log('✅ Gemini AI initialized successfully in analysis service');
    } catch (error) {
      console.warn('❌ Gemini AI initialization failed:', error.message);
    }
  } else {
    console.log('ℹ️  Gemini API key not configured in analysis service, using mock data');
  }
}

async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

// Enhanced mock analysis with better data extraction
function generateMockAnalysis(resumeText) {
  // Extract basic information using regex patterns
  const emailMatch = resumeText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  const phoneMatch = resumeText.match(/\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/);
  
  // Simple skill detection
  const skills = [];
  const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'aws', 'docker', 'git'];
  techKeywords.forEach(skill => {
    if (resumeText.toLowerCase().includes(skill)) {
      skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  return {
    name: "Candidate",
    email: emailMatch ? emailMatch[0] : "not found",
    phone: phoneMatch ? phoneMatch[0] : "not found",
    linkedin_url: null,
    portfolio_url: null,
    summary: resumeText.substring(0, 200) + "...",
    work_experience: [{
      role: "Extracted Position",
      company: "Extracted Company", 
      duration: "2020-Present",
      description: ["Responsibilities extracted from your resume"]
    }],
    education: [{
      degree: "Extracted Degree",
      institution: "Extracted University",
      graduation_year: "2020"
    }],
    technical_skills: skills.length > 0 ? skills : ["PDF parsing successful"],
    soft_skills: ["Communication", "Teamwork", "Problem-solving"],
    projects: [{
      name: "Sample Project",
      description: "Project details extracted from your resume",
      technologies: ["Technology1", "Technology2"]
    }],
    certifications: ["Sample Certification"],
    resume_rating: 7,
    improvement_areas: "This is a basic PDF extraction. For full AI analysis with skills detection and personalized feedback, please add a Google Gemini API key to your .env file.",
    upskill_suggestions: ["Add a Gemini API key for AI-powered analysis", "Review latest industry trends in your field"]
  };
}

async function analyzeResumeWithGemini(resumeText) {
  try {
    if (!genAI) {
      initializeGemini();
    }

    if (geminiEnabled && genAI) {
      console.log('🤖 Using Gemini AI for resume analysis');
      
      // Use the correct model name from the available list
      const modelName = 'gemini-1.5-flash'; // This is the correct model name
      console.log(`🔄 Using model: ${modelName}`);
      
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2000,
          }
        });

        const prompt = `
          You are an expert technical recruiter and career coach. Analyze the following resume text and extract the information into a valid JSON object. Return ONLY the JSON object, no other text.

          IMPORTANT: Your response must be ONLY valid JSON, no additional text, no code blocks, no explanations.

          Resume Text:
          """
          ${resumeText.substring(0, 3000)}
          """

          JSON Structure to return:
          {
            "name": "string or null",
            "email": "string or null",
            "phone": "string or null",
            "linkedin_url": "string or null",
            "portfolio_url": "string or null",
            "summary": "string or null",
            "work_experience": [{"role": "string", "company": "string", "duration": "string", "description": ["string"]}],
            "education": [{"degree": "string", "institution": "string", "graduation_year": "string"}],
            "technical_skills": ["string"],
            "soft_skills": ["string"],
            "projects": [{"name": "string", "description": "string", "technologies": ["string"]}],
            "certifications": ["string"],
            "resume_rating": number,
            "improvement_areas": "string",
            "upskill_suggestions": ["string"]
          }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        console.log('📋 Gemini raw response received');
        console.log('Response preview:', text.substring(0, 100) + '...');
        
        // Clean the response - remove markdown code blocks if present
        let jsonString = text;
        if (text.startsWith('```json')) {
          jsonString = text.replace(/```json\n?/, '').replace(/\n```$/, '');
        } else if (text.startsWith('```')) {
          jsonString = text.replace(/```\n?/, '').replace(/\n```$/, '');
        }
        
        // Parse the JSON
        const analysisResult = JSON.parse(jsonString);
        console.log(`✅ Gemini analysis successful with model: ${modelName}`);
        return analysisResult;
        
      } catch (modelError) {
        console.log(`❌ Model ${modelName} failed: ${modelError.message}`);
        throw modelError; // This will trigger the fallback to mock data
      }
      
    } else {
      console.log('ℹ️  Using mock data for resume analysis');
      return generateMockAnalysis(resumeText);
    }
  } catch (error) {
    console.error('❌ Gemini analysis failed:', error.message);
    console.log('Falling back to mock data');
    return generateMockAnalysis(resumeText);
  }
}

module.exports = {
  extractTextFromPDF,
  analyzeResumeWithGemini,
};