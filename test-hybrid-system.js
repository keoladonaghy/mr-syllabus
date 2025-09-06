const fs = require('fs');
const QAMatcher = require('./qa-matcher');

// Load the Q&A database
const qaDatabase = JSON.parse(fs.readFileSync('./mus176-qa-database.json', 'utf8'));
const qaMatcher = new QAMatcher(qaDatabase);

console.log('🧪 Testing Hybrid System Logic');
console.log('==============================');

const testQuestions = [
  // High confidence questions (should use database)
  { q: "What is the grading policy?", expectedSource: "database" },
  { q: "Who is the instructor?", expectedSource: "database" },
  { q: "How many Nā Hōkū Hanohano Awards does Dr. Donaghy have?", expectedSource: "database" },
  
  // Low confidence questions (should trigger fallback)
  { q: "What did Dr. Donaghy have for lunch yesterday?", expectedSource: "fallback" },
  { q: "What is the meaning of life according to the syllabus?", expectedSource: "fallback" },
  { q: "Tell me about the weather in Hawaii", expectedSource: "fallback" }
];

console.log('\n📊 Testing matching logic:');
testQuestions.forEach((test, index) => {
  const match = qaMatcher.findBestMatch(test.q);
  const confidence = match.confidence;
  const wouldUseFallback = confidence < 0.25;
  const actualSource = wouldUseFallback ? "fallback" : "database";
  const isCorrect = actualSource === test.expectedSource;
  
  console.log(`\n${index + 1}. Q: "${test.q}"`);
  console.log(`   📊 Confidence: ${(confidence * 100).toFixed(1)}%`);
  console.log(`   🎯 Would use: ${actualSource} | Expected: ${test.expectedSource} ${isCorrect ? '✅' : '❌'}`);
  if (!wouldUseFallback) {
    console.log(`   💬 Answer: ${match.answer.substring(0, 60)}...`);
  }
});

console.log('\n✅ Hybrid System Logic Test Complete!');
console.log('\n🔧 System Configuration:');
console.log(`   • Database threshold: 25%`);
console.log(`   • Q&A pairs loaded: ${qaDatabase.qaPairs.length}`);
console.log(`   • Fallback: Google Doc + Claude AI`);
console.log(`   • Final fallback: Database match with disclaimer`);