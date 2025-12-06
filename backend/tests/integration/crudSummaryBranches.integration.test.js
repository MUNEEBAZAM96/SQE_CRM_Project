require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');

describe('CRUD Summary - Branch Coverage Tests', () => {
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

  describe('GET /api/paymentmode/summary - Generic CRUD Summary', () => {
    it('should return 203 when collection is empty', async () => {
      // PaymentMode uses the generic CRUD summary
      const response = await request(app)
        .get('/api/paymentmode/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(203); // Generic summary returns 203 when empty

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('result', []);
      expect(response.body.message).toBe('Collection is Empty');
    });

    it('should return summary when collection has documents', async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      await new PaymentMode({
        name: 'Test Payment Mode',
        description: 'Test Description',
        enabled: true,
        createdBy: admin._id,
      }).save();

      const response = await request(app)
        .get('/api/paymentmode/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('countFilter');
      expect(response.body.result).toHaveProperty('countAllDocs');
    });

    it('should return summary with filter when query params provided', async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      await new PaymentMode({
        name: 'Test Payment Mode 1',
        description: 'Test Description 1',
        enabled: true,
        createdBy: admin._id,
      }).save();
      await new PaymentMode({
        name: 'Test Payment Mode 2',
        description: 'Test Description 2',
        enabled: false,
        createdBy: admin._id,
      }).save();

      const response = await request(app)
        .get('/api/paymentmode/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ filter: 'enabled', equal: 'true' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.countAllDocs).toBeGreaterThan(0);
    });
  });
});

