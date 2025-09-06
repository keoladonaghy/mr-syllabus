const fs = require('fs');
const QAMatcher = require('./qa-matcher');

// Load the Q&A database
const qaDatabase = JSON.parse(fs.readFileSync('./mus176-qa-database.json', 'utf8'));
const qaMatcher = new QAMatcher(qaDatabase);

console.log('🧪 Testing Dr. Donaghy Biography Q&A');
console.log('===================================');

const biographyQuestions = [
  "What is the title of Dr. Donaghy's book?",
  "How many Nā Hōkū Hanohano Awards does Dr. Donaghy have?",
  "Where did Dr. Donaghy grow up on Maui?",
  "Is Dr. Donaghy married?",
  "Tell me about Dr. Donaghy's work in technology?"
];

biographyQuestions.forEach((question, index) => {
  console.log(`\n${index + 1}. Q: "${question}"`);
  const match = qaMatcher.findBestMatch(question);
  console.log(`   A: ${match.answer.substring(0, 100)}${match.answer.length > 100 ? '...' : ''}`);
  console.log(`   📊 Confidence: ${(match.confidence * 100).toFixed(1)}% | Category: ${match.category}`);
});

console.log(`\n✅ Biography Test Complete!`);
console.log(`📈 Database now has ${qaDatabase.qaPairs.length} Q&A pairs`);