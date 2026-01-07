/**
 * Environment Configuration
 * Configuration values loaded from .env file via react-native-dotenv
 * SECURITY: Sensitive data is stored in .env (not committed to git)
 */

import {
  API_BASE_URL,
  ADMIN_EMAIL as ENV_ADMIN_EMAIL,
  GOOGLE_WEB_CLIENT_ID as ENV_GOOGLE_WEB_CLIENT_ID,
  APP_NAME,
  DEFAULT_DAILY_LIMIT,
  TIMEZONE_OFFSET,
} from '@env';

// API Configuration
export const API_CONFIG = {
  baseUrl: API_BASE_URL || 'http://localhost:3000/api',
};

// Admin Configuration
export const ADMIN_EMAIL = ENV_ADMIN_EMAIL || '';

// Google OAuth Configuration  
export const GOOGLE_WEB_CLIENT_ID = ENV_GOOGLE_WEB_CLIENT_ID || '';

// App Configuration
export const APP_CONFIG = {
  name: APP_NAME || 'SlowDown',
  defaultDailyLimit: parseInt(DEFAULT_DAILY_LIMIT || '30', 10),
  timezoneOffset: parseInt(TIMEZONE_OFFSET || '7', 10),
};

// Validate required environment variables in development
if (__DEV__) {
  const missing = [];
  if (!GOOGLE_WEB_CLIENT_ID) missing.push('GOOGLE_WEB_CLIENT_ID');
  if (!API_BASE_URL) missing.push('API_BASE_URL');
  
  if (missing.length > 0) {
    console.warn(`[ENV] Missing environment variables: ${missing.join(', ')}`);
    console.warn('[ENV] Make sure .env file is configured correctly');
  }
}

export default {
  API_CONFIG,
  ADMIN_EMAIL,
  GOOGLE_WEB_CLIENT_ID,
  APP_CONFIG,
};
