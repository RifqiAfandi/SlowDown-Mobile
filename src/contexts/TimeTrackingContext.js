/**
 * Time Tracking Context
 * Manages user's time usage and blocking state
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import { userService } from '../services/userService';
import { usageService } from '../services/usageService';
import { Logger } from '../utils/logger';
import { getCurrentWIBDate, needsDailyReset, getDateKey } from '../utils/dateUtils';
import { DEFAULT_DAILY_LIMIT } from '../constants';

const logger = Logger.create('TimeTrackingContext');

// Context shape
const TimeTrackingContext = createContext({
  remainingMinutes: DEFAULT_DAILY_LIMIT,
  usedMinutes: 0,
  bonusMinutes: 0,
  totalAllowedMinutes: DEFAULT_DAILY_LIMIT,
  isTimeUp: false,
  isBlocked: false,
  blockReason: null,
  todayUsage: null,
  weeklyUsage: [],
  trackUsage: async () => {},
  refreshUsage: async () => {},
});

/**
 * Time Tracking Provider Component
 */
export const TimeTrackingProvider = ({ children }) => {
  const { userData, isAuthenticated, isAdmin } = useAuth();
  
  const [remainingMinutes, setRemainingMinutes] = useState(DEFAULT_DAILY_LIMIT);
  const [usedMinutes, setUsedMinutes] = useState(0);
  const [bonusMinutes, setBonusMinutes] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState(null);
  const [todayUsage, setTodayUsage] = useState(null);
  const [weeklyUsage, setWeeklyUsage] = useState([]);
  
  const appState = useRef(AppState.currentState);
  const trackingStartTime = useRef(null);
  const currentApp = useRef(null);

  // Calculate total allowed minutes
  const totalAllowedMinutes = (userData?.dailyLimitMinutes || DEFAULT_DAILY_LIMIT) + bonusMinutes;

  // Update state from user data
  useEffect(() => {
    if (userData) {
      setUsedMinutes(userData.todayUsedMinutes || 0);
      setBonusMinutes(userData.bonusMinutes || 0);
      setIsBlocked(userData.isBlocked || false);
      setBlockReason(userData.blockReason || null);
      
      const totalAllowed = (userData.dailyLimitMinutes || DEFAULT_DAILY_LIMIT) + (userData.bonusMinutes || 0);
      const remaining = Math.max(0, totalAllowed - (userData.todayUsedMinutes || 0));
      
      setRemainingMinutes(remaining);
      setIsTimeUp(remaining <= 0);
      
      logger.debug('Time state updated', { 
        used: userData.todayUsedMinutes, 
        remaining, 
        isTimeUp: remaining <= 0 
      });
    }
  }, [userData]);

  // Subscribe to today's usage
  useEffect(() => {
    if (!userData?.uid || isAdmin) return;

    const unsubscribe = usageService.subscribeToTodayUsage(userData.uid, (usage) => {
      setTodayUsage(usage);
    });

    return unsubscribe;
  }, [userData?.uid, isAdmin]);

  // Load weekly usage
  const loadWeeklyUsage = useCallback(async () => {
    if (!userData?.uid || isAdmin) return;

    try {
      const weekly = await usageService.getWeeklyUsage(userData.uid);
      setWeeklyUsage(weekly);
    } catch (error) {
      logger.error('Failed to load weekly usage', error);
    }
  }, [userData?.uid, isAdmin]);

  useEffect(() => {
    loadWeeklyUsage();
  }, [loadWeeklyUsage]);

  // Check for daily reset on app focus
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        logger.debug('App came to foreground');
        
        // Check if daily reset is needed
        if (userData && needsDailyReset(userData.lastResetDate?.toDate())) {
          logger.info('Daily reset needed, refreshing user data');
          try {
            await userService.createOrUpdateUser({
              uid: userData.uid,
              email: userData.email,
              displayName: userData.displayName,
              photoURL: userData.photoURL,
              role: userData.role,
            });
          } catch (error) {
            logger.error('Failed to perform daily reset', error);
          }
        }
      }
      
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [userData]);

  /**
   * Track app usage
   * @param {string} appId - App ID being used
   * @param {number} durationMinutes - Duration in minutes
   */
  const trackUsage = useCallback(async (appId, durationMinutes) => {
    if (!userData?.uid || isAdmin) return;
    
    try {
      // Log usage to Firestore
      await usageService.logUsage(userData.uid, appId, durationMinutes);
      
      // Update user's total usage
      await userService.updateUserUsage(userData.uid, durationMinutes);
      
      logger.debug('Usage tracked', { appId, durationMinutes });
    } catch (error) {
      logger.error('Failed to track usage', error);
    }
  }, [userData?.uid, isAdmin]);

  /**
   * Start tracking for an app
   * @param {string} appId - App ID to track
   */
  const startTracking = useCallback((appId) => {
    trackingStartTime.current = Date.now();
    currentApp.current = appId;
    logger.debug('Started tracking', { appId });
  }, []);

  /**
   * Stop tracking and record usage
   */
  const stopTracking = useCallback(async () => {
    if (!trackingStartTime.current || !currentApp.current) return;

    const endTime = Date.now();
    const durationMs = endTime - trackingStartTime.current;
    const durationMinutes = durationMs / 60000;

    if (durationMinutes >= 0.1) { // Only track if at least 6 seconds
      await trackUsage(currentApp.current, durationMinutes);
    }

    trackingStartTime.current = null;
    currentApp.current = null;
    logger.debug('Stopped tracking');
  }, [trackUsage]);

  /**
   * Refresh usage data
   */
  const refreshUsage = useCallback(async () => {
    await loadWeeklyUsage();
    
    if (userData?.uid) {
      const daily = await usageService.getDailyUsage(userData.uid);
      setTodayUsage(daily);
    }
  }, [userData?.uid, loadWeeklyUsage]);

  const value = {
    remainingMinutes,
    usedMinutes,
    bonusMinutes,
    totalAllowedMinutes,
    isTimeUp,
    isBlocked,
    blockReason,
    todayUsage,
    weeklyUsage,
    trackUsage,
    startTracking,
    stopTracking,
    refreshUsage,
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

/**
 * Hook to use time tracking context
 * @returns {Object} Time tracking context value
 */
export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  
  if (!context) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  
  return context;
};

export default TimeTrackingContext;
