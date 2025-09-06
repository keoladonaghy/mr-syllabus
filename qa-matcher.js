/**
 * Question Matching System for Mr. Syllabus
 * Finds the best Q&A match from the pre-generated database
 */

class QAMatcher {
  constructor(qaDatabase) {
    this.database = qaDatabase;
    this.qaPairs = qaDatabase.qaPairs;
    this.courseInfo = qaDatabase.courseInfo;
  }

  /**
   * Find the best matching Q&A pair for a user question
   * @param {string} userQuestion - The student's question
   * @returns {Object} - Best matching Q&A pair or default response
   */
  findBestMatch(userQuestion) {
    const normalizedQuestion = this.normalizeText(userQuestion);
    const questionWords = this.extractKeywords(normalizedQuestion);
    
    let bestMatch = null;
    let highestScore = 0;
    
    // Score each Q&A pair
    for (const qaPair of this.qaPairs) {
      const score = this.calculateMatchScore(questionWords, qaPair, normalizedQuestion);
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = qaPair;
      }
    }
    
    // Return best match if score is high enough, otherwise fallback
    if (bestMatch && highestScore >= 0.25) { // 25% confidence threshold
      return {
        answer: bestMatch.answer,
        confidence: highestScore,
        category: bestMatch.category,
        matchedQuestion: bestMatch.question
      };
    }
    
    return this.getFallbackResponse(userQuestion);
  }

  /**
   * Calculate match score between user question and Q&A pair
   * Enhanced for generic reusability across all courses
   * @param {Array} questionWords - Normalized words from user question
   * @param {Object} qaPair - Q&A pair to evaluate
   * @param {string} normalizedQuestion - Full normalized question
   * @returns {number} - Match score (0-1)
   */
  calculateMatchScore(questionWords, qaPair, normalizedQuestion) {
    let score = 0;
    let totalWords = questionWords.length;
    
    if (totalWords === 0) return 0;
    
    // 1. Intent-based matching (high priority)
    score += this.calculateIntentScore(normalizedQuestion, qaPair) * 0.4;
    
    // 2. Keyword matching (primary scoring)
    score += this.calculateKeywordScore(normalizedQuestion, qaPair.keywords) * 0.3;
    
    // 3. Semantic similarity (word overlap)
    score += this.calculateSemanticScore(questionWords, qaPair) * 0.2;
    
    // 4. Category bonus (if question implies specific category)
    score += this.calculateCategoryBonus(normalizedQuestion, qaPair.category) * 0.1;
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Calculate intent-based score using common question patterns
   * @param {string} question - Normalized question
   * @param {Object} qaPair - Q&A pair to evaluate
   * @returns {number} - Intent score (0-1)
   */
  calculateIntentScore(question, qaPair) {
    const intentPatterns = {
      contact: [
        /who is (the )?(instructor|teacher|professor)/,
        /contact (info|information|details)/,
        /email|phone|office/,
        /(instructor|teacher|professor) (email|phone|contact)/
      ],
      grading: [
        /how.*(grades?|grading).*(calculated|determined|done|work)/,
        /grading.*(scale|system|breakdown|policy)/,
        /what.*(grading|grade).*(policy|breakdown|scale|system)/,
        /what (percent|percentage).*(grade|grading)/,
        /(grade|grading).*(distribution|policy|breakdown)/,
        /grades?.*(calculated|determined|weighted)/,
        /what.*grading.*policy/,
        /grading.*policy/,
        /what is.*grading.*policy/,
        /what.*the.*grading.*policy/,
        /grading.*breakdown/,
        /grade.*breakdown/,
        /how.*graded/,
        /what.*grading/
      ],
      deadline: [
        /when (are|is).*(due|deadline)/,
        /(due|deadline) (date|dates)/,
        /assignment.*(due|deadline)/,
        /when.*(submit|turn in)/
      ],
      policy: [
        /late (work|assignment|submission) policy/,
        /(can i|is it possible).*(late|after)/,
        /what happens if.*(late|miss)/,
        /(makeup|make up).*(work|assignment|exam)/
      ],
      logistics: [
        /(need|require).*(textbook|book|materials)/,
        /(where|how).*(find|access|get).*(materials|content)/,
        /what.*(technology|equipment|software)/,
        /(online|in person|hybrid|format)/
      ],
      assignment: [
        /research (paper|project)/,
        /(midterm|final) (exam|test)/,
        /assignment.*(format|requirements|length)/,
        /(quiz|test|exam).*(when|how many)/
      ]
    };

    const categoryPatterns = intentPatterns[qaPair.category] || [];
    for (const pattern of categoryPatterns) {
      if (pattern.test(question)) {
        return 1.0; // Perfect intent match
      }
    }

    return 0;
  }

  /**
   * Calculate keyword matching score
   * @param {string} question - Normalized question
   * @param {Array} keywords - Keywords from Q&A pair
   * @returns {number} - Keyword score (0-1)
   */
  calculateKeywordScore(question, keywords) {
    let matches = 0;
    for (const keyword of keywords) {
      const normalizedKeyword = this.normalizeText(keyword);
      if (question.includes(normalizedKeyword)) {
        matches++;
      }
    }
    return keywords.length > 0 ? matches / keywords.length : 0;
  }

  /**
   * Calculate semantic similarity score
   * @param {Array} questionWords - Words from user question
   * @param {Object} qaPair - Q&A pair to evaluate
   * @returns {number} - Semantic score (0-1)
   */
  calculateSemanticScore(questionWords, qaPair) {
    let wordMatches = 0;
    const totalWords = questionWords.length;

    if (totalWords === 0) return 0;

    for (const word of questionWords) {
      // Check main question
      if (this.normalizeText(qaPair.question).includes(word)) {
        wordMatches++;
      }
      // Check alternate questions
      else {
        for (const altQuestion of qaPair.alternateQuestions || []) {
          if (this.normalizeText(altQuestion).includes(word)) {
            wordMatches += 0.5; // Partial credit for alternate questions
            break;
          }
        }
      }
    }

    return wordMatches / totalWords;
  }

  /**
   * Calculate category bonus for implied categories
   * @param {string} question - Normalized question
   * @param {string} category - Q&A pair category
   * @returns {number} - Category bonus (0-1)
   */
  calculateCategoryBonus(question, category) {
    const categoryIndicators = {
      contact: ['email', 'phone', 'office', 'instructor', 'teacher', 'professor', 'contact'],
      grade: ['grade', 'grading', 'graded', 'percent', 'percentage', 'points', 'score', 'weighted', 'breakdown', 'calculated', 'policy'],
      deadline: ['due', 'deadline', 'when', 'submit', 'turn in'],
      policy: ['policy', 'rule', 'allowed', 'permitted', 'can i', 'may i', 'late'],
      logistics: ['need', 'require', 'materials', 'textbook', 'technology', 'equipment'],
      assignment: ['assignment', 'project', 'paper', 'exam', 'quiz', 'test', 'midterm', 'final']
    };

    const indicators = categoryIndicators[category] || [];
    for (const indicator of indicators) {
      if (question.includes(indicator)) {
        return 1.0;
      }
    }
    return 0;
  }

  /**
   * Normalize text for matching
   * @param {string} text - Text to normalize
   * @returns {string} - Normalized text
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
  }

  /**
   * Extract keywords from question, removing common stop words
   * @param {string} text - Normalized text
   * @returns {Array} - Array of significant words
   */
  extractKeywords(text) {
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with', 'what', 'when', 'where', 'who', 'why',
      'how', 'do', 'does', 'did', 'can', 'could', 'should', 'would',
      'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your'
    ]);
    
    return text
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Get fallback response when no good match is found
   * @param {string} userQuestion - Original user question
   * @returns {Object} - Fallback response
   */
  getFallbackResponse(userQuestion) {
    // Try to categorize the question for a more helpful fallback
    const questionLower = userQuestion.toLowerCase();
    
    if (questionLower.includes('contact') || questionLower.includes('email') || questionLower.includes('phone')) {
      return {
        answer: "For specific questions not covered in the syllabus, please contact Dr. Keola Donaghy at donaghy@hawaii.edu or 808-984-3570. Office hours are by appointment.",
        confidence: 0.2,
        category: "fallback",
        matchedQuestion: "contact fallback"
      };
    }
    
    if (questionLower.includes('grade') || questionLower.includes('points') || questionLower.includes('percent')) {
      return {
        answer: "For specific grading questions, please check the detailed grading breakdown in the syllabus or contact Dr. Donaghy at donaghy@hawaii.edu. Remember: grades are not discussed via email.",
        confidence: 0.2,
        category: "fallback", 
        matchedQuestion: "grading fallback"
      };
    }
    
    return {
      answer: "I couldn't find specific information about that in the syllabus. Please check the complete syllabus in Lamakū or contact Dr. Keola Donaghy at donaghy@hawaii.edu for clarification. You can also visit him during office hours (by appointment).",
      confidence: 0.1,
      category: "fallback",
      matchedQuestion: "general fallback"
    };
  }

  /**
   * Get course information for display
   * @returns {Object} - Course information
   */
  getCourseInfo() {
    return this.courseInfo;
  }
}

module.exports = QAMatcher;