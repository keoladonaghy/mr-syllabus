const fs = require('fs');
const QAMatcher = require('./qa-matcher');

// Load the Q&A database
const qaDatabase = JSON.parse(fs.readFileSync('./mus176-qa-database.json', 'utf8'));
const qaMatcher = new QAMatcher(qaDatabase);

console.log('🧪 Testing Grading Policy Fix');
console.log('=============================');

const gradingQuestions = [
  "What is the grading policy?",
  "How are grades calculated?", 
  "What's the grading breakdown?",
  "What percentage do I need for an A?",
  "What's the late policy?",
  "Can I turn in late work?"
];

gradingQuestions.forEach((question, index) => {
  console.log(`\n${index + 1}. Q: "${question}"`);
  const match = qaMatcher.findBestMatch(question);
  console.log(`   A: ${match.answer.substring(0, 80)}${match.answer.length > 80 ? '...' : ''}`);
  console.log(`   📊 Confidence: ${(match.confidence * 100).toFixed(1)}% | Category: ${match.category}`);
});