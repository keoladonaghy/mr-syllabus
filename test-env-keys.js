const dotenv = require('dotenv');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const Anthropic = require('@anthropic-ai/sdk');

// Load environment variables
dotenv.config();

console.log('🧪 Testing Environment Keys');
console.log('============================');

// Test 1: Check if keys are loaded
console.log('\n1️⃣ Environment Variables Check:');
console.log(`   CLAUDE_API_KEY: ${process.env.CLAUDE_API_KEY ? '✅ Present' : '❌ Missing'}`);
console.log(`   GOOGLE_SERVICE_ACCOUNT_KEY: ${process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? '✅ Present' : '❌ Missing'}`);

// Test 2: Test Google Service Account Key
async function testGoogleAuth() {
  console.log('\n2️⃣ Google Service Account Authentication:');
  try {
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    console.log(`   ✅ JSON parsing successful`);
    console.log(`   📧 Service account email: ${serviceAccountKey.client_email}`);
    
    const auth = new JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: ['https://www.googleapis.com/auth/documents.readonly'],
    });

    // Test authentication by getting access token
    await auth.authorize();
    console.log(`   ✅ Authentication successful`);
    return true;
  } catch (error) {
    console.log(`   ❌ Authentication failed: ${error.message}`);
    return false;
  }
}

// Test 3: Test Claude API Key
async function testClaudeAPI() {
  console.log('\n3️⃣ Claude API Key Test:');
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    // Simple test message
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: 'Reply with exactly "API key is working" if you receive this message.'
      }]
    });

    const result = response.content[0].text.trim();
    console.log(`   📤 Test message sent`);
    console.log(`   📥 Response: "${result}"`);
    console.log(`   ✅ Claude API working correctly`);
    return true;
  } catch (error) {
    console.log(`   ❌ Claude API failed: ${error.message}`);
    return false;
  }
}

// Test 4: Test Google Docs access (if auth works)
async function testGoogleDocsAccess() {
  console.log('\n4️⃣ Google Docs Access Test:');
  try {
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: ['https://www.googleapis.com/auth/documents.readonly'],
    });

    const docs = google.docs({
      version: 'v1',
      auth: auth,
    });

    const DOCUMENT_ID = '1SjrxnkfMisN_SI6cfCbdsAbIc8-vCZTmdBlXBEt0ZMc';
    const res = await docs.documents.get({ documentId: DOCUMENT_ID });
    
    console.log(`   ✅ Document access successful`);
    console.log(`   📄 Document title: "${res.data.title}"`);
    
    // Count content elements
    const contentElements = res.data.body.content.length;
    console.log(`   📊 Content elements: ${contentElements}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Document access failed: ${error.message}`);
    if (error.message.includes('permission')) {
      console.log(`   💡 Solution: Share your Google Doc with: ${JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY).client_email}`);
    }
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const googleAuth = await testGoogleAuth();
  const claudeAPI = await testClaudeAPI();
  
  if (googleAuth) {
    await testGoogleDocsAccess();
  }

  console.log('\n🏁 Test Summary:');
  console.log(`   Google Auth: ${googleAuth ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Claude API: ${claudeAPI ? '✅ Working' : '❌ Failed'}`);
  
  if (googleAuth && claudeAPI) {
    console.log('\n🎉 All systems ready for hybrid operation!');
  } else {
    console.log('\n⚠️  Some issues detected. Check the logs above.');
  }
}

runAllTests().catch(console.error);