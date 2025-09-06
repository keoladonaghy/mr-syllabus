const fs = require('fs');
const QAMatcher = require('./qa-matcher');

// Load the Q&A database
const qaDatabase = JSON.parse(fs.readFileSync('./mus176-qa-database.json', 'utf8'));
const qaMatcher = new QAMatcher(qaDatabase);

console.log('🔍 Debug Matching Process');
console.log('========================');

const question = "What is the grading policy?";
const normalizedQuestion = qaMatcher.normalizeText(question);
const questionWords = qaMatcher.extractKeywords(normalizedQuestion);

console.log(`Question: "${question}"`);
console.log(`Normalized: "${normalizedQuestion}"`);
console.log(`Keywords: [${questionWords.join(', ')}]`);
console.log('\n📊 Scoring each Q&A pair:');

// Find grading-related Q&A pairs
const gradingPairs = qaDatabase.qaPairs.filter(pair => pair.category === 'grade');
console.log(`\nFound ${gradingPairs.length} grading Q&A pairs:`);

gradingPairs.forEach(pair => {
  console.log(`\nID ${pair.id}: "${pair.question}"`);
  console.log(`Keywords: [${pair.keywords.join(', ')}]`);
  
  const score = qaMatcher.calculateMatchScore(questionWords, pair, normalizedQuestion);
  console.log(`Total Score: ${(score * 100).toFixed(1)}%`);
  
  // Break down the scoring
  const intentScore = qaMatcher.calculateIntentScore(normalizedQuestion, pair);
  const keywordScore = qaMatcher.calculateKeywordScore(normalizedQuestion, pair.keywords);
  const semanticScore = qaMatcher.calculateSemanticScore(questionWords, pair);
  const categoryScore = qaMatcher.calculateCategoryBonus(normalizedQuestion, pair.category);
  
  console.log(`  Intent: ${(intentScore * 100).toFixed(1)}% (weight: 40%)`);
  console.log(`  Keywords: ${(keywordScore * 100).toFixed(1)}% (weight: 30%)`);
  console.log(`  Semantic: ${(semanticScore * 100).toFixed(1)}% (weight: 20%)`);
  console.log(`  Category: ${(categoryScore * 100).toFixed(1)}% (weight: 10%)`);
});