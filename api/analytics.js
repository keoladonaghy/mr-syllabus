const QuestionLogger = require('../question-logger');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const logger = new QuestionLogger();
    const stats = logger.getStats();
    const insights = logger.getInsights();

    if (!stats) {
      return res.json({
        message: 'No analytics data available yet.',
        totalQuestions: 0,
        instructions: 'Ask some questions first to generate analytics data.'
      });
    }

    // Additional derived metrics
    const derivedMetrics = {
      databaseEfficiency: ((stats.sourceBreakdown.database || 0) / stats.totalQuestions * 100).toFixed(1) + '%',
      aiUsageRate: (((stats.sourceBreakdown.google_doc_claude || 0) + (stats.sourceBreakdown.google_doc_gemini || 0)) / stats.totalQuestions * 100).toFixed(1) + '%',
      fallbackRate: stats.fallbackRate,
      costPerQuestion: stats.totalQuestions > 0 ? (stats.totalEstimatedCost / stats.totalQuestions).toFixed(6) : 0,
      avgTokensPerAICall: stats.totalTokensUsed > 0 && stats.totalQuestions > 0 ? Math.round(stats.totalTokensUsed / stats.totalQuestions) : 0
    };

    // Performance insights
    const performanceInsights = [];
    if (parseFloat(derivedMetrics.databaseEfficiency) > 80) {
      performanceInsights.push('✅ Database efficiency is excellent (>80%)');
    } else if (parseFloat(derivedMetrics.databaseEfficiency) > 60) {
      performanceInsights.push('⚠️ Database efficiency is good but could be improved');
    } else {
      performanceInsights.push('❌ Database efficiency is low - consider adding more Q&A pairs');
    }

    if (stats.averageResponseTime < 100) {
      performanceInsights.push('✅ Response times are excellent (<100ms)');
    } else if (stats.averageResponseTime < 500) {
      performanceInsights.push('⚠️ Response times are acceptable but watch for increases');
    } else {
      performanceInsights.push('❌ Response times are slow - investigate AI fallback frequency');
    }

    // Cost insights
    const costInsights = [];
    if (stats.totalEstimatedCost < 0.01) {
      costInsights.push('✅ Costs are very low');
    } else if (stats.totalEstimatedCost < 0.10) {
      costInsights.push('⚠️ Costs are reasonable but monitor growth');
    } else {
      costInsights.push('❌ Costs are accumulating - consider database optimization');
    }

    res.json({
      summary: {
        totalQuestions: stats.totalQuestions,
        timeRange: stats.timeRange,
        systemHealth: '✅ Operational'
      },
      performance: {
        ...derivedMetrics,
        averageResponseTime: stats.averageResponseTime + 'ms',
        averageConfidence: stats.averageConfidence
      },
      usage: {
        sourceBreakdown: stats.sourceBreakdown,
        questionTypes: stats.questionTypes
      },
      costs: {
        totalEstimatedCost: '$' + stats.totalEstimatedCost.toFixed(4),
        totalTokensUsed: stats.totalTokensUsed,
        costPerQuestion: '$' + derivedMetrics.costPerQuestion
      },
      insights: {
        performance: performanceInsights,
        cost: costInsights,
        general: insights.split('\n')
      },
      recommendations: generateRecommendations(stats, derivedMetrics)
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to generate analytics',
      message: error.message
    });
  }
};

function generateRecommendations(stats, metrics) {
  const recommendations = [];

  // Database optimization
  if (parseFloat(metrics.databaseEfficiency) < 80) {
    recommendations.push({
      type: 'database',
      priority: 'high',
      title: 'Improve Database Coverage',
      description: 'Add more Q&A pairs for commonly asked questions that are triggering AI fallbacks',
      impact: 'Reduce costs and improve response times'
    });
  }

  // Cost optimization
  if (stats.totalEstimatedCost > 0.05) {
    recommendations.push({
      type: 'cost',
      priority: 'medium',
      title: 'Monitor API Usage',
      description: 'Consider raising confidence threshold or optimizing prompts to reduce AI API calls',
      impact: 'Reduce ongoing operational costs'
    });
  }

  // Performance optimization
  if (stats.averageResponseTime > 300) {
    recommendations.push({
      type: 'performance',
      priority: 'medium', 
      title: 'Optimize Response Times',
      description: 'High response times may indicate frequent AI fallbacks or slow API calls',
      impact: 'Better user experience'
    });
  }

  // Question type analysis
  const topQuestionType = Object.keys(stats.questionTypes).reduce((a, b) => 
    stats.questionTypes[a] > stats.questionTypes[b] ? a : b, 'other'
  );
  
  if (topQuestionType !== 'other') {
    recommendations.push({
      type: 'content',
      priority: 'low',
      title: `Focus on ${topQuestionType} Questions`,
      description: `Most questions are about ${topQuestionType}. Ensure this category has comprehensive coverage.`,
      impact: 'Better student experience'
    });
  }

  return recommendations;
}