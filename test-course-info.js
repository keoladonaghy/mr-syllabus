const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DOCUMENT_ID = '1SjrxnkfMisN_SI6cfCbdsAbIc8-vCZTmdBlXBEt0ZMc';
const SCOPES = ['https://www.googleapis.com/auth/documents.readonly'];

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function getAuthClient() {
  let auth;
  
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    // Use service account key from environment variable
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    auth = new JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: SCOPES,
    });
  } else {
    console.error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
    process.exit(1);
  }
  
  return auth;
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
    console.log('Syllabus content successfully read from Google Doc! ✅');
    return syllabusText;
  } catch (err) {
    console.error('The Google Docs API returned an error: ' + err);
    return null;
  }
}

async function extractCourseInfo(syllabusText) {
  try {
    const prompt = `Extract the following information from this syllabus text and return it in JSON format:

1. Course name and alpha-numeric code (usually 3-4 letters + 3 numbers, sometimes + single letter like "a/b/c")
2. Semester and year (look for semester dates - if start date is August/08 = Fall, if January/01 = Spring)
3. Instructor's name (usually follows "instructor:" but may be formatted differently)

Return ONLY a JSON object with this structure:
{
  "courseName": "Full course name",
  "courseCode": "COURSE123",
  "semester": "Fall",
  "year": "2024", 
  "instructor": "Professor Name"
}

If any information is not found, use "Not found" as the value.

Syllabus text:
${syllabusText}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();
    
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not extract JSON from response');
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
  console.log('Testing course information extraction...');
  
  const syllabusText = await readGoogleDoc();
  
  if (!syllabusText) {
    console.error('Failed to read syllabus from Google Doc');
    return;
  }
  
  console.log('\n--- First 500 characters of syllabus ---');
  console.log(syllabusText.substring(0, 500) + '...');
  
  console.log('\n--- Extracting course information ---');
  const courseInfo = await extractCourseInfo(syllabusText);
  
  console.log('\n--- Extracted Course Information ---');
  console.log(JSON.stringify(courseInfo, null, 2));
}

main().catch(console.error);