const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const isValidAuthToken = require('@/controllers/middlewaresControllers/createAuthMiddleware/isValidAuthToken');

describe('Authentication Middleware - isValidAuthToken', () => {
  let AdminModel;
  let AdminPasswordModel;
  let admin;
  let adminPassword;
  let req;
  let res;
  let next;

  beforeAll(async () => {
    const { connectDB, loadModels } = require('../../setup/db.setup');
    await connectDB();
    loadModels();
    
    AdminModel = mongoose.model('Admin');
    AdminPasswordModel = mongoose.model('AdminPassword');
  });

  afterAll(async () => {
    const { closeDB } = require('../../setup/db.setup');
    await closeDB();
  });

  beforeEach(async () => {
    // Create test admin
    const { createTestAdmin } = require('../../fixtures/admin.fixtures');
    const result = await createTestAdmin(AdminModel, AdminPasswordModel);
    admin = result.admin;
    adminPassword = result.adminPassword;

    // Mock request, response, next
    req = {
      headers: {},
      admin: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(async () => {
    const { clearDB } = require('../../setup/db.setup');
    await clearDB();
  });

  test('should allow request with valid token', async () => {
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'test-jwt-secret-key');
    
    // Add token to logged sessions
    adminPassword.loggedSessions.push(token);
    await adminPassword.save();

    req.headers.authorization = `Bearer ${token}`;

    await isValidAuthToken(req, res, next, {
      userModel: 'Admin',
      jwtSecret: 'JWT_SECRET',
    });

    expect(next).toHaveBeenCalled();
    expect(req.admin).toBeDefined();
    expect(req.admin._id.toString()).toBe(admin._id.toString());
  });

  test('should reject request without token', async () => {
    req.headers.authorization = undefined;

    await isValidAuthToken(req, res, next, {
      userModel: 'Admin',
      jwtSecret: 'JWT_SECRET',
    });

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'No authentication token, authorization denied.',
        jwtExpired: true,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request with invalid token', async () => {
    req.headers.authorization = 'Bearer invalid-token';

    await isValidAuthToken(req, res, next, {
      userModel: 'Admin',
      jwtSecret: 'JWT_SECRET',
    });

    // JWT verification throws an error for invalid tokens, which is caught and returns 401
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request with token not in logged sessions', async () => {
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'test-jwt-secret-key');
    // Don't add token to logged sessions

    req.headers.authorization = `Bearer ${token}`;

    await isValidAuthToken(req, res, next, {
      userModel: 'Admin',
      jwtSecret: 'JWT_SECRET',
    });

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'User is already logout try to login, authorization denied.',
        jwtExpired: true,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request with token for non-existent user', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id: nonExistentUserId }, process.env.JWT_SECRET || 'test-jwt-secret-key');

    req.headers.authorization = `Bearer ${token}`;

    await isValidAuthToken(req, res, next, {
      userModel: 'Admin',
      jwtSecret: 'JWT_SECRET',
    });

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "User doens't Exist, authorization denied.",
        jwtExpired: true,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

