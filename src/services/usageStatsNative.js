/**
 * Usage Stats Native Module
 * Bridge to Android UsageStatsManager for tracking social media usage
 */

import { NativeModules, Platform } from 'react-native';
import { Logger } from '../utils/logger';

const logger = Logger.create('UsageStats');

const { UsageStatsModule } = NativeModules;

/**
 * Check if we're on Android (Usage Stats only works on Android)
 */
const isAndroid = Platform.OS === 'android';

/**
 * Check if usage stats permission is granted
 * @returns {Promise<boolean>}
 */
export const hasUsageStatsPermission = async () => {
  if (!isAndroid) return false;
  
  try {
    return await UsageStatsModule.hasUsageStatsPermission();
  } catch (error) {
    logger.error('Failed to check usage stats permission', error);
    return false;
  }
};

/**
 * Request usage stats permission (opens system settings)
 * @returns {Promise<boolean>}
 */
export const requestUsageStatsPermission = async () => {
  if (!isAndroid) return false;
  
  try {
    return await UsageStatsModule.requestUsageStatsPermission();
  } catch (error) {
    logger.error('Failed to request usage stats permission', error);
    return false;
  }
};

/**
 * Get today's social media usage
 * @returns {Promise<{appUsage: Object, totalMinutes: number}>}
 */
export const getSocialMediaUsageToday = async () => {
  if (!isAndroid) {
    return { appUsage: {}, totalMinutes: 0 };
  }
  
  try {
    const result = await UsageStatsModule.getSocialMediaUsageToday();
    logger.debug('Social media usage today', result);
    return result;
  } catch (error) {
    if (error.code === 'PERMISSION_DENIED') {
      logger.warn('Usage stats permission not granted');
    } else {
      logger.error('Failed to get social media usage', error);
    }
    return { appUsage: {}, totalMinutes: 0 };
  }
};

/**
 * Get social media usage for a specific time period
 * @param {number} startTimeMs - Start time in milliseconds
 * @param {number} endTimeMs - End time in milliseconds
 * @returns {Promise<{appUsage: Object, totalMinutes: number}>}
 */
export const getUsageForPeriod = async (startTimeMs, endTimeMs) => {
  if (!isAndroid) {
    return { appUsage: {}, totalMinutes: 0 };
  }
  
  try {
    const result = await UsageStatsModule.getUsageForPeriod(startTimeMs, endTimeMs);
    return result;
  } catch (error) {
    logger.error('Failed to get usage for period', error);
    return { appUsage: {}, totalMinutes: 0 };
  }
};

/**
 * Get list of installed social media apps
 * @returns {Promise<Array<{packageName: string, appName: string}>>}
 */
export const getInstalledSocialMediaApps = async () => {
  if (!isAndroid) return [];
  
  try {
    return await UsageStatsModule.getAllInstalledSocialMediaApps();
  } catch (error) {
    logger.error('Failed to get installed social media apps', error);
    return [];
  }
};

/**
 * Get usage for the past N days
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array<{date: string, appUsage: Object, totalMinutes: number}>>}
 */
export const getUsageHistory = async (days = 7) => {
  if (!isAndroid) return [];
  
  try {
    const history = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const startTime = date.getTime();
      const endTime = i === 0 ? Date.now() : startTime + 24 * 60 * 60 * 1000;
      
      const usage = await getUsageForPeriod(startTime, endTime);
      
      history.push({
        date: date.toISOString().split('T')[0],
        appUsage: usage.appUsage || {}, // Consistent naming
        totalMinutes: usage.totalMinutes || 0,
      });
    }
    
    logger.debug('Usage history fetched', { days, history });
    return history;
  } catch (error) {
    logger.error('Failed to get usage history', error);
    return [];
  }
};

export default {
  hasUsageStatsPermission,
  requestUsageStatsPermission,
  getSocialMediaUsageToday,
  getUsageForPeriod,
  getInstalledSocialMediaApps,
  getUsageHistory,
};
