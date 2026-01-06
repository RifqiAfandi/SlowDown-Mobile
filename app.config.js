/**
 * Expo App Configuration
 * This file allows dynamic configuration and reading environment variables
 * SECURITY: Sensitive values are loaded from .env file
 */

import 'dotenv/config';

export default {
  expo: {
    name: "SlowDown-App",
    slug: "SlowDown-App",
    version: "1.0.0",
    orientation: "portrait",
    platforms: ["android"],
    android: {
      package: "com.slowdownapp",
      adaptiveIcon: {
        backgroundColor: "#4A90D9"
      },
      permissions: [
        "PACKAGE_USAGE_STATS",
        "SYSTEM_ALERT_WINDOW"
      ],
      googleServicesFile: "./android/app/google-services.json"
    },
    extra: {
      // Environment variables passed to the app
      // These are read from .env file
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
      GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID || '',
      APP_NAME: process.env.APP_NAME || 'SlowDown',
      DEFAULT_DAILY_LIMIT: process.env.DEFAULT_DAILY_LIMIT || '30',
      TIMEZONE_OFFSET: process.env.TIMEZONE_OFFSET || '7',
      eas: {
        projectId: "your-project-id"
      }
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true
          }
        }
      ]
    ]
  }
};
