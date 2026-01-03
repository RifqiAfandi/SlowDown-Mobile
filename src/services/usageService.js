/**
 * Usage Service
 * Handles app usage tracking and logging with PostgreSQL backend via API
 */

import { apiClient } from '../config/api';
import { Logger } from '../utils/logger';
import { SOCIAL_MEDIA_APPS } from '../constants';
import { getCurrentWIBDate, getDateKey, getWeekDateKeys } from '../utils/dateUtils';
import { isValidUserId } from '../utils/validation';

const logger = Logger.create('UsageService');

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
    
    await apiClient.post('/usage/log', {
      userId,
      appId,
      dateKey,
      durationMinutes,
    });
    
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
    
    const response = await apiClient.get(`/usage/${userId}/daily`, {
      params: { dateKey: targetDateKey },
    });
    
    return response.data;
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
    
    const response = await apiClient.get(`/usage/${userId}/weekly`);
    
    return response.data;
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
    const response = await apiClient.get(`/usage/${userId}/stats`);
    
    return response.data;
  } catch (error) {
    logger.error('Failed to get usage stats', error);
    throw error;
  }
};

/**
 * Subscribe to today's usage for a user (polling-based for API)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function(usageData)
 * @param {number} interval - Polling interval in ms (default: 30000)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToTodayUsage = (userId, callback, interval = 30000) => {
  let isActive = true;
  
  const fetchUsage = async () => {
    if (!isActive) return;
    
    try {
      const dateKey = getDateKey(getCurrentWIBDate());
      const usage = await getDailyUsage(userId, dateKey);
      
      if (isActive) {
        callback(usage);
      }
    } catch (error) {
      logger.error('Today usage subscription error', error);
    }
  };
  
  // Initial fetch
  fetchUsage();
  
  // Set up polling
  const intervalId = setInterval(fetchUsage, interval);
  
  // Return unsubscribe function
  return () => {
    isActive = false;
    clearInterval(intervalId);
  };
};

export const usageService = {
  logUsage,
  getDailyUsage,
  getWeeklyUsage,
  getUsageStats,
  subscribeToTodayUsage,
};

export default usageService;
