/**
 * API Client Configuration
 * HTTP client for communicating with PostgreSQL backend
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './env';
import { Logger } from '../utils/logger';

const logger = Logger.create('ApiClient');

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      logger.error('Failed to get auth token', error);
    }
    return config;
  },
  (error) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          await AsyncStorage.removeItem('authToken');
          logger.warn('Unauthorized access, token cleared');
          break;
        case 403:
          logger.warn('Forbidden access');
          break;
        case 404:
          logger.warn('Resource not found');
          break;
        case 500:
          logger.error('Server error');
          break;
        default:
          logger.error('API error', { status: response.status });
      }
    } else {
      logger.error('Network error', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Set authentication token
 * @param {string} token - JWT token
 */
export const setAuthToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem('authToken', token);
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      await AsyncStorage.removeItem('authToken');
      delete apiClient.defaults.headers.Authorization;
    }
  } catch (error) {
    logger.error('Failed to set auth token', error);
  }
};

/**
 * Get stored authentication token
 * @returns {Promise<string|null>} Stored token or null
 */
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    logger.error('Failed to get auth token', error);
    return null;
  }
};

/**
 * Clear authentication token
 */
export const clearAuthToken = async () => {
  await setAuthToken(null);
};

export { apiClient };
export default apiClient;
