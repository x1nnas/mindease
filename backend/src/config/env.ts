function getRequiredEnvVars() {
  return {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    // OPENAI_API_KEY is optional in development (allows mock responses for testing)
    // Required in production if AI_ENABLED=true
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };
}

function getOptionalEnvVars() {
  return {
    // Render sets PORT automatically - use it if available, otherwise default to 5050
    PORT: process.env.PORT || '5050',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    // AI API Limits (for cost control - $8/month budget)
    AI_MAX_TOKENS: process.env.AI_MAX_TOKENS || '500', // Max output tokens per response
    AI_MAX_HISTORY_MESSAGES: process.env.AI_MAX_HISTORY_MESSAGES || '50', // Max conversation history messages (increased for better context)
    AI_MAX_MESSAGE_LENGTH: process.env.AI_MAX_MESSAGE_LENGTH || '2000', // Max user message length (characters)
    AI_DAILY_LIMIT: process.env.AI_DAILY_LIMIT || '50', // Max requests per user/IP per day
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || '20', // Requests per minute (rate limit)
  };
}

export function validateEnv(): void {
  const requiredEnvVars = getRequiredEnvVars();
  const missing: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '') {
      // OPENAI_API_KEY is optional in development
      if (key === 'OPENAI_API_KEY' && process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  WARNING: OPENAI_API_KEY not set. AI chatbot will use mock responses.');
        console.warn('   To enable real AI: Set OPENAI_API_KEY and AI_ENABLED=true in .env');
        continue;
      }
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('❌ ERROR: Missing required environment variables:');
    missing.forEach((key) => {
      console.error(`   - ${key}`);
    });
    console.error('\n💡 Please check your .env file in the backend directory.');
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
  
  // Log AI status (case-insensitive check)
  const aiEnabled = process.env.AI_ENABLED?.toLowerCase() === 'true';
  const hasApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '';
  const aiEnabledRaw = process.env.AI_ENABLED;
  
  console.log('🤖 AI Chatbot Configuration:', {
    AI_ENABLED: aiEnabledRaw || '(not set)',
    aiEnabled: aiEnabled,
    hasApiKey: hasApiKey,
    apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
  });
  
  if (aiEnabled && hasApiKey) {
    console.log('🤖 AI Chatbot: ENABLED (using OpenAI API)');
  } else if (process.env.NODE_ENV !== 'production') {
    console.log('🤖 AI Chatbot: Using mock responses (set AI_ENABLED=true and OPENAI_API_KEY to enable real AI)');
  } else if (!aiEnabled) {
    console.log(`🤖 AI Chatbot: DISABLED (current value: '${aiEnabledRaw || 'not set'}', set AI_ENABLED=true to enable)`);
  } else {
    console.warn('⚠️  AI Chatbot: AI_ENABLED=true but OPENAI_API_KEY not set or empty');
  }
}

export function getEnv() {
  const requiredEnvVars = getRequiredEnvVars();
  const optionalEnvVars = getOptionalEnvVars();
  
  return {
    ...requiredEnvVars,
    ...optionalEnvVars,
    PORT: parseInt(optionalEnvVars.PORT, 10),
    AI_MAX_TOKENS: parseInt(optionalEnvVars.AI_MAX_TOKENS, 10),
    AI_MAX_HISTORY_MESSAGES: parseInt(optionalEnvVars.AI_MAX_HISTORY_MESSAGES, 10),
    AI_MAX_MESSAGE_LENGTH: parseInt(optionalEnvVars.AI_MAX_MESSAGE_LENGTH, 10),
    AI_DAILY_LIMIT: parseInt(optionalEnvVars.AI_DAILY_LIMIT, 10),
    RATE_LIMIT_MAX: parseInt(optionalEnvVars.RATE_LIMIT_MAX, 10),
  };
}
