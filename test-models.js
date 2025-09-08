const https = require('https');

const API_KEY = 'AIzaSyDaWEJZnrpyikPm_GUxYZ1DQjo6rnQXyPU';

function testAPIKey() {
  console.log('🔍 Testing API key directly...');
  
  // Test 1: List available models
  const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  https.get(modelsUrl, (response) => {
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      console.log('📋 Models API Response:');
      console.log('Status Code:', response.statusCode);
      
      if (response.statusCode === 200) {
        try {
          const models = JSON.parse(data);
          console.log('✅ API Key is valid!');
          console.log('Available models:');
          if (models.models && models.models.length > 0) {
            models.models.forEach(model => {
              console.log(`- ${model.name} (${model.displayName || 'No display name'})`);
            });
          } else {
            console.log('No models found in response');
            console.log('Full response:', data);
          }
        } catch (e) {
          console.log('Response data:', data);
        }
      } else {
        console.log('❌ API Key test failed');
        console.log('Response:', data);
      }
    });
    
  }).on('error', (error) => {
    console.error('❌ Error testing API key:', error.message);
  });
}

testAPIKey();