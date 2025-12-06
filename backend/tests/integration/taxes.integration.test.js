require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');

describe('Taxes API Integration Tests', () => {
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

  describe('POST /api/taxes/create', () => {
    it('should create tax successfully with valid data', async () => {
      const taxData = {
        taxName: 'VAT',
        taxValue: 20,
        isDefault: false,
        enabled: true,
      };

      const response = await request(app)
        .post('/api/taxes/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taxData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('_id');
      expect(response.body.result.taxName).toBe('VAT');
      expect(response.body.result.taxValue).toBe(20);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/taxes/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taxName: 'VAT',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .post('/api/taxes/create')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/taxes/read/:id', () => {
    let tax;

    beforeEach(async () => {
      const Taxes = mongoose.model('Taxes');
      tax = await new Taxes({
        taxName: 'Sales Tax',
        taxValue: 10,
        enabled: true,
      }).save();
    });

    it('should read tax successfully', async () => {
      const response = await request(app)
        .get(`/api/taxes/read/${tax._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result._id).toBe(tax._id.toString());
      expect(response.body.result.taxName).toBe('Sales Tax');
      expect(response.body.result.taxValue).toBe(10);
    });

    it('should return 404 for non-existent tax', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/taxes/read/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/taxes/update/:id', () => {
    let tax;

    beforeEach(async () => {
      const Taxes = mongoose.model('Taxes');
      tax = await new Taxes({
        taxName: 'GST',
        taxValue: 15,
        enabled: true,
      }).save();
    });

    it('should update tax successfully', async () => {
      const updateData = {
        taxName: 'Updated GST',
        taxValue: 18,
        enabled: true, // Explicitly set enabled to avoid 422 error
        isDefault: true, // Explicitly set isDefault to avoid 422 error
      };

      const response = await request(app)
        .patch(`/api/taxes/update/${tax._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.taxName).toBe('Updated GST');
      expect(response.body.result.taxValue).toBe(18);
    });

    it('should return 404 for non-existent tax', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/taxes/update/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ taxName: 'Test Tax', taxValue: 20 })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/taxes/delete/:id', () => {
    let tax;

    beforeEach(async () => {
      const Taxes = mongoose.model('Taxes');
      tax = await new Taxes({
        taxName: 'Service Tax',
        taxValue: 5,
        enabled: true,
      }).save();
    });

    it('should return 403 when trying to delete tax (deletion not allowed)', async () => {
      const response = await request(app)
        .delete(`/api/taxes/delete/${tax._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain("can't delete tax");
    });
  });

  describe('GET /api/taxes/list', () => {
    beforeEach(async () => {
      const Taxes = mongoose.model('Taxes');
      await new Taxes({
        taxName: 'Tax 1',
        taxValue: 10,
        enabled: true,
      }).save();
      await new Taxes({
        taxName: 'Tax 2',
        taxValue: 20,
        enabled: true,
      }).save();
    });

    it('should return paginated taxes list', async () => {
      const response = await request(app)
        .get('/api/taxes/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, items: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });

  describe('GET /api/taxes/listAll', () => {
    beforeEach(async () => {
      const Taxes = mongoose.model('Taxes');
      await new Taxes({
        taxName: 'Tax 1',
        taxValue: 10,
        enabled: true,
      }).save();
    });

    it('should return all taxes', async () => {
      const response = await request(app)
        .get('/api/taxes/listAll')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });
});

