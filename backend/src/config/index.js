/**
 * Backend Configuration
 * SECURITY: All sensitive values must come from environment variables
 * No hardcoded secrets or credentials
 */
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['DB_PASSWORD', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`[CONFIG] ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('[CONFIG] Please check your .env file');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

module.exports = {
  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'slow_down',
    user: process.env.DB_USER || 'postgres',
    // SECURITY: No fallback for password - must be in .env
    password: process.env.DB_PASSWORD,
  },
  
  // Server
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT
  jwt: {
    // SECURITY: No fallback for secret - must be in .env
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Google OAuth
  // SECURITY: Must be configured in .env
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  
  // Admin
  // SECURITY: Must be configured in .env
  adminEmail: process.env.ADMIN_EMAIL,
};
