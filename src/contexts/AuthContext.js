/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { Logger } from '../utils/logger';
import { ROLES } from '../constants';

const logger = Logger.create('AuthContext');

// Context shape
const AuthContext = createContext({
  user: null,
  userData: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  signIn: async () => {},
  signOut: async () => {},
  refreshUserData: async () => {},
});

/**
 * Authentication Provider Component
 * Wraps the app to provide authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure Google Sign-In on mount
  useEffect(() => {
    authService.configureGoogleSignIn();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      logger.debug('Auth state changed', { uid: firebaseUser?.uid });
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch user data from Firestore
        try {
          const data = await userService.getUserById(firebaseUser.uid);
          setUserData(data);
          logger.info('User data loaded', { uid: firebaseUser.uid, role: data?.role });
        } catch (error) {
          logger.error('Failed to fetch user data', error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Subscribe to user data changes
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = userService.subscribeToUser(user.uid, (data) => {
      setUserData(data);
    });

    return unsubscribe;
  }, [user?.uid]);

  /**
   * Sign in with Google
   */
  const signIn = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await authService.signInWithGoogle();
      setUserData(data);
      logger.info('Sign in successful');
      return data;
    } catch (error) {
      logger.error('Sign in failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
      setUserData(null);
      logger.info('Sign out successful');
    } catch (error) {
      logger.error('Sign out failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh user data from Firestore
   */
  const refreshUserData = useCallback(async () => {
    if (!user?.uid) return null;
    
    try {
      const data = await userService.getUserById(user.uid);
      setUserData(data);
      return data;
    } catch (error) {
      logger.error('Failed to refresh user data', error);
      throw error;
    }
  }, [user?.uid]);

  const value = {
    user,
    userData,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: userData?.role === ROLES.ADMIN,
    signIn,
    signOut,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
