/**
 * Time Request Service
 * Handles requests for additional time from users to admin via PostgreSQL backend
 */

import { apiClient } from '../config/api';
import { Logger } from '../utils/logger';
import { REQUEST_STATUS } from '../constants';
import { isValidUserId, isPositiveNumber } from '../utils/validation';

const logger = Logger.create('TimeRequestService');

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
    
    const response = await apiClient.post('/time-requests', {
      userId,
      requestedMinutes,
      reason: reason.trim(),
    });
    
    logger.info('Time request created', { userId, requestedMinutes });
    
    return response.data;
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
    const response = await apiClient.get('/time-requests/pending');
    
    return response.data;
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
    await apiClient.post(`/time-requests/${requestId}/approve`, {
      adminId,
      approvedMinutes,
      note: note.trim(),
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
    await apiClient.post(`/time-requests/${requestId}/reject`, {
      adminId,
      note: note.trim(),
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
    
    const response = await apiClient.get(`/time-requests/user/${userId}`, {
      params: { limit },
    });
    
    return response.data;
  } catch (error) {
    logger.error('Failed to get user request history', error);
    throw error;
  }
};

/**
 * Subscribe to pending requests (for admin, polling-based)
 * @param {Function} callback - Callback function(requestsArray)
 * @param {number} interval - Polling interval in ms (default: 30000)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToPendingRequests = (callback, interval = 30000) => {
  let isActive = true;
  
  const fetchRequests = async () => {
    if (!isActive) return;
    
    try {
      const requests = await getPendingRequests();
      if (isActive) {
        callback(requests);
      }
    } catch (error) {
      logger.error('Pending requests subscription error', error);
    }
  };
  
  // Initial fetch
  fetchRequests();
  
  // Set up polling
  const intervalId = setInterval(fetchRequests, interval);
  
  // Return unsubscribe function
  return () => {
    isActive = false;
    clearInterval(intervalId);
  };
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
