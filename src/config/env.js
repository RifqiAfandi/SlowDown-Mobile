/**
 * Environment Configuration
 * Loads environment variables from .env file
 */

import Config from 'react-native-config';

// Database Configuration (for backend reference)
export const DB_CONFIG = {
  name: Config.DB_NAME,
  user: Config.DB_USER,
  password: Config.DB_PASSWORD,
  host: Config.DB_HOST,
  port: parseInt(Config.DB_PORT, 10),
};

// API Configuration
export const API_CONFIG = {
  baseUrl: Config.API_BASE_URL,
};

// Admin Configuration
export const ADMIN_EMAIL = Config.ADMIN_EMAIL;
// Google OAuth Configuration
export const GOOGLE_WEB_CLIENT_ID = Config.GOOGLE_WEB_CLIENT_ID || '';

// App Configuration
export const APP_CONFIG = {
  name: Config.APP_NAME || 'SlowDown',
  defaultDailyLimit: parseInt(Config.DEFAULT_DAILY_LIMIT || '30', 10),
  timezoneOffset: parseInt(Config.TIMEZONE_OFFSET || '7', 10),
};

export default {
  DB_CONFIG,
  API_CONFIG,
  ADMIN_EMAIL,
  GOOGLE_WEB_CLIENT_ID,
  APP_CONFIG,
};
