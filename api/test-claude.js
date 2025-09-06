const Anthropic = require('@anthropic-ai/sdk');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Claude API Test Starting...');
    
    // Check environment variable
    const hasKey = !!process.env.CLAUDE_API_KEY;
    console.log(`Environment check - CLAUDE_API_KEY present: ${hasKey}`);
    
    if (!hasKey) {
      return res.json({
        status: 'failed',
        error: 'CLAUDE_API_KEY not found in environment variables',
        hasKey: false
      });
    }

    // Initialize Anthropic with optimized settings
    console.log('Initializing Anthropic client...');
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
      timeout: 45000, // 45 second timeout
      maxRetries: 2,  // Retry failed requests
    });

    // Test API call
    console.log('Making test API call...');
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: 'Reply with exactly "Claude API test successful" if you receive this.'
      }]
    });

    const result = response.content[0].text.trim();
    console.log(`✅ Claude response: "${result}"`);

    res.json({
      status: 'success',
      message: 'Claude API is working in Vercel',
      claudeResponse: result,
      hasKey: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Claude API test failed:', error.message);
    console.error('❌ Full error:', error);
    
    res.json({
      status: 'failed',
      error: error.message,
      errorType: error.constructor.name,
      hasKey: !!process.env.CLAUDE_API_KEY,
      timestamp: new Date().toISOString()
    });
  }
};