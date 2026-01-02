/**
 * Application Constants
 * Contains all constant values used throughout the app
 */

// Admin email - only this email gets admin role
export const ADMIN_EMAIL = 'rifqitriafandi.2002@gmail.com';

// Default daily time limit in minutes
export const DEFAULT_DAILY_LIMIT = 30;

// Social media apps to track and block
export const SOCIAL_MEDIA_APPS = [
  {
    id: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    bundleId: 'com.burbn.instagram',
    icon: 'instagram',
    color: '#E1306C',
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    packageName: 'com.twitter.android',
    bundleId: 'com.atebits.Tweetie2',
    icon: 'twitter',
    color: '#1DA1F2',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    packageName: 'com.reddit.frontpage',
    bundleId: 'com.reddit.Reddit',
    icon: 'reddit',
    color: '#FF4500',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    bundleId: 'com.google.ios.youtube',
    icon: 'youtube',
    color: '#FF0000',
  },
  {
    id: 'threads',
    name: 'Threads',
    packageName: 'com.instagram.barcelona',
    bundleId: 'com.burbn.barcelona',
    icon: 'at',
    color: '#000000',
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
export const TIMEZONE_OFFSET = 7;

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  USAGE_LOGS: 'usageLogs',
  TIME_REQUESTS: 'timeRequests',
  BLOCKED_APPS: 'blockedApps',
};
