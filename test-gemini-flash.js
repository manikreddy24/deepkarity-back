const https = require('https');

console.log('🔍 Testing network connectivity to Google APIs...');

// Test 1: Basic connectivity to Google
https.get('https://www.google.com', (res) => {
  console.log('✅ Can reach google.com');
}).on('error', (err) => {
  console.log('❌ Cannot reach google.com:', err.message);
});

// Test 2: Test Gemini API endpoint directly
const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: '/v1beta/models/gemini-1.5-flash?key=AIzaSyDaWEJZnrpyikPm_GUxYZ1DQjo6rnQXyPU',
  method: 'GET',
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log(`✅ Gemini API endpoint accessible. Status: ${res.statusCode}`);
});

req.on('error', (err) => {
  console.log('❌ Gemini API endpoint not accessible:', err.message);
});

req.on('timeout', () => {
  console.log('❌ Request timeout - check your internet connection');
  req.destroy();
});

req.end();