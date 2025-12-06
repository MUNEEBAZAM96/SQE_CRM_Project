require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');

describe('CRUD Search - Branch Coverage Tests', () => {
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
    client = await createTestClient(Client, { createdBy: admin._id });
  });

  describe('GET /api/client/search - Branch Coverage', () => {
    it('should return 202 when query parameter is missing', async () => {
      const response = await request(app)
        .get('/api/client/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(202);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.result).toEqual([]);
      expect(response.body.message).toBe('No document found by this request');
    });

    it('should return 202 when query parameter is empty string', async () => {
      const response = await request(app)
        .get('/api/client/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: '' })
        .expect(202);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.result).toEqual([]);
      expect(response.body.message).toBe('No document found by this request');
    });

    it('should return 202 when query parameter is only whitespace', async () => {
      const response = await request(app)
        .get('/api/client/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: '   ' })
        .expect(202);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.result).toEqual([]);
      expect(response.body.message).toBe('No document found by this request');
    });

    it('should return 202 when no documents match search query', async () => {
      const response = await request(app)
        .get('/api/client/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: 'NonExistentClientName12345' })
        .expect(202);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.result).toEqual([]);
      expect(response.body.message).toBe('No document found by this request');
    });

    it('should return 200 when documents match search query', async () => {
      const response = await request(app)
        .get('/api/client/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: client.name })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.result)).toBe(true);
      expect(response.body.result.length).toBeGreaterThan(0);
    });

    it('should search using custom fields parameter', async () => {
      const response = await request(app)
        .get('/api/client/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: client.name, fields: 'name,email' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });
});

