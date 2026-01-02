/**
 * Time Request Service
 * Handles requests for additional time from users to admin
 */

import firestore from '@react-native-firebase/firestore';
import { Logger } from '../utils/logger';
import { COLLECTIONS, REQUEST_STATUS } from '../constants';
import { isValidUserId, isPositiveNumber } from '../utils/validation';
import { getCurrentWIBDate, getDateKey } from '../utils/dateUtils';

const logger = Logger.create('TimeRequestService');

/**
 * Get time requests collection reference
 * @returns {CollectionReference} Time requests collection reference
 */
const getTimeRequestsCollection = () => {
  return firestore().collection(COLLECTIONS.TIME_REQUESTS);
};

/**
 * Create a new time request
 * @param {string} userId - User ID
 * @param {number} requestedMinutes - Requested additional minutes
 * @param {string} reason - Reason for request (optional)
 * @returns {Promise<Object>} Created request data
 */
export const createTimeRequest = async (userId, requestedMinutes, reason = '') => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    if (!isPositiveNumber(requestedMinutes)) {
      throw new Error('Invalid requested minutes');
    }
    
    // Check if user already has a pending request
    const existingRequest = await getTimeRequestsCollection()
      .where('userId', '==', userId)
      .where('status', '==', REQUEST_STATUS.PENDING)
      .get();
    
    if (!existingRequest.empty) {
      throw new Error('User already has a pending request');
    }
    
    const dateKey = getDateKey(getCurrentWIBDate());
    
    const requestData = {
      userId,
      requestedMinutes,
      reason: reason.trim(),
      status: REQUEST_STATUS.PENDING,
      dateKey,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      processedAt: null,
      processedBy: null,
      adminNote: null,
    };
    
    const docRef = await getTimeRequestsCollection().add(requestData);
    
    // Update user's pending request reference
    await firestore().collection(COLLECTIONS.USERS).doc(userId).update({
      pendingTimeRequest: docRef.id,
    });
    
    logger.info('Time request created', { userId, requestedMinutes });
    
    return { id: docRef.id, ...requestData };
  } catch (error) {
    logger.error('Failed to create time request', error);
    throw error;
  }
};

/**
 * Get all pending time requests (for admin)
 * @returns {Promise<Array>} Array of pending requests
 */
export const getPendingRequests = async () => {
  try {
    const snapshot = await getTimeRequestsCollection()
      .where('status', '==', REQUEST_STATUS.PENDING)
      .orderBy('createdAt', 'desc')
      .get();
    
    const requests = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const requestData = doc.data();
        
        // Get user data
        const userDoc = await firestore()
          .collection(COLLECTIONS.USERS)
          .doc(requestData.userId)
          .get();
        
        const userData = userDoc.exists ? userDoc.data() : null;
        
        return {
          id: doc.id,
          ...requestData,
          user: userData ? {
            displayName: userData.displayName,
            email: userData.email,
            photoURL: userData.photoURL,
          } : null,
        };
      })
    );
    
    return requests;
  } catch (error) {
    logger.error('Failed to get pending requests', error);
    throw error;
  }
};

/**
 * Approve time request
 * @param {string} requestId - Request ID
 * @param {string} adminId - Admin user ID
 * @param {number} approvedMinutes - Approved minutes (can be different from requested)
 * @param {string} note - Admin note (optional)
 * @returns {Promise<void>}
 */
export const approveTimeRequest = async (requestId, adminId, approvedMinutes, note = '') => {
  try {
    const requestRef = getTimeRequestsCollection().doc(requestId);
    const requestDoc = await requestRef.get();
    
    if (!requestDoc.exists) {
      throw new Error('Request not found');
    }
    
    const requestData = requestDoc.data();
    
    if (requestData.status !== REQUEST_STATUS.PENDING) {
      throw new Error('Request is not pending');
    }
    
    await firestore().runTransaction(async (transaction) => {
      // Update request status
      transaction.update(requestRef, {
        status: REQUEST_STATUS.APPROVED,
        approvedMinutes,
        processedAt: firestore.FieldValue.serverTimestamp(),
        processedBy: adminId,
        adminNote: note.trim(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      // Add bonus time to user
      const userRef = firestore().collection(COLLECTIONS.USERS).doc(requestData.userId);
      transaction.update(userRef, {
        bonusMinutes: firestore.FieldValue.increment(approvedMinutes),
        pendingTimeRequest: null,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    });
    
    logger.info('Time request approved', { requestId, approvedMinutes });
  } catch (error) {
    logger.error('Failed to approve time request', error);
    throw error;
  }
};

/**
 * Reject time request
 * @param {string} requestId - Request ID
 * @param {string} adminId - Admin user ID
 * @param {string} note - Rejection reason (optional)
 * @returns {Promise<void>}
 */
export const rejectTimeRequest = async (requestId, adminId, note = '') => {
  try {
    const requestRef = getTimeRequestsCollection().doc(requestId);
    const requestDoc = await requestRef.get();
    
    if (!requestDoc.exists) {
      throw new Error('Request not found');
    }
    
    const requestData = requestDoc.data();
    
    if (requestData.status !== REQUEST_STATUS.PENDING) {
      throw new Error('Request is not pending');
    }
    
    await firestore().runTransaction(async (transaction) => {
      // Update request status
      transaction.update(requestRef, {
        status: REQUEST_STATUS.REJECTED,
        processedAt: firestore.FieldValue.serverTimestamp(),
        processedBy: adminId,
        adminNote: note.trim(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      // Clear user's pending request reference
      const userRef = firestore().collection(COLLECTIONS.USERS).doc(requestData.userId);
      transaction.update(userRef, {
        pendingTimeRequest: null,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    });
    
    logger.info('Time request rejected', { requestId });
  } catch (error) {
    logger.error('Failed to reject time request', error);
    throw error;
  }
};

/**
 * Get user's request history
 * @param {string} userId - User ID
 * @param {number} limit - Number of requests to fetch
 * @returns {Promise<Array>} Array of requests
 */
export const getUserRequestHistory = async (userId, limit = 10) => {
  try {
    if (!isValidUserId(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const snapshot = await getTimeRequestsCollection()
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    logger.error('Failed to get user request history', error);
    throw error;
  }
};

/**
 * Subscribe to pending requests (for admin)
 * @param {Function} callback - Callback function(requestsArray)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToPendingRequests = (callback) => {
  return getTimeRequestsCollection()
    .where('status', '==', REQUEST_STATUS.PENDING)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      async (snapshot) => {
        const requests = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const requestData = doc.data();
            
            const userDoc = await firestore()
              .collection(COLLECTIONS.USERS)
              .doc(requestData.userId)
              .get();
            
            const userData = userDoc.exists ? userDoc.data() : null;
            
            return {
              id: doc.id,
              ...requestData,
              user: userData ? {
                displayName: userData.displayName,
                email: userData.email,
                photoURL: userData.photoURL,
              } : null,
            };
          })
        );
        
        callback(requests);
      },
      (error) => {
        logger.error('Pending requests subscription error', error);
      }
    );
};

export const timeRequestService = {
  createTimeRequest,
  getPendingRequests,
  approveTimeRequest,
  rejectTimeRequest,
  getUserRequestHistory,
  subscribeToPendingRequests,
};

export default timeRequestService;
