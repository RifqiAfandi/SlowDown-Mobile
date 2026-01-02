/**
 * Validation Utilities
 * Input validation and sanitization functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate positive number
 * @param {number} value - Number to validate
 * @returns {boolean} True if valid positive number
 */
export const isPositiveNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && value > 0;
};

/**
 * Validate non-negative number
 * @param {number} value - Number to validate
 * @returns {boolean} True if valid non-negative number
 */
export const isNonNegativeNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
};

/**
 * Validate time in minutes (0-1440 for a day)
 * @param {number} minutes - Minutes to validate
 * @returns {boolean} True if valid time in minutes
 */
export const isValidTimeInMinutes = (minutes) => {
  return isNonNegativeNumber(minutes) && minutes <= 1440;
};

/**
 * Validate user ID format
 * @param {string} userId - User ID to validate
 * @returns {boolean} True if valid user ID
 */
export const isValidUserId = (userId) => {
  return typeof userId === 'string' && userId.length > 0 && userId.length <= 128;
};

/**
 * Validate display name
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid display name
 */
export const isValidDisplayName = (name) => {
  return typeof name === 'string' && name.trim().length >= 1 && name.length <= 100;
};

/**
 * Trim and normalize whitespace in string
 * @param {string} input - String to normalize
 * @returns {string} Normalized string
 */
export const normalizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Validate and sanitize user input for Firestore
 * @param {Object} data - Data object to validate
 * @returns {Object} Sanitized data object
 */
export const sanitizeFirestoreData = (data) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    
    if (typeof value === 'string') {
      sanitized[key] = normalizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeFirestoreData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
