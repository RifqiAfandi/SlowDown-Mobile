/**
 * Time Tracking Context
 * Manages user's time usage and blocking state
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { usageService } from '../services/usageService';
import usageStatsNative from '../services/usageStatsNative';
import { apiClient } from '../config/api';
import { Logger } from '../utils/logger';
import { getCurrentWIBDate, getDateKey } from '../utils/dateUtils';
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
  hasPermission: false,
  checkPermission: async () => {},
  requestPermission: async () => {},
  refreshUsage: async () => {},
  syncUsageFromDevice: async () => {},
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
  const [hasPermission, setHasPermission] = useState(false);
  
  const appState = useRef(AppState.currentState);
  const syncIntervalRef = useRef(null);

  // Calculate total allowed minutes
  const totalAllowedMinutes = (userData?.dailyLimitMinutes || DEFAULT_DAILY_LIMIT) + bonusMinutes;

  // Check usage stats permission
  const checkPermission = useCallback(async () => {
    const granted = await usageStatsNative.hasUsageStatsPermission();
    setHasPermission(granted);
    return granted;
  }, []);

  // Request usage stats permission
  const requestPermission = useCallback(async () => {
    await usageStatsNative.requestUsageStatsPermission();
    // Permission is granted in settings, we'll check again when app comes back
  }, []);

  // Sync usage data from device to backend
  const syncUsageFromDevice = useCallback(async () => {
    if (!userData?.id || isAdmin || !hasPermission) return;

    try {
      const deviceUsage = await usageStatsNative.getSocialMediaUsageToday();
      logger.info('Device usage fetched', deviceUsage);

      // Sync to backend
      const response = await apiClient.post('/usage/sync', {
        date: getDateKey(getCurrentWIBDate()),
        totalMinutes: deviceUsage.totalMinutes,
        appUsage: deviceUsage.appUsage,
      });

      const usage = response.data.usage;
      
      // Update local state
      setUsedMinutes(usage.totalMinutes);
      setTodayUsage({
        totalMinutes: usage.totalMinutes,
        appUsage: usage.appUsage,
      });

      const remaining = Math.max(0, usage.dailyLimit - usage.totalMinutes);
      setRemainingMinutes(remaining);
      setIsTimeUp(usage.isLimitExceeded);

      logger.info('Usage synced', { 
        totalMinutes: usage.totalMinutes, 
        remaining,
        isLimitExceeded: usage.isLimitExceeded 
      });

      return usage;
    } catch (error) {
      logger.error('Failed to sync usage from device', error);
      throw error;
    }
  }, [userData?.id, isAdmin, hasPermission]);

  // Initial permission check
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Update state from user data
  useEffect(() => {
    if (userData) {
      setBonusMinutes(userData.bonusMinutes || 0);
      setIsBlocked(userData.isBlocked || false);
      setBlockReason(userData.blockReason || null);
      
      logger.debug('User data updated', { 
        dailyLimit: userData.dailyLimitMinutes,
        isBlocked: userData.isBlocked
      });
    }
  }, [userData]);

  // Load weekly usage from device
  const loadWeeklyUsage = useCallback(async () => {
    if (!hasPermission) return;

    try {
      const history = await usageStatsNative.getUsageHistory(7);
      setWeeklyUsage(history);
      logger.debug('Weekly usage loaded', { days: history.length });
    } catch (error) {
      logger.error('Failed to load weekly usage', error);
    }
  }, [hasPermission]);

  useEffect(() => {
    loadWeeklyUsage();
  }, [loadWeeklyUsage]);

  // Check for daily reset on app focus
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        logger.debug('App came to foreground');
        
        // Refresh usage data when app comes to foreground
        if (userData?.id && !isAdmin) {
          try {
            await refreshUsage();
            logger.info('Usage data refreshed on foreground');
          } catch (error) {
            logger.error('Failed to refresh usage data', error);
          }
        }
      }
      
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [userData, isAdmin, refreshUsage]);

  /**
   * Track app usage
   * @param {string} appId - App ID being used
   * @param {number} durationMinutes - Duration in minutes
   */
  const trackUsage = useCallback(async (appId, durationMinutes) => {
    if (!userData?.id || isAdmin) return;
    
    try {
      // Log usage to backend
      await usageService.logUsage(userData.id, appId, durationMinutes);
      
      // Update user's total usage
      await userService.updateUserUsage(userData.id, durationMinutes);
      
      logger.debug('Usage tracked', { appId, durationMinutes });
    } catch (error) {
      logger.error('Failed to track usage', error);
    }
  }, [userData?.id, isAdmin]);

  /**
   * Start tracking for an app
   * @param {string} appId - App ID to track
  // Auto-sync usage periodically when app is active
  useEffect(() => {
    if (!userData?.id || isAdmin || !hasPermission) return;

    // Sync immediately
    syncUsageFromDevice();

    // Set up periodic sync (every 60 seconds)
    syncIntervalRef.current = setInterval(() => {
      syncUsageFromDevice();
    }, 60000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [userData?.id, isAdmin, hasPermission, syncUsageFromDevice]);

  /**
   * Refresh usage data
   */
  const refreshUsage = useCallback(async () => {
    await checkPermission();
    await loadWeeklyUsage();
    
    if (hasPermission) {
      await syncUsageFromDevice();
    }
  }, [checkPermission, loadWeeklyUsage, hasPermission, syncUsageFromDevice]);

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
    hasPermission,
    checkPermission,
    requestPermission,
    refreshUsage,
    syncUsageFromDevice,
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