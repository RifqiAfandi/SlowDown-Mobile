/**
 * User Service
 * Handles user CRUD operations in Firestore
 */

import firestore from '@react-native-firebase/firestore';
import { Logger } from '../utils/logger';
import { COLLECTIONS, DEFAULT_DAILY_LIMIT, ROLES } from '../constants';
import { sanitizeFirestoreData, isValidUserId, isValidDisplayName } from '../utils/validation';
import { getCurrentWIBDate, getDateKey, needsDailyReset } from '../utils/dateUtils';

const logger = Logger.create('UserService');

/**
 * Get Firestore users collection reference
 * @returns {CollectionReference} Users collection reference
 */
const getUsersCollection = () => {
  return firestore().collection(COLLECTIONS.USERS);
};

/**
 * Create or update user in Firestore
 * @param {Object} userData - User data to save
 * @returns {Promise<Object>} Created/updated user data
 */
export const createOrUpdateUser = async (userData) => {
  try {
    if (!isValidUserId(userData.uid)) {
      throw new Error('Invalid user ID');
    }
    
    const userRef = getUsersCollection().doc(userData.uid);
    const userDoc = await userRef.get();
    
    const now = getCurrentWIBDate();
    const dateKey = getDateKey(now);
    
    if (userDoc.exists) {
      // Update existing user
      const existingData = userDoc.data();
      
      // Check if daily reset is needed
      const shouldReset = needsDailyReset(existingData.lastResetDate?.toDate());
      
      const updateData = {
        lastLoginAt: firestore.FieldValue.serverTimestamp(),
        displayName: userData.displayName || existingData.displayName,
        photoURL: userData.photoURL || existingData.photoURL,
      };
      
      // Reset daily usage if needed
      if (shouldReset) {
        updateData.todayUsedMinutes = 0;
        updateData.lastResetDate = firestore.FieldValue.serverTimestamp();
        updateData.currentDateKey = dateKey;
        logger.info('Daily reset performed for user', { uid: userData.uid });
      }
      
      await userRef.update(sanitizeFirestoreData(updateData));
      
      const updatedDoc = await userRef.get();
      return { id: userData.uid, ...updatedDoc.data() };
    } else {
      // Create new user
      const newUserData = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName || 'User',
        photoURL: userData.photoURL || null,
        role: userData.role || ROLES.USER,
        dailyLimitMinutes: DEFAULT_DAILY_LIMIT,
        bonusMinutes: 0,
        todayUsedMinutes: 0,
        isBlocked: false,
        blockReason: null,
        currentDateKey: dateKey,
        lastResetDate: firestore.FieldValue.serverTimestamp(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firestore.FieldValue.serverTimestamp(),
        pendingTimeRequest: null,
      };
      
      await userRef.set(sanitizeFirestoreData(newUserData));
      
      logger.info('New user created', { uid: userData.uid, role: userData.role });
      return { id: userData.uid, ...newUserData };
    }
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
    
    const userDoc = await getUsersCollection().doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
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
    const snapshot = await getUsersCollection()
      .where('role', '==', ROLES.USER)
      .orderBy('displayName')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
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
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    // Firestore doesn't support full-text search, so we fetch all and filter
    const allUsers = await getAllUsers();
    
    return allUsers.filter(user => 
      user.displayName?.toLowerCase().includes(normalizedSearch) ||
      user.email?.toLowerCase().includes(normalizedSearch)
    );
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
    
    await getUsersCollection().doc(userId).update({
      displayName: displayName.trim(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
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
    
    const userRef = getUsersCollection().doc(userId);
    
    await firestore().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const newUsedMinutes = (userData.todayUsedMinutes || 0) + minutesUsed;
      
      transaction.update(userRef, {
        todayUsedMinutes: newUsedMinutes,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    });
    
    const updatedDoc = await userRef.get();
    return { id: userId, ...updatedDoc.data() };
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
    
    await getUsersCollection().doc(userId).update({
      bonusMinutes: firestore.FieldValue.increment(minutes),
      updatedAt: firestore.FieldValue.serverTimestamp(),
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
    
    const userRef = getUsersCollection().doc(userId);
    
    await firestore().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const newBonusMinutes = Math.max(0, (userData.bonusMinutes || 0) - minutes);
      
      transaction.update(userRef, {
        bonusMinutes: newBonusMinutes,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
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
    
    await getUsersCollection().doc(userId).update({
      isBlocked: true,
      blockReason: reason,
      blockedAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
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
    
    await getUsersCollection().doc(userId).update({
      isBlocked: false,
      blockReason: null,
      blockedAt: null,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    
    logger.info('User unblocked', { userId });
  } catch (error) {
    logger.error('Failed to unblock user', error);
    throw error;
  }
};

/**
 * Subscribe to user data changes
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function(userData)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUser = (userId, callback) => {
  return getUsersCollection().doc(userId).onSnapshot(
    (doc) => {
      if (doc.exists) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      logger.error('User subscription error', error);
    }
  );
};

/**
 * Subscribe to all users (for admin)
 * @param {Function} callback - Callback function(usersArray)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAllUsers = (callback) => {
  return getUsersCollection()
    .where('role', '==', ROLES.USER)
    .orderBy('displayName')
    .onSnapshot(
      (snapshot) => {
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(users);
      },
      (error) => {
        logger.error('Users subscription error', error);
      }
    );
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
