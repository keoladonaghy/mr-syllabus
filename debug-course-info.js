const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Use the same configuration as your working app
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DOCUMENT_ID = '1SjrxnkfMisN_SI6cfCbdsAbIc8-vCZTmdBlXBEt0ZMc';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Use the same auth method as your working server.js
async function getAuthClient() {
  // Try environment variable first (Vercel style)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const { JWT } = require('google-auth-library');
    const auth = new JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: ['https://www.googleapis.com/auth/documents.readonly'],
    });
    return auth;
  }
  
  // Fallback to key file method (local development)
  const path = require('path');
  const KEY_FILE_PATH = path.join(__dirname, 'keys', 'gen-lang-client-0498984667-36c250233fb6.json');
  const { JWT } = require('google-auth-library');
  const auth = new JWT({
    keyFile: KEY_FILE_PATH,
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
  });
  return auth;
}

async function readGoogleDoc() {
  try {
    const authClient = await getAuthClient();
    const docs = google.docs({
      version: 'v1',
      auth: authClient,
    });
    const res = await docs.documents.get({ documentId: DOCUMENT_ID });
    const content = res.data.body.content;
    const syllabusText = extractTextFromDoc(content);
    return syllabusText;
  } catch (err) {
    console.error('The Google Docs API returned an error: ' + err);
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

async function extractCourseInfo(syllabusContent) {
  // Show first 500 characters to debug what we're working with
  console.log("First 500 characters of syllabus:");
  console.log("=====================================");
  console.log(syllabusContent.substring(0, 500));
  console.log("=====================================\n");

  const prompt = `Extract the following information from this syllabus text. Look at the very beginning of the document for course details:

1. Course Name (the full descriptive title of the course)
2. Course Code (usually 3-4 letters followed by 3 numbers, sometimes with a letter suffix like "a", "b", or "c")
3. Semester (determine from dates: if start date is August/08 = Fall, if January/01 = Spring)
4. Year (from the semester dates)
5. Instructor Name (look for text like "instructor:", "professor:", "teacher:" or similar indicators)

Return ONLY a JSON object in this exact format:
{
  "courseName": "course name here",
  "courseCode": "course code here", 
  "semester": "Fall or Spring",
  "year": "YYYY",
  "instructor": "instructor name here"
}

If any information is not found, use "Not found" as the value.

Syllabus text:
${syllabusContent.substring(0, 2000)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();
    
    console.log("AI Response:");
    console.log("=====================================");
    console.log(text);
    console.log("=====================================\n");
    
    // Try to parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("Parsed JSON:");
      console.log(parsed);
      return parsed;
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (err) {
    console.error('Error extracting course info:', err);
    return {
      courseName: "Not found",
      courseCode: "Not found", 
      semester: "Not found",
      year: "Not found",
      instructor: "Not found"
    };
  }
}

async function main() {
  console.log('Testing course information extraction...\n');
  
  const syllabusContent = await readGoogleDoc();
  if (!syllabusContent) {
    console.error('Failed to read Google Doc');
    return;
  }
  
  console.log(`Successfully read ${syllabusContent.length} characters from Google Doc\n`);
  
  const courseInfo = await extractCourseInfo(syllabusContent);
  
  console.log('\nFinal Result:');
  console.log('=====================================');
  console.log(JSON.stringify(courseInfo, null, 2));
}

main().catch(console.error);