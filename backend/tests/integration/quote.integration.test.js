require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');
const { createTestQuote, createTestQuotes } = require('../fixtures/quote.fixtures');

describe('Quote API Integration Tests', () => {
  let app;
  let admin;
  let client;
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
    const Client = mongoose.model('Client');
    
    const { admin: createdAdmin } = await createTestAdmin(Admin, AdminPassword);
    admin = createdAdmin;
    
    client = await createTestClient(Client, { createdBy: admin._id });
    
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: admin.email,
        password: 'password123',
      });
    
    authToken = loginResponse.body.result.token;
  });

  describe('POST /api/quote/create', () => {
    it('should create quote successfully with valid data', async () => {
      const quoteData = {
        number: 1,
        year: new Date().getFullYear(),
        date: new Date(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
        notes: 'Test quote',
      };

      const response = await request(app)
        .post('/api/quote/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(quoteData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('_id');
      // Client is autopopulated, so it might be an object or string
      const clientId = typeof response.body.result.client === 'object' 
        ? response.body.result.client._id || response.body.result.client 
        : response.body.result.client;
      expect(clientId.toString()).toBe(client._id.toString());
      expect(response.body.result.subTotal).toBe(200);
      expect(response.body.result.taxTotal).toBe(20);
      expect(response.body.result.total).toBe(220);
      expect(response.body.result).toHaveProperty('pdf');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/quote/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [],
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .post('/api/quote/create')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/quote/read/:id', () => {
    let quote;

    beforeEach(async () => {
      const Quote = mongoose.model('Quote');
      quote = await createTestQuote(Quote, client._id, admin._id);
    });

    it('should read quote successfully', async () => {
      const response = await request(app)
        .get(`/api/quote/read/${quote._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result._id).toBe(quote._id.toString());
      // Client is autopopulated, so it might be an object or string
      const clientId = typeof response.body.result.client === 'object' 
        ? response.body.result.client._id || response.body.result.client 
        : response.body.result.client;
      expect(clientId.toString()).toBe(client._id.toString());
    });

    it('should return 404 for non-existent quote', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/quote/read/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/quote/update/:id', () => {
    let quote;

    beforeEach(async () => {
      const Quote = mongoose.model('Quote');
      quote = await createTestQuote(Quote, client._id, admin._id);
    });

    it('should update quote successfully', async () => {
      const updateData = {
        number: quote.number,
        year: quote.year,
        date: quote.date.toISOString ? quote.date.toISOString() : quote.date,
        expiredDate: quote.expiredDate.toISOString ? quote.expiredDate.toISOString() : quote.expiredDate,
        client: client._id.toString(),
        items: [
          {
            itemName: 'Updated Product',
            description: 'Updated Description',
            quantity: 3,
            price: 150,
            total: 450,
          },
        ],
        taxRate: 15,
        discount: 10,
        status: 'sent',
        currency: 'USD',
        notes: 'Updated notes',
      };

      const response = await request(app)
        .patch(`/api/quote/update/${quote._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.subTotal).toBe(450);
      expect(response.body.result.taxTotal).toBe(67.5);
      expect(response.body.result.total).toBe(517.5);
      expect(response.body.result.status).toBe('sent');
    });

    it('should return 400 for empty items array', async () => {
      const response = await request(app)
        .patch(`/api/quote/update/${quote._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ items: [] })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/quote/delete/:id', () => {
    let quote;

    beforeEach(async () => {
      const Quote = mongoose.model('Quote');
      quote = await createTestQuote(Quote, client._id, admin._id);
    });

    it('should soft delete quote successfully', async () => {
      const response = await request(app)
        .delete(`/api/quote/delete/${quote._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.removed).toBe(true);
    });
  });

  describe('GET /api/quote/list', () => {
    beforeEach(async () => {
      const Quote = mongoose.model('Quote');
      await createTestQuotes(Quote, client._id, admin._id, 5);
    });

    it('should return paginated quote list', async () => {
      const response = await request(app)
        .get('/api/quote/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, items: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });

  describe('GET /api/quote/convert/:id', () => {
    let quote;

    beforeEach(async () => {
      const Quote = mongoose.model('Quote');
      quote = await createTestQuote(Quote, client._id, admin._id, {
        converted: false,
      });
    });

    it('should return upgrade message for quote conversion (premium feature)', async () => {
      const response = await request(app)
        .get(`/api/quote/convert/${quote._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Premium');
    });

    it('should return upgrade message even for non-existent quote (premium feature)', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/quote/convert/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Premium');
    });
  });

  describe('GET /api/quote/summary', () => {
    beforeEach(async () => {
      const Quote = mongoose.model('Quote');
      await createTestQuotes(Quote, client._id, admin._id, 5);
    });

    it('should return quote summary statistics', async () => {
      const response = await request(app)
        .get('/api/quote/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'month' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
    });
  });
});

