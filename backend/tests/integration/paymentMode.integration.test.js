require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');

describe('PaymentMode API Integration Tests', () => {
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

  describe('POST /api/paymentmode/create', () => {
    it('should create payment mode successfully with valid data', async () => {
      const paymentModeData = {
        name: 'Credit Card',
        description: 'Payment via credit card',
        ref: 'CC001',
        isDefault: false,
        enabled: true,
      };

      const response = await request(app)
        .post('/api/paymentmode/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentModeData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('_id');
      expect(response.body.result.name).toBe('Credit Card');
      expect(response.body.result.description).toBe('Payment via credit card');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/paymentmode/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Credit Card',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .post('/api/paymentmode/create')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/paymentmode/read/:id', () => {
    let paymentMode;

    beforeEach(async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      paymentMode = await new PaymentMode({
        name: 'Bank Transfer',
        description: 'Payment via bank transfer',
        enabled: true,
      }).save();
    });

    it('should read payment mode successfully', async () => {
      const response = await request(app)
        .get(`/api/paymentmode/read/${paymentMode._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result._id).toBe(paymentMode._id.toString());
      expect(response.body.result.name).toBe('Bank Transfer');
    });

    it('should return 404 for non-existent payment mode', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/paymentmode/read/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/paymentmode/update/:id', () => {
    let paymentMode;

    beforeEach(async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      paymentMode = await new PaymentMode({
        name: 'Cash',
        description: 'Cash payment',
        enabled: true,
      }).save();
    });

    it('should update payment mode successfully', async () => {
      const updateData = {
        name: 'Updated Cash Payment',
        description: 'Updated description',
        enabled: true, // Explicitly set enabled to avoid 422 error
        isDefault: true, // Explicitly set isDefault to avoid 422 error
      };

      const response = await request(app)
        .patch(`/api/paymentmode/update/${paymentMode._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.name).toBe('Updated Cash Payment');
    });

    it('should return 404 for non-existent payment mode', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/paymentmode/update/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated', description: 'Updated description' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/paymentmode/delete/:id', () => {
    let paymentMode;

    beforeEach(async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      paymentMode = await new PaymentMode({
        name: 'PayPal',
        description: 'PayPal payment',
        enabled: true,
      }).save();
    });

    it('should return 403 when trying to delete payment mode (deletion not allowed)', async () => {
      const response = await request(app)
        .delete(`/api/paymentmode/delete/${paymentMode._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain("can't delete payment mode");
    });
  });

  describe('GET /api/paymentmode/list', () => {
    beforeEach(async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      await new PaymentMode({
        name: 'Mode 1',
        description: 'Description 1',
        enabled: true,
      }).save();
      await new PaymentMode({
        name: 'Mode 2',
        description: 'Description 2',
        enabled: true,
      }).save();
    });

    it('should return paginated payment mode list', async () => {
      const response = await request(app)
        .get('/api/paymentmode/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, items: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });

  describe('GET /api/paymentmode/listAll', () => {
    beforeEach(async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      await new PaymentMode({
        name: 'Mode 1',
        description: 'Description 1',
        enabled: true,
      }).save();
    });

    it('should return all payment modes', async () => {
      const response = await request(app)
        .get('/api/paymentmode/listAll')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });
});

