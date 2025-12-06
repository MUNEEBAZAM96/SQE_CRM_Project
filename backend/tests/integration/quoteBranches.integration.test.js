require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');
const { createTestQuote } = require('../fixtures/quote.fixtures');

describe('Quote - Branch Coverage Tests', () => {
  let app;
  let admin;
  let authToken;
  let client;
  let quote;

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

    const Quote = mongoose.model('Quote');
    quote = await createTestQuote(Quote, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
      total: 1000,
      discount: 0,
    });
  });

  describe('POST /api/quote/create - Branch Coverage', () => {
    it('should create quote with taxRate when provided', async () => {
      const quoteData = {
        number: 2,
        year: new Date().getFullYear(),
        date: new Date().toISOString(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        client: client._id.toString(),
        items: [
          {
            itemName: 'Product 1',
            description: 'Description 1',
            quantity: 2,
            price: 100,
            total: 200,
          },
        ],
        taxRate: 10,
        discount: 0,
        status: 'draft',
        currency: 'USD',
        notes: 'Test quote with tax',
      };

      const response = await request(app)
        .post('/api/quote/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(quoteData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result).toHaveProperty('taxRate', 10);
      expect(response.body.result).toHaveProperty('taxTotal');
    });

    it('should create quote without taxRate when not provided', async () => {
      const quoteData = {
        number: 3,
        year: new Date().getFullYear(),
        date: new Date().toISOString(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        client: client._id.toString(),
        items: [
          {
            itemName: 'Product 1',
            description: 'Description 1',
            quantity: 2,
            price: 100,
            total: 200,
          },
        ],
        discount: 0,
        status: 'draft',
        currency: 'USD',
        notes: 'Test quote without tax',
      };

      const response = await request(app)
        .post('/api/quote/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(quoteData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result).toHaveProperty('total', 200);
      // taxRate may not be present if not provided
    });
  });

  describe('GET /api/quote/paginatedList - Branch Coverage', () => {
    beforeEach(async () => {
      const Quote = mongoose.model('Quote');
      // Create multiple quotes for pagination testing
      for (let i = 2; i <= 5; i++) {
        await createTestQuote(Quote, client._id, admin._id, {
          number: i,
          year: new Date().getFullYear(),
          status: 'draft',
        });
      }
    });

    it('should return paginated list with default page and items', async () => {
      const response = await request(app)
        .get('/api/quote/list')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should return paginated list with custom page and items', async () => {
      const response = await request(app)
        .get('/api/quote/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 2, items: 2 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination.page).toBe('2'); // Page is returned as string
      expect(response.body.pagination).toHaveProperty('count');
      expect(response.body.pagination).toHaveProperty('pages');
    });
  });

  describe('GET /api/quote/summary - Branch Coverage', () => {
    it('should return summary with week type', async () => {
      const response = await request(app)
        .get('/api/quote/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'week' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
    });

    it('should return summary with year type', async () => {
      const response = await request(app)
        .get('/api/quote/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'year' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
    });

    it('should return summary with default month type when type is not provided', async () => {
      const response = await request(app)
        .get('/api/quote/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
    });
  });
});

