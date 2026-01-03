/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  signInWithEmail: async () => {},
  verifyEmailCode: async () => {},
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

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        logger.debug('Checking auth status');
        
        const isAuth = await authService.isAuthenticated();
        
        if (isAuth) {
          // Get stored user data
          const storedUser = await authService.getCurrentUser();
          
          if (storedUser) {
            setUser(storedUser);
            
            // Refresh user data from backend
            try {
              const freshData = await authService.refreshUserData();
              setUserData(freshData);
              logger.info('User data refreshed', { uid: freshData?.id, role: freshData?.role });
            } catch (error) {
              // Use stored data if refresh fails
              setUserData(storedUser);
              logger.warn('Failed to refresh user data, using stored data');
            }
          }
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        logger.error('Failed to check auth status', error);
        setUser(null);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Subscribe to user data changes (polling)
  useEffect(() => {
    if (!userData?.id) return;

    const unsubscribe = userService.subscribeToUser(userData.id, (data) => {
      if (data) {
        setUserData(data);
      }
    });

    return unsubscribe;
  }, [userData?.id]);

  /**
   * Sign in with Google
   */
  const signIn = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await authService.signInWithGoogle();
      setUser(data);
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
   * Sign in with Email (sends verification)
   */
  const signInWithEmail = useCallback(async (email) => {
    try {
      setIsLoading(true);
      const result = await authService.signInWithEmail(email);
      logger.info('Verification email sent');
      return result;
    } catch (error) {
      logger.error('Email sign in failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify email code
   */
  const verifyEmailCode = useCallback(async (email, code) => {
    try {
      setIsLoading(true);
      const data = await authService.verifyEmailCode(email, code);
      setUser(data);
      setUserData(data);
      logger.info('Email verification successful');
      return data;
    } catch (error) {
      logger.error('Email verification failed', error);
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
   * Refresh user data from backend
   */
  const refreshUserData = useCallback(async () => {
    if (!userData?.id) return null;
    
    try {
      const data = await authService.refreshUserData();
      setUserData(data);
      return data;
    } catch (error) {
      logger.error('Failed to refresh user data', error);
      throw error;
    }
  }, [userData?.id]);

  const value = {
    user,
    userData,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: userData?.role === ROLES.ADMIN,
    signIn,
    signInWithEmail,
    verifyEmailCode,
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
