export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const getAuthHeaders = (token) => {
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Category types
export const CATEGORY_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// UI Messages
export const UI_MESSAGES = {
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  CONFIRM_DELETE: 'Are you sure you want to delete this category?',
  MAGIC_LINK_SENT: 'Magic link sent! Check your email.',
  CATEGORY_CREATED: 'Category created successfully!',
  CATEGORY_UPDATED: 'Category updated successfully!',
  CATEGORY_DELETED: 'Category deleted successfully!',
  TRANSACTION_CREATED: 'Transaction added successfully!',
  TRANSACTION_UPDATED: 'Transaction updated successfully!',
  TRANSACTION_DELETED: 'Transaction deleted successfully!',
  ERROR_GENERIC: 'An error occurred. Please try again.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_UNAUTHORIZED: 'You are not authorized to perform this action.',
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address'
  },
  CATEGORY_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    MESSAGE: 'Category name must be between 1 and 50 characters'
  }
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CATEGORIES: '/categories'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_EMAIL: 'user_email'
};

// Animation durations (in ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};