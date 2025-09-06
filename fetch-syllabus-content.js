const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

// Same configuration as your working server.js
const DOCUMENT_ID = '1SjrxnkfMisN_SI6cfCbdsAbIc8-vCZTmdBlXBEt0ZMc';
const SCOPES = ['https://www.googleapis.com/auth/documents.readonly'];

async function getAuthClient() {
  // Try environment variable first (production method)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      const { JWT } = require('google-auth-library');
      const auth = new JWT({
        email: serviceAccountKey.client_email,
        key: serviceAccountKey.private_key,
        scopes: SCOPES,
      });
      console.log('✅ Using service account from environment variable');
      return auth;
    } catch (err) {
      console.error('❌ Error parsing service account key:', err.message);
    }
  }
  
  // Fallback to key file method (if you have one locally)
  try {
    const path = require('path');
    const KEY_FILE_PATH = path.join(__dirname, 'keys', 'gen-lang-client-0498984667-36c250233fb6.json');
    const { JWT } = require('google-auth-library');
    const auth = new JWT({
      keyFile: KEY_FILE_PATH,
      scopes: SCOPES,
    });
    console.log('✅ Using service account from key file');
    return auth;
  } catch (err) {
    console.error('❌ Key file method failed:', err.message);
  }
  
  throw new Error('No valid authentication method found');
}

async function readGoogleDoc() {
  try {
    const authClient = await getAuthClient();
    const docs = google.docs({
      version: 'v1',
      auth: authClient,
    });
    
    console.log('📄 Fetching Google Doc content...');
    const res = await docs.documents.get({ documentId: DOCUMENT_ID });
    const content = res.data.body.content;
    const syllabusText = extractTextFromDoc(content);
    
    console.log(`📊 Successfully extracted ${syllabusText.length} characters`);
    return syllabusText;
  } catch (err) {
    console.error('❌ Google Docs API error:', err.message);
    return null;
  }
}

function extractTextFromDoc(content) {
  let text = '';
  for (const element of content) {
    if (element.paragraph) {
      for (const run of element.paragraph.elements) {
        if (run.textRun) {
          text += run.textRun.content;
        }
      }
    }
  }
  return text;
}

async function main() {
  console.log('🚀 Fetching syllabus content for Q&A database generation...\n');
  
  const syllabusContent = await readGoogleDoc();
  if (!syllabusContent) {
    console.error('❌ Failed to fetch syllabus content');
    process.exit(1);
  }
  
  // Save the content to a file for manual analysis
  const fs = require('fs');
  const outputFile = 'syllabus-content.txt';
  fs.writeFileSync(outputFile, syllabusContent, 'utf8');
  
  console.log(`\n✅ Syllabus content saved to: ${outputFile}`);
  console.log('\n📋 First 500 characters:');
  console.log('='.repeat(50));
  console.log(syllabusContent.substring(0, 500));
  console.log('='.repeat(50));
  
  console.log(`\n📊 Total length: ${syllabusContent.length} characters`);
  console.log('\nNow I can analyze this content to generate the Q&A database focused on course content!');
}

main().catch(console.error);