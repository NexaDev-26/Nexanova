// Centralized logging utility
// Provides environment-aware logging

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const logger = {
  // Info logs - only in development
  info: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  // Success logs - only in development
  success: (...args) => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  },

  // Warning logs - always show
  warn: (...args) => {
    console.warn('⚠️', ...args);
  },

  // Error logs - always show
  error: (...args) => {
    console.error('❌', ...args);
  },

  // Debug logs - only in development
  debug: (...args) => {
    if (isDevelopment) {
      console.debug('🔍', ...args);
    }
  },

  // Server startup logs - always show
  server: (...args) => {
    console.log('🚀', ...args);
  },

  // Database logs - only in development
  db: (...args) => {
    if (isDevelopment) {
      console.log('💾', ...args);
    }
  }
};

module.exports = logger;

