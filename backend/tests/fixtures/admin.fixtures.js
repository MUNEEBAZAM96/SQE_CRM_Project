const { generate: uniqueId } = require('shortid');
const bcrypt = require('bcryptjs');

/**
 * Generate test admin user data
 */
const generateAdmin = (overrides = {}) => {
  return {
    name: 'Test Admin',
    email: 'admin@test.com',
    enabled: true,
    removed: false,
    ...overrides,
  };
};

/**
 * Generate test admin password data with salt
 */
const generateAdminPassword = (userId, password = 'password123', salt = null) => {
  // Generate salt if not provided
  const passwordSalt = salt || uniqueId();
  
  // Hash password using salt + password (as per AdminPassword model)
  const hashedPassword = bcrypt.hashSync(passwordSalt + password);
  
  return {
    user: userId,
    password: hashedPassword,
    salt: passwordSalt,
    loggedSessions: [],
    removed: false,
    emailVerified: true,
  };
};

/**
 * Create and save test admin user
 */
const createTestAdmin = async (AdminModel, AdminPasswordModel, overrides = {}) => {
  const adminData = generateAdmin(overrides);
  const admin = await new AdminModel(adminData).save();
  
  const passwordData = generateAdminPassword(admin._id, overrides.password || 'password123');
  const adminPassword = await new AdminPasswordModel(passwordData).save();
  
  return { admin, adminPassword };
};

module.exports = {
  generateAdmin,
  generateAdminPassword,
  createTestAdmin,
};

