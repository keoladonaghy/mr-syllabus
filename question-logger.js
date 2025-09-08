const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class QuestionLogger {
  constructor() {
    this.logFile = path.join(process.cwd(), 'question-logs.json');
    this.ensureLogFile();
  }

  ensureLogFile() {
    try {
      if (!fs.existsSync(this.logFile)) {
        fs.writeFileSync(this.logFile, JSON.stringify({ logs: [] }, null, 2));
      }
    } catch (error) {
      console.error('Error creating log file:', error);
    }
  }

  hashQuestion(question) {
    // Create anonymized hash for privacy while allowing pattern analysis
    return crypto.createHash('sha256').update(question.toLowerCase().trim()).digest('hex').substring(0, 16);
  }

  async logQuestion(data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      questionHash: this.hashQuestion(data.question),
      questionLength: data.question.length,
      
      // Database matching info
      dbConfidence: data.dbConfidence,
      dbCategory: data.dbCategory,
      dbMatchId: data.dbMatchId,
      
      // Response path taken
      responseSource: data.responseSource, // 'database', 'google_doc_claude', 'google_doc_gemini', 'database_fallback'
      
      // Performance metrics
      responseTimeMs: data.responseTimeMs,
      tokensUsed: data.tokensUsed || 0,
      
      // AI fallback info
      claudeAttempted: data.claudeAttempted || false,
      claudeSuccess: data.claudeSuccess || false,
      geminiAttempted: data.geminiAttempted || false, 
      geminiSuccess: data.geminiSuccess || false,
      
      // Cost estimation
      estimatedCost: data.estimatedCost || 0,
      
      // Categorization for analysis
      wasFullyAnswered: data.wasFullyAnswered,
      triggeredFallback: data.triggeredFallback,
      
      // Optional: question type analysis
      questionType: this.categorizeQuestion(data.question),
      
      // Session info (optional)
      sessionId: data.sessionId || null,
      userAgent: data.userAgent || null
    };

    try {
      const logs = this.loadLogs();
      logs.logs.push(logEntry);
      
      // Keep only last 1000 entries to prevent file bloat
      if (logs.logs.length > 1000) {
        logs.logs = logs.logs.slice(-1000);
      }
      
      fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
      console.log('📊 Question logged:', {
        hash: logEntry.questionHash,
        source: logEntry.responseSource,
        confidence: logEntry.dbConfidence,
        time: logEntry.responseTimeMs + 'ms'
      });
    } catch (error) {
      console.error('Error logging question:', error);
    }
  }

  loadLogs() {
    try {
      return JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
    } catch (error) {
      return { logs: [] };
    }
  }

  categorizeQuestion(question) {
    const q = question.toLowerCase();
    
    if (q.includes('grade') || q.includes('grading')) return 'grading';
    if (q.includes('due') || q.includes('deadline')) return 'deadline';
    if (q.includes('instructor') || q.includes('teacher') || q.includes('professor')) return 'instructor';
    if (q.includes('assignment') || q.includes('project')) return 'assignment';
    if (q.includes('policy') || q.includes('rule')) return 'policy';
    if (q.includes('textbook') || q.includes('materials')) return 'logistics';
    if (q.includes('email') || q.includes('contact') || q.includes('phone')) return 'contact';
    
    return 'other';
  }

  // Analytics methods
  getStats() {
    const logs = this.loadLogs().logs;
    if (logs.length === 0) return null;

    const stats = {
      totalQuestions: logs.length,
      sourceBreakdown: {},
      averageResponseTime: 0,
      totalTokensUsed: 0,
      totalEstimatedCost: 0,
      fallbackRate: 0,
      averageConfidence: 0,
      questionTypes: {},
      timeRange: {
        start: logs[0]?.timestamp,
        end: logs[logs.length - 1]?.timestamp
      }
    };

    let totalResponseTime = 0;
    let totalConfidence = 0;
    let fallbackCount = 0;

    logs.forEach(log => {
      // Source breakdown
      stats.sourceBreakdown[log.responseSource] = (stats.sourceBreakdown[log.responseSource] || 0) + 1;
      
      // Averages
      totalResponseTime += log.responseTimeMs || 0;
      totalConfidence += log.dbConfidence || 0;
      stats.totalTokensUsed += log.tokensUsed || 0;
      stats.totalEstimatedCost += log.estimatedCost || 0;
      
      // Fallback tracking
      if (log.triggeredFallback) fallbackCount++;
      
      // Question types
      stats.questionTypes[log.questionType] = (stats.questionTypes[log.questionType] || 0) + 1;
    });

    stats.averageResponseTime = Math.round(totalResponseTime / logs.length);
    stats.averageConfidence = (totalConfidence / logs.length).toFixed(2);
    stats.fallbackRate = ((fallbackCount / logs.length) * 100).toFixed(1) + '%';

    return stats;
  }

  // Generate insights for system optimization
  getInsights() {
    const stats = this.getStats();
    if (!stats) return 'No data available yet.';

    const insights = [];
    
    // Database effectiveness
    const dbRate = ((stats.sourceBreakdown.database || 0) / stats.totalQuestions * 100).toFixed(1);
    insights.push(`Database handles ${dbRate}% of questions (target: >80%)`);
    
    // AI usage
    const aiRate = ((stats.sourceBreakdown.google_doc_claude || 0) + (stats.sourceBreakdown.google_doc_gemini || 0)) / stats.totalQuestions * 100;
    insights.push(`AI consultation rate: ${aiRate.toFixed(1)}% (affects cost)`);
    
    // Performance
    insights.push(`Average response time: ${stats.averageResponseTime}ms`);
    
    // Cost estimation
    if (stats.totalEstimatedCost > 0) {
      insights.push(`Estimated total cost: $${stats.totalEstimatedCost.toFixed(4)}`);
    }
    
    return insights.join('\n');
  }
}

module.exports = QuestionLogger;