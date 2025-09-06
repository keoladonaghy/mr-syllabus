# Mr. Syllabus Q&A Database Integration Guide

This guide explains how to integrate the generated Q&A database to replace real-time AI calls in your web application.

## 🎯 Overview

The comprehensive Q&A database contains **104 question-answer pairs** across 7 categories, providing instant responses to student inquiries without requiring API calls to external AI services.

## 📊 Database Statistics

- **Total Q&A Pairs**: 104
- **Total Keywords**: 448
- **Categories**: 7 (Contact, Grade, Deadline, Policy, Logistics, Assignment, Support)
- **Average Keywords per Q&A**: 4.3

### Category Breakdown:
- **Contact**: 11 Q&As - Instructor communication, office hours, email
- **Grade**: 16 Q&As - Grading policies, grade calculation, grade scale
- **Deadline**: 12 Q&As - Due dates, exam schedules, assignment timelines
- **Policy**: 17 Q&As - Course policies (attendance, late work, academic integrity)
- **Logistics**: 25 Q&As - Course basics, materials, technology requirements
- **Assignment**: 17 Q&As - Specific assignments, homework, labs, projects
- **Support**: 6 Q&As - Student resources, tutoring, accommodations

## 🚀 Quick Start

### Step 1: Generate Your Q&A Database

1. **Set up Google Service Account** (follow `GOOGLE_DOCS_SETUP.md`)
2. **Run the generation script**:
```bash
node generate-qa-database.js
```

This will create `qa-database.json` with your syllabus-specific Q&A pairs.

### Step 2: Replace AI API Calls

Replace your existing `/ask` endpoint with a local search function:

```javascript
const fs = require('fs');

// Load the Q&A database
const qaDatabase = JSON.parse(fs.readFileSync('qa-database.json', 'utf8'));

// Simple keyword matching function
function findAnswer(userQuestion) {
  const query = userQuestion.toLowerCase();
  const words = query.split(/\s+/);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const qa of qaDatabase.qaPairs) {
    let score = 0;
    
    // Check main question and alternates
    const allQuestions = [qa.question, ...qa.alternateQuestions];
    for (const question of allQuestions) {
      if (question.toLowerCase().includes(query)) {
        score += 10; // Exact phrase match
      }
    }
    
    // Check keywords
    for (const keyword of qa.keywords) {
      for (const word of words) {
        if (keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }
  
  return bestMatch;
}

// Updated API endpoint
app.post('/ask', (req, res) => {
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Please provide a question.' });
  }
  
  const match = findAnswer(question);
  
  if (match && match.score > 0) {
    res.json({ 
      answer: match.answer,
      confidence: match.score > 5 ? 'high' : 'medium',
      category: match.category
    });
  } else {
    res.json({ 
      answer: "I don't have information about that in the syllabus. Please email the instructor or check the complete syllabus for more details.",
      confidence: 'low',
      category: 'unknown'
    });
  }
});
```

## 🔧 Advanced Integration

### Enhanced Keyword Matching

For better accuracy, implement fuzzy matching:

```javascript
// Install: npm install fuse.js
const Fuse = require('fuse.js');

const fuseOptions = {
  keys: ['question', 'alternateQuestions', 'keywords'],
  threshold: 0.4, // Adjust sensitivity
  includeScore: true
};

const fuse = new Fuse(qaDatabase.qaPairs, fuseOptions);

function findAnswerAdvanced(userQuestion) {
  const results = fuse.search(userQuestion);
  
  if (results.length > 0 && results[0].score < 0.6) {
    return {
      answer: results[0].item.answer,
      confidence: results[0].score < 0.3 ? 'high' : 'medium',
      category: results[0].item.category,
      matchedQuestion: results[0].item.question
    };
  }
  
  return null;
}
```

### Category-Based Routing

Route questions to appropriate handlers based on category:

```javascript
function handleQuestionByCategory(question) {
  const match = findAnswer(question);
  
  if (!match) return getDefaultResponse();
  
  switch (match.category) {
    case 'contact':
      return formatContactResponse(match);
    case 'deadline':
      return formatDeadlineResponse(match);
    case 'grade':
      return formatGradeResponse(match);
    default:
      return { answer: match.answer, category: match.category };
  }
}

function formatContactResponse(match) {
  return {
    answer: match.answer,
    category: match.category,
    additionalInfo: "For urgent matters, remember to check office hours or call during business hours."
  };
}
```

## 📋 Database Structure

Each Q&A pair contains:

```json
{
  "id": 1,
  "category": "contact|grade|deadline|policy|logistics|assignment|support",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "question": "Primary question format",
  "alternateQuestions": ["Alternate way 1", "Alternate way 2"],
  "answer": "Complete answer based on syllabus content"
}
```

## 🎨 Frontend Integration

Update your frontend to handle the new response format:

```javascript
async function askQuestion(question) {
  try {
    const response = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    
    const data = await response.json();
    
    // Display answer with confidence indicator
    displayAnswer(data.answer, data.confidence, data.category);
    
  } catch (error) {
    console.error('Error asking question:', error);
    displayError('Sorry, there was an error processing your question.');
  }
}

function displayAnswer(answer, confidence, category) {
  const answerDiv = document.getElementById('answer');
  
  // Add confidence indicator
  const confidenceClass = confidence === 'high' ? 'high-confidence' : 'medium-confidence';
  const categoryBadge = `<span class="category-badge ${category}">${category}</span>`;
  
  answerDiv.innerHTML = `
    <div class="answer-container ${confidenceClass}">
      ${categoryBadge}
      <p>${answer}</p>
    </div>
  `;
}
```

## ⚡ Performance Benefits

### Before (with AI API):
- **Response Time**: 2-5 seconds
- **Cost**: $0.001-0.01 per request
- **Rate Limits**: API-dependent
- **Reliability**: Dependent on external service

### After (with Q&A Database):
- **Response Time**: <100ms
- **Cost**: $0 per request
- **Rate Limits**: None
- **Reliability**: 100% uptime

## 🔄 Updating the Database

To update with new syllabus content:

1. **Update syllabus in Google Doc**
2. **Regenerate database**:
```bash
node generate-qa-database.js
```
3. **Restart your application** to load new data

## 📈 Analytics Integration

Track which questions are being asked:

```javascript
const analytics = {};

function logQuestion(question, category, confidence) {
  const date = new Date().toISOString().split('T')[0];
  
  if (!analytics[date]) analytics[date] = {};
  if (!analytics[date][category]) analytics[date][category] = 0;
  
  analytics[date][category]++;
  
  // Log low-confidence questions for improvement
  if (confidence === 'low') {
    console.log(`Low confidence question: ${question}`);
  }
}

// Add endpoint to view analytics
app.get('/analytics', (req, res) => {
  res.json(analytics);
});
```

## 🛠️ Troubleshooting

### Low Match Accuracy?
1. **Add more keywords** to Q&A pairs
2. **Add more alternate questions**
3. **Implement fuzzy matching** with Fuse.js
4. **Train with real student questions**

### Missing Information?
1. **Check the syllabus** for complete information
2. **Add new Q&A pairs** manually
3. **Regenerate database** with updated syllabus

### Performance Issues?
1. **Index the database** for faster searches
2. **Cache frequent questions**
3. **Implement search result caching**

## 🎯 Next Steps

1. **Deploy** the updated application
2. **Monitor** question patterns and accuracy
3. **Iterate** on keyword matching
4. **Expand** Q&A database based on real questions
5. **Add** feedback system for continuous improvement

## 📞 Support

For questions about this integration:
- Check the existing Q&A pairs for similar questions
- Review the generated `comprehensive-qa-database.json`
- Refer to the setup guides in this repository