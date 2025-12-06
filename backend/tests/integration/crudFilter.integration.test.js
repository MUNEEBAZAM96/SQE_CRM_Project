require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');

describe('CRUD Filter API Integration Tests', () => {
  let app;
  let admin;
  let authToken;
  let client;

  beforeAll(async () => {
    await connectDB();
    app = initApp();
  });

  afterAll(async () => {
    await clearDB();
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
    
    const Admin = mongoose.model('Admin');
    const AdminPassword = mongoose.model('AdminPassword');
    
    const { admin: createdAdmin } = await createTestAdmin(Admin, AdminPassword);
    admin = createdAdmin;
    
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: admin.email,
        password: 'password123',
      });
    
    authToken = loginResponse.body.result.token;

    const Client = mongoose.model('Client');
    client = await createTestClient(Client, { createdBy: admin._id, enabled: true });
  });

  describe('GET /api/client/filter', () => {
    it('should return 403 when filter parameter is missing', async () => {
      const response = await request(app)
        .get('/api/client/filter')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ equal: 'true' })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('filter not provided correctly');
    });

    it('should return 403 when equal parameter is missing', async () => {
      const response = await request(app)
        .get('/api/client/filter')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ filter: 'enabled' })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('filter not provided correctly');
    });

    it('should return 403 when both filter and equal are missing', async () => {
      const response = await request(app)
        .get('/api/client/filter')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('filter not provided correctly');
    });

    it('should filter clients successfully with valid parameters', async () => {
      const response = await request(app)
        .get('/api/client/filter')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ filter: 'enabled', equal: 'true' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });
});

