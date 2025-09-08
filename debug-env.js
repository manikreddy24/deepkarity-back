console.log('🔍 Debugging environment variables...');
console.log('Process environment keys:', Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('PORT')));

// Test dotenv loading
require('dotenv').config();
console.log('After dotenv config:');
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'Present' : 'Missing');
console.log('PORT:', process.env.PORT);

// Check if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('📄 .env file content:');
  console.log(content);
} else {
  console.log('❌ .env file does not exist');
}