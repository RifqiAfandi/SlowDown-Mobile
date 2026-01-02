/**
 * Authentication Service
 * Handles Google Sign-In and user authentication
 */

import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Logger } from '../utils/logger';
import { ADMIN_EMAIL, ROLES } from '../constants';
import { userService } from './userService';

const logger = Logger.create('AuthService');

/**
 * Configure Google Sign-In
 * Must be called before any sign-in attempt
 * 
 * TODO: Replace webClientId with your actual Web Client ID from Firebase Console
 * Go to Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
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
    const { idToken } = signInResult.data || signInResult;
    
    if (!idToken) {
      throw new Error('No ID token received from Google Sign-In');
    }
    
    // Create Google credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    
    // Sign in to Firebase with Google credential
    const userCredential = await auth().signInWithCredential(googleCredential);
    const firebaseUser = userCredential.user;
    
    logger.info('Firebase authentication successful', { uid: firebaseUser.uid });
    
    // Determine user role based on email
    const role = firebaseUser.email === ADMIN_EMAIL ? ROLES.ADMIN : ROLES.USER;
    
    // Create or update user in Firestore
    const userData = await userService.createOrUpdateUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      photoURL: firebaseUser.photoURL,
      role,
    });
    
    logger.info('User signed in successfully', { uid: firebaseUser.uid, role });
    
    return userData;
  } catch (error) {
    logger.error('Google Sign-In failed', error);
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
    await GoogleSignin.signOut();
    
    // Sign out from Firebase
    await auth().signOut();
    
    logger.info('User signed out successfully');
  } catch (error) {
    logger.error('Sign out failed', error);
    throw error;
  }
};

/**
 * Get current authenticated user
 * @returns {Object|null} Current Firebase user or null
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Callback function(user)
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  return auth().onAuthStateChanged(callback);
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
  signOut,
  getCurrentUser,
  onAuthStateChanged,
  isAdminEmail,
};

export default authService;
