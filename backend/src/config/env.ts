function getRequiredEnvVars() {
  return {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };
}

function getOptionalEnvVars() {
  return {
    PORT: process.env.PORT || '5000',
  };
}

export function validateEnv(): void {
  const requiredEnvVars = getRequiredEnvVars();
  const missing: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '') {
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
}

export function getEnv() {
  const requiredEnvVars = getRequiredEnvVars();
  const optionalEnvVars = getOptionalEnvVars();
  
  return {
    ...requiredEnvVars,
    ...optionalEnvVars,
    PORT: parseInt(optionalEnvVars.PORT, 10),
  };
}
