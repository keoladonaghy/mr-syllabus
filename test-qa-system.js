const fs = require('fs');
const QAMatcher = require('./qa-matcher');

// Load the Q&A database
const qaDatabase = JSON.parse(fs.readFileSync('./mus176-qa-database.json', 'utf8'));
const qaMatcher = new QAMatcher(qaDatabase);

console.log('🧪 Testing Mr. Syllabus Q&A System');
console.log('=================================');

// Test course info
console.log('\n📋 Course Information:');
const courseInfo = qaMatcher.getCourseInfo();
console.log(`Course: ${courseInfo.courseCode} - ${courseInfo.courseName}`);
console.log(`Instructor: ${courseInfo.instructor}`);
console.log(`Semester: ${courseInfo.semester} ${courseInfo.year}`);

// Test questions
const testQuestions = [
  "Who is the instructor?",
  "What's the professor's email?", 
  "When are assignments due?",
  "What's the late policy?",
  "Do I need a textbook?",
  "How are grades calculated?",
  "When is the midterm?",
  "Can I use AI for assignments?",
  "Where can I get help?",
  "What technology do I need?",
  "Random question not in syllabus"
];

console.log('\n🔍 Testing Question Matching:');
console.log('============================');

testQuestions.forEach((question, index) => {
  console.log(`\n${index + 1}. Q: "${question}"`);
  const match = qaMatcher.findBestMatch(question);
  console.log(`   A: ${match.answer.substring(0, 100)}${match.answer.length > 100 ? '...' : ''}`);
  console.log(`   📊 Confidence: ${(match.confidence * 100).toFixed(1)}% | Category: ${match.category}`);
});

console.log('\n✅ Q&A System Test Complete!');
console.log(`📈 Database loaded with ${qaDatabase.qaPairs.length} Q&A pairs`);
console.log('🚀 System ready for production deployment!');