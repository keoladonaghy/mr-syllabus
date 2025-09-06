const fs = require('fs');
const path = require('path');
const QAMatcher = require('../qa-matcher');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load Q&A database
let qaDatabase;
let qaMatcher;

try {
  const dbPath = path.join(process.cwd(), 'mus176-qa-database.json');
  qaDatabase = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  qaMatcher = new QAMatcher(qaDatabase);
  console.log(`✅ Loaded ${qaDatabase.qaPairs.length} Q&A pairs from database`);
} catch (error) {
  console.error('❌ Failed to load Q&A database:', error);
}

// Multi-Tier Hybrid System: Q&A Database + Claude API + Gemini fallback
// Configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DOCUMENT_ID = '1SjrxnkfMisN_SI6cfCbdsAbIc8-vCZTmdBlXBEt0ZMc';
const SCOPES = ['https://www.googleapis.com/auth/documents.readonly'];

// Initialize Claude AI for primary fallback
let anthropic;
if (CLAUDE_API_KEY) {
  anthropic = new Anthropic({
    apiKey: CLAUDE_API_KEY,
    timeout: 45000, // 45 second timeout
    maxRetries: 2,  // Retry failed requests
  });
}

// Initialize Gemini AI for secondary fallback
let geminiModel;
if (GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

// Google Docs API functions
async function getAuthClient() {
  let auth;
  
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    auth = new JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: SCOPES,
    });
  } else {
    throw new Error('Google service account key not found in environment variables');
  }
  
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
    console.log('✅ Google Doc accessed successfully for fallback');
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

async function askClaudeWithGoogleDoc(question) {
  console.log('🔍 Debug: Checking Claude API configuration...');
  console.log(`   CLAUDE_API_KEY present: ${!!process.env.CLAUDE_API_KEY}`);
  console.log(`   anthropic initialized: ${!!anthropic}`);
  
  if (!anthropic) {
    throw new Error('Claude API not configured');
  }
  
  console.log('🔍 Debug: Attempting to read Google Doc...');
  const syllabusContent = await readGoogleDoc();
  if (!syllabusContent) {
    throw new Error('Could not access Google Doc');
  }
  
  console.log('🔍 Debug: Both Claude and Google Doc available, making API call...');
  
  const prompt = `You are Mr. Syllabus, a helpful AI assistant for students. Answer the user's question based **only** on the following syllabus content. 

Guidelines:
- Be concise and direct
- If the answer is not in the syllabus, say you don't have that specific information
- Suggest contacting the instructor for clarification when appropriate
- Be helpful and student-friendly

Syllabus Content:
${syllabusContent}

Student Question: ${question}

Please provide a helpful answer based on the syllabus:`;

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  return response.content[0].text;
}

async function askGeminiWithGoogleDoc(question) {
  if (!geminiModel) {
    throw new Error('Gemini API not configured');
  }
  
  console.log('🔍 Debug: Using Gemini as secondary fallback...');
  const syllabusContent = await readGoogleDoc();
  if (!syllabusContent) {
    throw new Error('Could not access Google Doc');
  }
  
  const prompt = `You are Mr. Syllabus, a helpful AI assistant for students. Answer the user's question based **only** on the following syllabus content.

Guidelines:
- Be concise and direct
- If the answer is not in the syllabus, say you don't have that specific information
- Suggest contacting the instructor for clarification when appropriate
- Be helpful and student-friendly

Syllabus Content:
${syllabusContent}

Student Question: ${question}

Please provide a helpful answer based on the syllabus:`;

  const result = await geminiModel.generateContent(prompt);
  const response = result.response;
  return await response.text();
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Please provide a question.' });
  }

  try {
    // Check if Q&A database is loaded
    if (!qaMatcher) {
      return res.status(503).json({ error: 'Mr. Syllabus is initializing. Please try again in a moment.' });
    }

    // Step 1: Try to find answer in pre-generated Q&A database
    const match = qaMatcher.findBestMatch(question);
    
    // Step 2: If confidence is high enough, return database answer (fast response)
    if (match.confidence >= 0.25) {
      console.log(`📊 Database match found: ${(match.confidence * 100).toFixed(1)}% confidence`);
      return res.json({ 
        answer: match.answer,
        confidence: match.confidence,
        category: match.category,
        source: 'database'
      });
    }

    // Step 3: Multi-tier AI fallback system
    console.log(`🔄 Low confidence (${(match.confidence * 100).toFixed(1)}%), using AI fallback`);
    
    // Try Claude API first
    if (anthropic) {
      try {
        console.log('🔄 Attempting Claude API...');
        const claudeAnswer = await askClaudeWithGoogleDoc(question);
        return res.json({
          answer: claudeAnswer,
          confidence: 0.8,
          category: 'claude_fallback',
          source: 'google_doc_claude'
        });
      } catch (claudeError) {
        console.error('❌ Claude fallback failed:', claudeError.message);
        console.log('🔄 Trying Gemini as secondary fallback...');
      }
    }
    
    // Try Gemini API as secondary fallback
    if (geminiModel) {
      try {
        const geminiAnswer = await askGeminiWithGoogleDoc(question);
        return res.json({
          answer: geminiAnswer,
          confidence: 0.7,
          category: 'gemini_fallback', 
          source: 'google_doc_gemini'
        });
      } catch (geminiError) {
        console.error('❌ Gemini fallback also failed:', geminiError.message);
      }
    }
    
    // Step 4: If all AI fails, return database match with disclaimer
    return res.json({
      answer: match.answer + "\n\nNote: I couldn't access the live syllabus to provide a more detailed answer. Please check the complete syllabus in Lamakū or contact Dr. Keola Donaghy at donaghy@hawaii.edu for clarification.",
      confidence: match.confidence,
      category: match.category,
      source: 'database_fallback'
    });
    
  } catch (err) {
    console.error('Error processing request: ' + err);
    res.status(500).json({ 
      error: 'An error occurred while processing your request. Please contact your instructor at donaghy@hawaii.edu if this continues.' 
    });
  }
}