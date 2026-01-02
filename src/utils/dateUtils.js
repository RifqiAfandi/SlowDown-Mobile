/**
 * Date and Time Utilities
 * Handles WIB timezone calculations and time formatting
 */

import { format, startOfDay, endOfDay, subDays, differenceInMinutes } from 'date-fns';
import { TIMEZONE_OFFSET } from '../constants';

/**
 * Get current date/time in WIB timezone
 * @returns {Date} Current date in WIB
 */
export const getCurrentWIBDate = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + TIMEZONE_OFFSET * 3600000);
};

/**
 * Get start of day in WIB timezone
 * @param {Date} date - Date to get start of day for
 * @returns {Date} Start of day in WIB
 */
export const getStartOfDayWIB = (date = new Date()) => {
  const wibDate = getCurrentWIBDate();
  return startOfDay(wibDate);
};

/**
 * Get end of day in WIB timezone
 * @param {Date} date - Date to get end of day for
 * @returns {Date} End of day in WIB
 */
export const getEndOfDayWIB = (date = new Date()) => {
  const wibDate = getCurrentWIBDate();
  return endOfDay(wibDate);
};

/**
 * Format time remaining from minutes
 * @param {number} minutes - Minutes remaining
 * @returns {string} Formatted time string (e.g., "15:30" or "00:00")
 */
export const formatTimeRemaining = (minutes) => {
  if (minutes <= 0) return '00:00';
  
  const mins = Math.floor(minutes);
  const secs = Math.floor((minutes - mins) * 60);
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format minutes to human readable string
 * @param {number} minutes - Minutes to format
 * @returns {string} Formatted string (e.g., "30 menit" or "1 jam 15 menit")
 */
export const formatMinutesToReadable = (minutes) => {
  if (minutes < 1) return 'Kurang dari 1 menit';
  if (minutes < 60) return `${Math.floor(minutes)} menit`;
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (mins === 0) return `${hours} jam`;
  return `${hours} jam ${mins} menit`;
};

/**
 * Get date string for Firebase document ID (YYYY-MM-DD format in WIB)
 * @param {Date} date - Date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getDateKey = (date = new Date()) => {
  const wibDate = date instanceof Date ? date : getCurrentWIBDate();
  return format(wibDate, 'yyyy-MM-dd');
};

/**
 * Get week dates array (last 7 days)
 * @returns {Array<string>} Array of date keys for the last 7 days
 */
export const getWeekDateKeys = () => {
  const dates = [];
  const today = getCurrentWIBDate();
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    dates.push(getDateKey(date));
  }
  
  return dates;
};

/**
 * Get day name in Indonesian
 * @param {string} dateKey - Date key in YYYY-MM-DD format
 * @returns {string} Day name in Indonesian (e.g., "Sen", "Sel")
 */
export const getDayName = (dateKey) => {
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const date = new Date(dateKey);
  return days[date.getDay()];
};

/**
 * Check if current time is past midnight WIB (for daily reset)
 * @param {Date} lastResetDate - Last reset date
 * @returns {boolean} True if daily reset is needed
 */
export const needsDailyReset = (lastResetDate) => {
  if (!lastResetDate) return true;
  
  const currentWIB = getCurrentWIBDate();
  const lastReset = new Date(lastResetDate);
  
  const currentDateKey = getDateKey(currentWIB);
  const lastResetDateKey = getDateKey(lastReset);
  
  return currentDateKey !== lastResetDateKey;
};

/**
 * Calculate difference in minutes between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Difference in minutes
 */
export const getMinutesDifference = (startDate, endDate) => {
  return differenceInMinutes(endDate, startDate);
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Format date and time for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date time string
 */
export const formatDateTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMM yyyy, HH:mm');
};
