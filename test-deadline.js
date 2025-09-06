const fs = require('fs');
const QAMatcher = require('./qa-matcher');

const qaDatabase = JSON.parse(fs.readFileSync('./mus176-qa-database.json', 'utf8'));
const qaMatcher = new QAMatcher(qaDatabase);

console.log('🧪 Testing Deadline Response Fix');
console.log('===============================');

const deadlineQuestions = [
  "When is week 2's quiz and discussion board post due?",
  "When are assignments due?",
  "What time are things due?"
];

deadlineQuestions.forEach((question, index) => {
  console.log(`\n${index + 1}. Q: "${question}"`);
  const match = qaMatcher.findBestMatch(question);
  console.log(`   A: ${match.answer}`);
  console.log(`   📊 Confidence: ${(match.confidence * 100).toFixed(1)}% | Category: ${match.category}`);
});