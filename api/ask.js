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
  console.log(`✅ Loaded ${qaDatabase.qaPairs.length} Q&A pairs from database`);
} catch (error) {
  console.error('❌ Failed to load Q&A database:', error);
}

// Q&A Database powered system - no external API calls needed

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

    // Find the best matching answer from pre-generated database
    const match = qaMatcher.findBestMatch(question);
    
    // Return the matched answer
    res.json({ 
      answer: match.answer,
      confidence: match.confidence,
      category: match.category
    });
    
  } catch (err) {
    console.error('Error processing request: ' + err);
    res.status(500).json({ 
      error: 'An error occurred while processing your request. Please contact your instructor at donaghy@hawaii.edu if this continues.' 
    });
  }
}