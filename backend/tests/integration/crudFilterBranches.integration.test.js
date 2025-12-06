require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');

describe('CRUD Filter - Branch Coverage Tests', () => {
  let app;
  let admin;
  let authToken;

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
  });

  describe('GET /api/client/filter - Result Branches', () => {
    it('should return empty array when no documents match filter', async () => {
      // Filter for a value that doesn't exist
      const response = await request(app)
        .get('/api/client/filter')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ filter: 'enabled', equal: 'false' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.result)).toBe(true);
      // Result will be an empty array, not null, so the else branch (404) won't be hit
    });

    it('should return documents when filter matches', async () => {
      const Client = mongoose.model('Client');
      await createTestClient(Client, { createdBy: admin._id, enabled: true });

      const response = await request(app)
        .get('/api/client/filter')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ filter: 'enabled', equal: 'true' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.result)).toBe(true);
      expect(response.body.result.length).toBeGreaterThan(0);
    });
  });
});

