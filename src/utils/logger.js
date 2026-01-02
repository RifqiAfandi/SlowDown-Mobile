/**
 * Logger Utility
 * Provides consistent logging throughout the application
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Set minimum log level (change to LOG_LEVELS.WARN or LOG_LEVELS.ERROR for production)
const MIN_LOG_LEVEL = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

/**
 * Format log message with timestamp and context
 * @param {string} level - Log level
 * @param {string} context - Context/module name
 * @param {string} message - Log message
 * @returns {string} Formatted log message
 */
const formatMessage = (level, context, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] [${context}]: ${message}`;
};

/**
 * Logger class for consistent logging
 */
class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  /**
   * Create a new logger with specific context
   * @param {string} context - Context/module name
   * @returns {Logger} New logger instance
   */
  static create(context) {
    return new Logger(context);
  }

  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  debug(message, data = null) {
    if (MIN_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
      const formatted = formatMessage('DEBUG', this.context, message);
      if (data) {
        console.log(formatted, data);
      } else {
        console.log(formatted);
      }
    }
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  info(message, data = null) {
    if (MIN_LOG_LEVEL <= LOG_LEVELS.INFO) {
      const formatted = formatMessage('INFO', this.context, message);
      if (data) {
        console.info(formatted, data);
      } else {
        console.info(formatted);
      }
    }
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  warn(message, data = null) {
    if (MIN_LOG_LEVEL <= LOG_LEVELS.WARN) {
      const formatted = formatMessage('WARN', this.context, message);
      if (data) {
        console.warn(formatted, data);
      } else {
        console.warn(formatted);
      }
    }
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Error|Object} error - Error object or additional data
   */
  error(message, error = null) {
    if (MIN_LOG_LEVEL <= LOG_LEVELS.ERROR) {
      const formatted = formatMessage('ERROR', this.context, message);
      if (error) {
        console.error(formatted, error);
        // In production, you might want to send this to a crash reporting service
        if (!__DEV__ && error instanceof Error) {
          // TODO: Send to crash reporting service (e.g., Crashlytics)
        }
      } else {
        console.error(formatted);
      }
    }
  }

  /**
   * Log API request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   */
  logApiRequest(method, endpoint, params = null) {
    this.debug(`API Request: ${method} ${endpoint}`, params);
  }

  /**
   * Log API response
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {number} status - Response status
   * @param {number} duration - Request duration in ms
   */
  logApiResponse(method, endpoint, status, duration) {
    this.debug(`API Response: ${method} ${endpoint} - ${status} (${duration}ms)`);
  }

  /**
   * Log user action
   * @param {string} action - Action name
   * @param {Object} details - Action details
   */
  logAction(action, details = null) {
    this.info(`User Action: ${action}`, details);
  }
}

// Default logger instance
const defaultLogger = new Logger('App');

export { Logger, defaultLogger };
export default defaultLogger;
