/**
 * User Service
 * Handles user CRUD operations with PostgreSQL backend via API
 */

import { apiClient } from '../config/api';
import { Logger } from '../utils/logger';
import { DEFAULT_DAILY_LIMIT, ROLES } from '../constants';
import { isValidUserId, isValidDisplayName } from '../utils/validation';

const logger = Logger.create('UserService');

/**
 * Create or update user
 * @param {Object} userData - User data to save
 * @returns {Promise<Object>} Created/updated user data
 */
export const createOrUpdateUser = async (userData) => {
  try {
    if (!isValidUserId(userData.uid)) {
      throw new Error('Invalid user ID');
    }
    
    const response = await apiClient.post('/users', userData);
    
    logger.info('User created/updated', { uid: userData.uid });
    return response.data;
  } catch (error) {
    logger.error('Failed to create/update user', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User data or null
 */
export const getUserById = async (userId) => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    logger.error('Failed to get user', error);
    throw error;
  }
};

/**
 * Get all users (for admin)
 * @returns {Promise<Array>} Array of user objects
 */
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    logger.error('Failed to get all users', error);
    throw error;
  }
};

/**
 * Search users by name (for admin)
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching users
 */
export const searchUsers = async (searchTerm) => {
  try {
    const response = await apiClient.get('/users/search', {
      params: { q: searchTerm },
    });
    return response.data;
  } catch (error) {
    logger.error('Failed to search users', error);
    throw error;
  }
};

/**
 * Update user display name
 * @param {string} userId - User ID
 * @param {string} displayName - New display name
 * @returns {Promise<void>}
 */
export const updateUserDisplayName = async (userId, displayName) => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    if (!isValidDisplayName(displayName)) {
      throw new Error('Invalid display name');
    }
    
    await apiClient.patch(`/users/${userId}`, {
      displayName: displayName.trim(),
    });
    
    logger.info('User display name updated', { userId, displayName });
  } catch (error) {
    logger.error('Failed to update display name', error);
    throw error;
  }
};

/**
 * Update user's used time
 * @param {string} userId - User ID
 * @param {number} minutesUsed - Minutes to add to usage
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserUsage = async (userId, minutesUsed) => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const response = await apiClient.post(`/users/${userId}/usage`, {
      minutesUsed,
    });
    
    return response.data;
  } catch (error) {
    logger.error('Failed to update user usage', error);
    throw error;
  }
};

/**
 * Add bonus time to user
 * @param {string} userId - User ID
 * @param {number} minutes - Minutes to add
 * @returns {Promise<void>}
 */
export const addBonusTime = async (userId, minutes) => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    if (typeof minutes !== 'number' || minutes <= 0) {
      throw new Error('Invalid minutes value');
    }
    
    await apiClient.post(`/users/${userId}/bonus`, {
      minutes,
      action: 'add',
    });
    
    logger.info('Bonus time added', { userId, minutes });
  } catch (error) {
    logger.error('Failed to add bonus time', error);
    throw error;
  }
};

/**
 * Reduce bonus time from user
 * @param {string} userId - User ID
 * @param {number} minutes - Minutes to reduce
 * @returns {Promise<void>}
 */
export const reduceBonusTime = async (userId, minutes) => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    if (typeof minutes !== 'number' || minutes <= 0) {
      throw new Error('Invalid minutes value');
    }
    
    await apiClient.post(`/users/${userId}/bonus`, {
      minutes,
      action: 'reduce',
    });
    
    logger.info('Bonus time reduced', { userId, minutes });
  } catch (error) {
    logger.error('Failed to reduce bonus time', error);
    throw error;
  }
};

/**
 * Block user
 * @param {string} userId - User ID
 * @param {string} reason - Block reason (optional)
 * @returns {Promise<void>}
 */
export const blockUser = async (userId, reason = 'Blocked by admin') => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    
    await apiClient.post(`/users/${userId}/block`, {
      reason,
    });
    
    logger.info('User blocked', { userId, reason });
  } catch (error) {
    logger.error('Failed to block user', error);
    throw error;
  }
};

/**
 * Unblock user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const unblockUser = async (userId) => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    
    await apiClient.post(`/users/${userId}/unblock`);
    
    logger.info('User unblocked', { userId });
  } catch (error) {
    logger.error('Failed to unblock user', error);
    throw error;
  }
};

/**
 * Subscribe to user data changes (polling-based for API)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function(userData)
 * @param {number} interval - Polling interval in ms (default: 30000)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUser = (userId, callback, interval = 30000) => {
  let isActive = true;
  
  const fetchUser = async () => {
    if (!isActive) return;
    
    try {
      const userData = await getUserById(userId);
      if (isActive) {
        callback(userData);
      }
    } catch (error) {
      logger.error('User subscription fetch error', error);
    }
  };
  
  // Initial fetch
  fetchUser();
  
  // Set up polling
  const intervalId = setInterval(fetchUser, interval);
  
  // Return unsubscribe function
  return () => {
    isActive = false;
    clearInterval(intervalId);
  };
};

/**
 * Subscribe to all users (for admin, polling-based)
 * @param {Function} callback - Callback function(usersArray)
 * @param {number} interval - Polling interval in ms (default: 30000)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAllUsers = (callback, interval = 30000) => {
  let isActive = true;
  
  const fetchUsers = async () => {
    if (!isActive) return;
    
    try {
      const users = await getAllUsers();
      if (isActive) {
        callback(users);
      }
    } catch (error) {
      logger.error('Users subscription fetch error', error);
    }
  };
  
  // Initial fetch
  fetchUsers();
  
  // Set up polling
  const intervalId = setInterval(fetchUsers, interval);
  
  // Return unsubscribe function
  return () => {
    isActive = false;
    clearInterval(intervalId);
  };
};

export const userService = {
  createOrUpdateUser,
  getUserById,
  getAllUsers,
  searchUsers,
  updateUserDisplayName,
  updateUserUsage,
  addBonusTime,
  reduceBonusTime,
  blockUser,
  unblockUser,
  subscribeToUser,
  subscribeToAllUsers,
};

export default userService;
