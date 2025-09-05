const express = require('express');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();
app.use(express.json()); // Allows the app to parse JSON from incoming requests

// --- Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DOCUMENT_ID = '1SjrxnkfMisN_SI6cfCbdsAbIc8-vCZTmdBlXBEt0ZMc';
const KEY_FILE_PATH = path.join(__dirname, 'keys', 'gen-lang-client-0498984667-36c250233fb6.json');
const SCOPES = ['https://www.googleapis.com/auth/documents.readonly'];

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// --- Google Docs API Authentication and Function to Read Syllabus ---
async function getAuthClient() {
  const auth = new JWT({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
  });
  return auth;
}

let syllabusContent = ''; // Store the syllabus content in a variable

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

// Read the syllabus once when the server starts up
readGoogleDoc().then(text => {
  if (text) {
    syllabusContent = text;
    console.log('Syllabus content loaded and ready for use.');
  } else {
    console.error('Failed to load syllabus content. The bot will not be able to answer questions.');
  }
});

// --- API Endpoint to Handle Student Questions ---
app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!syllabusContent) {
    return res.status(503).json({ error: 'Syllabus content is not yet available. Please try again in a moment.' });
  }

  if (!question) {
    return res.status(400).json({ error: 'Please provide a question.' });
  }

  try {
    const prompt = `You are Mr. Syllabus, a helpful AI assistant. Answer the user's questions based **only** on the following syllabus text. If the answer is not found in the syllabus, state that you do not have the information.

Syllabus:
${syllabusContent}

User's question:
${question}

Your answer:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();

    res.json({ answer: text });
  } catch (err) {
    console.error('The Gemini API returned an error: ' + err);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// Serve the test.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test.html'));
});

// --- Start the Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});