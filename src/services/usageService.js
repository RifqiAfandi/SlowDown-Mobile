/**
 * Usage Service
 * Handles app usage tracking and logging
 */

import firestore from '@react-native-firebase/firestore';
import { Logger } from '../utils/logger';
import { COLLECTIONS, SOCIAL_MEDIA_APPS } from '../constants';
import { getCurrentWIBDate, getDateKey, getWeekDateKeys } from '../utils/dateUtils';
import { isValidUserId } from '../utils/validation';

const logger = Logger.create('UsageService');

/**
 * Get usage logs collection reference
 * @returns {CollectionReference} Usage logs collection reference
 */
const getUsageLogsCollection = () => {
  return firestore().collection(COLLECTIONS.USAGE_LOGS);
};

/**
 * Log app usage
 * @param {string} userId - User ID
 * @param {string} appId - App ID (e.g., 'instagram', 'twitter')
 * @param {number} durationMinutes - Duration in minutes
 * @returns {Promise<void>}
 */
export const logUsage = async (userId, appId, durationMinutes) => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const dateKey = getDateKey(getCurrentWIBDate());
    const docId = `${userId}_${dateKey}_${appId}`;
    const docRef = getUsageLogsCollection().doc(docId);
    
    const doc = await docRef.get();
    
    if (doc.exists) {
      // Update existing log
      await docRef.update({
        durationMinutes: firestore.FieldValue.increment(durationMinutes),
        lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Create new log
      await docRef.set({
        userId,
        appId,
        dateKey,
        durationMinutes,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
      });
    }
    
    logger.debug('Usage logged', { userId, appId, durationMinutes });
  } catch (error) {
    logger.error('Failed to log usage', error);
    throw error;
  }
};

/**
 * Get daily usage for a user
 * @param {string} userId - User ID
 * @param {string} dateKey - Date key (YYYY-MM-DD format)
 * @returns {Promise<Object>} Usage data by app
 */
export const getDailyUsage = async (userId, dateKey = null) => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const targetDateKey = dateKey || getDateKey(getCurrentWIBDate());
    
    const snapshot = await getUsageLogsCollection()
      .where('userId', '==', userId)
      .where('dateKey', '==', targetDateKey)
      .get();
    
    const usage = {};
    let totalMinutes = 0;
    
    // Initialize all apps with 0
    SOCIAL_MEDIA_APPS.forEach(app => {
      usage[app.id] = 0;
    });
    
    // Fill in actual usage
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      usage[data.appId] = data.durationMinutes || 0;
      totalMinutes += data.durationMinutes || 0;
    });
    
    return {
      dateKey: targetDateKey,
      apps: usage,
      totalMinutes,
    };
  } catch (error) {
    logger.error('Failed to get daily usage', error);
    throw error;
  }
};

/**
 * Get weekly usage for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of daily usage data for the last 7 days
 */
export const getWeeklyUsage = async (userId) => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const dateKeys = getWeekDateKeys();
    
    const snapshot = await getUsageLogsCollection()
      .where('userId', '==', userId)
      .where('dateKey', 'in', dateKeys)
      .get();
    
    // Create a map of usage by date and app
    const usageMap = {};
    dateKeys.forEach(key => {
      usageMap[key] = {
        dateKey: key,
        apps: {},
        totalMinutes: 0,
      };
      SOCIAL_MEDIA_APPS.forEach(app => {
        usageMap[key].apps[app.id] = 0;
      });
    });
    
    // Fill in actual usage
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (usageMap[data.dateKey]) {
        usageMap[data.dateKey].apps[data.appId] = data.durationMinutes || 0;
        usageMap[data.dateKey].totalMinutes += data.durationMinutes || 0;
      }
    });
    
    // Convert to array in chronological order
    return dateKeys.map(key => usageMap[key]);
  } catch (error) {
    logger.error('Failed to get weekly usage', error);
    throw error;
  }
};

/**
 * Get usage statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Usage statistics
 */
export const getUsageStats = async (userId) => {
  try {
    const weeklyUsage = await getWeeklyUsage(userId);
    
    // Calculate averages and totals
    let weeklyTotal = 0;
    const appTotals = {};
    
    SOCIAL_MEDIA_APPS.forEach(app => {
      appTotals[app.id] = 0;
    });
    
    weeklyUsage.forEach(day => {
      weeklyTotal += day.totalMinutes;
      Object.entries(day.apps).forEach(([appId, minutes]) => {
        appTotals[appId] += minutes;
      });
    });
    
    const dailyAverage = weeklyTotal / 7;
    
    // Find most used app
    let mostUsedApp = null;
    let maxUsage = 0;
    Object.entries(appTotals).forEach(([appId, total]) => {
      if (total > maxUsage) {
        maxUsage = total;
        mostUsedApp = appId;
      }
    });
    
    return {
      weeklyTotal,
      dailyAverage,
      appTotals,
      mostUsedApp,
      mostUsedAppMinutes: maxUsage,
    };
  } catch (error) {
    logger.error('Failed to get usage stats', error);
    throw error;
  }
};

/**
 * Subscribe to today's usage for a user
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function(usageData)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToTodayUsage = (userId, callback) => {
  const dateKey = getDateKey(getCurrentWIBDate());
  
  return getUsageLogsCollection()
    .where('userId', '==', userId)
    .where('dateKey', '==', dateKey)
    .onSnapshot(
      (snapshot) => {
        const usage = {};
        let totalMinutes = 0;
        
        SOCIAL_MEDIA_APPS.forEach(app => {
          usage[app.id] = 0;
        });
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          usage[data.appId] = data.durationMinutes || 0;
          totalMinutes += data.durationMinutes || 0;
        });
        
        callback({
          dateKey,
          apps: usage,
          totalMinutes,
        });
      },
      (error) => {
        logger.error('Today usage subscription error', error);
      }
    );
};

export const usageService = {
  logUsage,
  getDailyUsage,
  getWeeklyUsage,
  getUsageStats,
  subscribeToTodayUsage,
};

export default usageService;
