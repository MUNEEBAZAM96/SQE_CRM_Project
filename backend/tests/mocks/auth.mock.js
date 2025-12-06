const jwt = require('jsonwebtoken');

/**
 * Generate a test JWT token
 */
const generateToken = (userId, secret = process.env.JWT_SECRET || 'test-jwt-secret-key') => {
  return jwt.sign({ id: userId }, secret, { expiresIn: '24h' });
};

/**
 * Create mock request with authentication
 */
const createAuthenticatedRequest = (userId, overrides = {}) => {
  const token = generateToken(userId);
  
  return {
    headers: {
      authorization: `Bearer ${token}`,
      ...overrides.headers,
    },
    admin: {
      _id: userId,
      email: 'admin@test.com',
      name: 'Test Admin',
      ...overrides.admin,
    },
    ...overrides,
  };
};

/**
 * Create mock request without authentication
 */
const createUnauthenticatedRequest = (overrides = {}) => {
  return {
    headers: {},
    ...overrides,
  };
};

module.exports = {
  generateToken,
  createAuthenticatedRequest,
  createUnauthenticatedRequest,
};

