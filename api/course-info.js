const fs = require('fs');
const path = require('path');
const QAMatcher = require('../qa-matcher');

// Load Q&A database
let qaDatabase;
let qaMatcher;

try {
  const dbPath = path.join(process.cwd(), 'mus176-qa-database.json');
  qaDatabase = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  qaMatcher = new QAMatcher(qaDatabase);
} catch (error) {
  console.error('❌ Failed to load Q&A database:', error);
}

// Google Docs API Authentication
async function getAuthClient() {
  // Parse the service account key from environment variable
  const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  
  const { JWT } = require('google-auth-library');
  const auth = new JWT({
    email: serviceAccountKey.client_email,
    key: serviceAccountKey.private_key,
    scopes: SCOPES,
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
    
    // Try to parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (err) {
    console.error('Error extracting course info:', err);
    
    // Check for quota exceeded error
    if (err.message && err.message.includes('429') && err.message.includes('quota')) {
      return {
        courseName: "Service temporarily unavailable",
        courseCode: "Please try again later",
        semester: "",
        year: "",
        instructor: "Contact instructor if this continues"
      };
    } else {
      return {
        courseName: "Not found",
        courseCode: "Not found", 
        semester: "Not found",
        year: "Not found",
        instructor: "Not found"
      };
    }
  }
}

// Vercel serverless function handler
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Q&A database is loaded
    if (!qaMatcher) {
      return res.status(503).json({ 
        courseName: "Service initializing",
        courseCode: "Please try again", 
        semester: "",
        year: "",
        instructor: "in a moment"
      });
    }

    // Get course information from database
    const courseInfo = qaMatcher.getCourseInfo();
    
    res.json(courseInfo);
  } catch (err) {
    console.error('Error processing request: ' + err);
    res.status(500).json({ 
      courseName: "Service error",
      courseCode: "Contact instructor", 
      semester: "",
      year: "",
      instructor: "donaghy@hawaii.edu"
    });
  }
}