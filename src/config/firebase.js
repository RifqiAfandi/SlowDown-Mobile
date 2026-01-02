/**
 * Firebase Configuration
 * Setup Firebase app with Auth and Firestore
 * 
 * IMPORTANT: Replace these values with your actual Firebase project configuration
 * You can find these values in your Firebase Console:
 * 1. Go to Firebase Console (https://console.firebase.google.com)
 * 2. Select your project
 * 3. Click the gear icon > Project settings
 * 4. Scroll down to "Your apps" and select your app
 * 5. Copy the configuration values
 */

import { initializeApp, getApps, getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

/**
 * Initialize Firebase
 * Returns existing app if already initialized
 */
const initializeFirebase = () => {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

// Initialize Firebase
const app = initializeFirebase();

// Export Firebase services
export { app, auth, firestore };
export default app;
