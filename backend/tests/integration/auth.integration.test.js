require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');

describe('Authentication API Integration Tests', () => {
  let app;
  let admin;
  let adminPassword;
  let authToken;

  beforeAll(async () => {
    // Initialize database and app
    await connectDB();
    app = initApp();
  });

  afterAll(async () => {
    await clearDB();
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
    
    // Create test admin user
    const Admin = mongoose.model('Admin');
    const AdminPassword = mongoose.model('AdminPassword');
    const { admin: createdAdmin, adminPassword: createdPassword } = await createTestAdmin(
      Admin,
      AdminPassword,
      {
        email: 'testadmin@example.com',
        password: 'password123',
      }
    );
    admin = createdAdmin;
    adminPassword = createdPassword;
  });

  describe('POST /api/login - Branch Coverage', () => {
    it('should login with remember flag set to true', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: admin.email,
          password: 'password123',
          remember: true,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result).toHaveProperty('token');
      expect(response.body.result.maxAge).toBe(365);
    });

    it('should login without remember flag (default 24h expiration)', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: admin.email,
          password: 'password123',
          remember: false,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result).toHaveProperty('token');
      expect(response.body.result.maxAge).toBeNull();
    });
  });

  describe('POST /api/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'testadmin@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('token');
      expect(response.body.result).toHaveProperty('_id');
      expect(response.body.result).toHaveProperty('email');
      expect(response.body.result.email).toBe('testadmin@example.com');
      
      authToken = response.body.result.token;
    });

    it('should return 409 for missing email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          password: 'password123',
        })
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 409 for missing password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'testadmin@example.com',
        })
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 404 for invalid email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 403 for invalid password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'testadmin@example.com',
          password: 'wrongpassword',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 409 for disabled admin account', async () => {
      // Disable the admin account
      admin.enabled = false;
      await admin.save();

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'testadmin@example.com',
          password: 'password123',
        })
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/logout', () => {
    beforeEach(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'testadmin@example.com',
          password: 'password123',
        });
      
      authToken = loginResponse.body.result.token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/forgetpassword', () => {
    it('should return success for valid email', async () => {
      const response = await request(app)
        .post('/api/forgetpassword')
        .send({
          email: 'testadmin@example.com',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 409 for missing email', async () => {
      const response = await request(app)
        .post('/api/forgetpassword')
        .send({})
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 404 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/forgetpassword')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/resetpassword', () => {
    it('should return 403 for missing reset token (invalid token check happens before validation)', async () => {
      const response = await request(app)
        .post('/api/resetpassword')
        .send({
          password: 'newpassword123',
          userId: admin._id.toString(),
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 403 for missing password (invalid token check happens before validation)', async () => {
      const response = await request(app)
        .post('/api/resetpassword')
        .send({
          resetToken: 'some-token',
          userId: admin._id.toString(),
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 403 for invalid reset token', async () => {
      const response = await request(app)
        .post('/api/resetpassword')
        .send({
          resetToken: 'invalid-token',
          password: 'newpassword123',
          userId: admin._id.toString(),
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});

