/**
 * Environment Configuration
 * Configuration values loaded from .env file
 * SECURITY: Never hardcode sensitive data - always use environment variables
 */

import Constants from 'expo-constants';

// Get environment variables from expo-constants (loaded from .env by expo)
const getEnvVar = (key, defaultValue = '') => {
  // Try to get from process.env (loaded by babel-plugin-dotenv or expo)
  const value = process.env[key] || 
                Constants.expoConfig?.extra?.[key] || 
                defaultValue;
  return value;
};

// API Configuration - loaded from environment
export const API_CONFIG = {
  baseUrl: getEnvVar('API_BASE_URL', 'http://localhost:3000/api'),
};

// Admin Configuration - loaded from environment
export const ADMIN_EMAIL = getEnvVar('ADMIN_EMAIL', '');

// Google OAuth Configuration - loaded from environment
export const GOOGLE_WEB_CLIENT_ID = getEnvVar('GOOGLE_WEB_CLIENT_ID', '');

// App Configuration - loaded from environment
export const APP_CONFIG = {
  name: getEnvVar('APP_NAME', 'SlowDown'),
  defaultDailyLimit: parseInt(getEnvVar('DEFAULT_DAILY_LIMIT', '30'), 10),
  timezoneOffset: parseInt(getEnvVar('TIMEZONE_OFFSET', '7'), 10),
};

// Validate required environment variables
const validateEnv = () => {
  const required = ['GOOGLE_WEB_CLIENT_ID', 'API_BASE_URL'];
  const missing = required.filter(key => !getEnvVar(key));
  
  if (missing.length > 0 && __DEV__) {
    console.warn(`[ENV] Missing environment variables: ${missing.join(', ')}`);
    console.warn('[ENV] Make sure .env file is configured correctly');
  }
};

// Run validation in development
if (__DEV__) {
  validateEnv();
}

export default {
  API_CONFIG,
  ADMIN_EMAIL,
  GOOGLE_WEB_CLIENT_ID,
  APP_CONFIG,
};
