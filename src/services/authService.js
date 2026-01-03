/**
 * Authentication Service
 * Handles Google Sign-In and user authentication with PostgreSQL backend
 */

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, setAuthToken, clearAuthToken } from '../config/api';
import { GOOGLE_WEB_CLIENT_ID, ADMIN_EMAIL } from '../config/env';
import { Logger } from '../utils/logger';
import { ROLES } from '../constants';

const logger = Logger.create('AuthService');

/**
 * Configure Google Sign-In
 * Must be called before any sign-in attempt
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
  logger.info('Google Sign-In configured');
};

/**
 * Sign in with Google
 * @returns {Promise<Object>} User object with role information
 */
export const signInWithGoogle = async () => {
  try {
    logger.info('Starting Google Sign-In');
    
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get user's ID token
    const signInResult = await GoogleSignin.signIn();
    const { idToken, user: googleUser } = signInResult.data || signInResult;
    
    if (!idToken) {
      throw new Error('No ID token received from Google Sign-In');
    }
    
    logger.info('Google Sign-In successful, authenticating with backend');
    
    // Send token to backend for verification and user creation
    const response = await apiClient.post('/auth/google', {
      idToken,
      email: googleUser.email,
      displayName: googleUser.name || googleUser.email?.split('@')[0] || 'User',
      photoURL: googleUser.photo,
    });
    
    const { token, user } = response.data;
    
    // Store auth token
    await setAuthToken(token);
    
    // Store user data locally
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    
    logger.info('User signed in successfully', { uid: user.id, role: user.role });
    
    return user;
  } catch (error) {
    logger.error('Google Sign-In failed', error);
    
    // Handle specific Google Sign-In errors
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      error.code = 'SIGN_IN_CANCELLED';
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      error.code = 'PLAY_SERVICES_NOT_AVAILABLE';
    }
    
    throw error;
  }
};

/**
 * Sign in with Email
 * Sends verification email before allowing login
 * @param {string} email - User email
 * @returns {Promise<Object>} Response with verification status
 */
export const signInWithEmail = async (email) => {
  try {
    logger.info('Starting Email Sign-In', { email });
    
    const response = await apiClient.post('/auth/email/send-verification', {
      email,
    });
    
    logger.info('Verification email sent', { email });
    
    return response.data;
  } catch (error) {
    logger.error('Email Sign-In failed', error);
    throw error;
  }
};

/**
 * Verify email code and complete sign in
 * @param {string} email - User email
 * @param {string} code - Verification code
 * @returns {Promise<Object>} User object with role information
 */
export const verifyEmailCode = async (email, code) => {
  try {
    logger.info('Verifying email code', { email });
    
    const response = await apiClient.post('/auth/email/verify', {
      email,
      code,
    });
    
    const { token, user } = response.data;
    
    // Store auth token
    await setAuthToken(token);
    
    // Store user data locally
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    
    logger.info('Email verification successful', { uid: user.id, role: user.role });
    
    return user;
  } catch (error) {
    logger.error('Email verification failed', error);
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    logger.info('Signing out user');
    
    // Sign out from Google
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      logger.warn('Google sign out failed (user may not have signed in with Google)', error);
    }
    
    // Clear auth token and local storage
    await clearAuthToken();
    await AsyncStorage.removeItem('userData');
    
    // Notify backend
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      logger.warn('Backend logout failed', error);
    }
    
    logger.info('User signed out successfully');
  } catch (error) {
    logger.error('Sign out failed', error);
    throw error;
  }
};

/**
 * Get current authenticated user from local storage
 * @returns {Promise<Object|null>} Current user data or null
 */
export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    logger.error('Failed to get current user', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if authenticated
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  } catch (error) {
    logger.error('Failed to check authentication', error);
    return false;
  }
};

/**
 * Refresh user data from backend
 * @returns {Promise<Object|null>} Updated user data or null
 */
export const refreshUserData = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    const user = response.data;
    
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    
    return user;
  } catch (error) {
    logger.error('Failed to refresh user data', error);
    return null;
  }
};

/**
 * Check if user is admin based on email
 * @param {string} email - User email to check
 * @returns {boolean} True if user is admin
 */
export const isAdminEmail = (email) => {
  return email === ADMIN_EMAIL;
};

export const authService = {
  configureGoogleSignIn,
  signInWithGoogle,
  signInWithEmail,
  verifyEmailCode,
  signOut,
  getCurrentUser,
  isAuthenticated,
  refreshUserData,
  isAdminEmail,
};

export default authService;
