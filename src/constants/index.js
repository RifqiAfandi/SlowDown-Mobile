/**
 * Application Constants
 * Contains all constant values used throughout the app
 */

import { ADMIN_EMAIL as ENV_ADMIN_EMAIL, APP_CONFIG } from '../config/env';

// Admin email - only this email gets admin role
export const ADMIN_EMAIL = ENV_ADMIN_EMAIL;

// Default daily time limit in minutes
export const DEFAULT_DAILY_LIMIT = APP_CONFIG.defaultDailyLimit;

// Social media apps to track and block (Android only)
// IMPORTANT: 'name' must EXACTLY match the name returned by UsageStatsModule.kt
export const SOCIAL_MEDIA_APPS = [
  {
    id: 'instagram',
    name: 'Instagram', // Matches native module
    packageName: 'com.instagram.android',
    icon: 'instagram',
    color: '#E1306C',
  },
  {
    id: 'twitter',
    name: 'Twitter', // Matches native module (not "Twitter/X")
    packageName: 'com.twitter.android',
    icon: 'twitter',
    color: '#000000',
  },
  {
    id: 'tiktok',
    name: 'TikTok', // Matches native module
    packageName: 'com.zhiliaoapp.musically',
    icon: 'music-box',
    color: '#000000',
  },
  {
    id: 'facebook',
    name: 'Facebook', // Matches native module
    packageName: 'com.facebook.katana',
    icon: 'facebook',
    color: '#1877F2',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp', // Matches native module
    packageName: 'com.whatsapp',
    icon: 'whatsapp',
    color: '#25D366',
  },
  {
    id: 'youtube',
    name: 'YouTube', // Matches native module
    packageName: 'com.google.android.youtube',
    icon: 'youtube',
    color: '#FF0000',
  },
  {
    id: 'telegram',
    name: 'Telegram', // Matches native module
    packageName: 'org.telegram.messenger',
    icon: 'send',
    color: '#0088CC',
  },
  {
    id: 'snapchat',
    name: 'Snapchat', // Matches native module
    packageName: 'com.snapchat.android',
    icon: 'snapchat',
    color: '#FFFC00',
  },
  {
    id: 'discord',
    name: 'Discord', // Matches native module
    packageName: 'com.discord',
    icon: 'discord',
    color: '#5865F2',
  },
  {
    id: 'reddit',
    name: 'Reddit', // Matches native module
    packageName: 'com.reddit.frontpage',
    icon: 'reddit',
    color: '#FF4500',
  },
  {
    id: 'messenger',
    name: 'Messenger', // Matches native module
    packageName: 'com.facebook.orca',
    icon: 'facebook-messenger',
    color: '#0084FF',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn', // Matches native module
    packageName: 'com.linkedin.android',
    icon: 'linkedin',
    color: '#0A66C2',
  },
  {
    id: 'pinterest',
    name: 'Pinterest', // Matches native module
    packageName: 'com.pinterest',
    icon: 'pinterest',
    color: '#E60023',
  },
];

// User roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Time request status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Color palette
export const COLORS = {
  primary: '#4A90D9',
  primaryDark: '#2E5C8A',
  primaryLight: '#7BB3E8',
  secondary: '#6C5CE7',
  success: '#00B894',
  warning: '#FDCB6E',
  danger: '#E74C3C',
  info: '#00CEC9',
  dark: '#2D3436',
  gray: '#636E72',
  lightGray: '#B2BEC3',
  ultraLight: '#DFE6E9',
  white: '#FFFFFF',
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.85)',
};

// Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

// Timezone - WIB (UTC+7)
export const TIMEZONE_OFFSET = APP_CONFIG.timezoneOffset;

// API Endpoints (for reference)
export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: '/auth/google',
    EMAIL_SEND: '/auth/email/send-verification',
    EMAIL_VERIFY: '/auth/email/verify',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: '/users',
  USAGE: '/usage',
  TIME_REQUESTS: '/time-requests',
};
