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
    if (bestMatch && highestScore >= 0.3) { // 30% confidence threshold
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
   * @param {Array} questionWords - Normalized words from user question
   * @param {Object} qaPair - Q&A pair to evaluate
   * @param {string} normalizedQuestion - Full normalized question
   * @returns {number} - Match score (0-1)
   */
  calculateMatchScore(questionWords, qaPair, normalizedQuestion) {
    let score = 0;
    let totalWords = questionWords.length;
    
    if (totalWords === 0) return 0;
    
    // Keyword matching (primary scoring method)
    let keywordMatches = 0;
    for (const keyword of qaPair.keywords) {
      const normalizedKeyword = this.normalizeText(keyword);
      if (normalizedQuestion.includes(normalizedKeyword)) {
        keywordMatches++;
      }
    }
    
    // Keyword score (weighted heavily)
    const keywordScore = (keywordMatches / qaPair.keywords.length) * 0.7;
    score += keywordScore;
    
    // Word overlap scoring
    let wordMatches = 0;
    for (const word of questionWords) {
      // Check main question
      if (this.normalizeText(qaPair.question).includes(word)) {
        wordMatches++;
      }
      
      // Check alternate questions
      for (const altQuestion of qaPair.alternateQuestions || []) {
        if (this.normalizeText(altQuestion).includes(word)) {
          wordMatches += 0.5; // Lower weight for alternate questions
          break;
        }
      }
    }
    
    const wordScore = (wordMatches / totalWords) * 0.3;
    score += wordScore;
    
    return Math.min(score, 1.0); // Cap at 1.0
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