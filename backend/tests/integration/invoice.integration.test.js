require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');
const { createTestInvoice, createTestInvoices } = require('../fixtures/invoice.fixtures');

describe('Invoice API Integration Tests', () => {
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
    
    // Create test admin and client
    const Admin = mongoose.model('Admin');
    const AdminPassword = mongoose.model('AdminPassword');
    const Client = mongoose.model('Client');
    
    const { admin: createdAdmin } = await createTestAdmin(Admin, AdminPassword);
    admin = createdAdmin;
    
    client = await createTestClient(Client, { createdBy: admin._id });
    
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: admin.email,
        password: 'password123',
      });
    
    authToken = loginResponse.body.result.token;
  });

  describe('POST /api/invoice/create', () => {
    it('should create invoice successfully with valid data', async () => {
      const invoiceData = {
        number: 1,
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
          {
            itemName: 'Product 2',
            description: 'Description 2',
            quantity: 1,
            price: 50,
            total: 50,
          },
        ],
        taxRate: 10,
        discount: 0,
        status: 'draft',
        currency: 'USD',
        notes: 'Test invoice',
      };

      const response = await request(app)
        .post('/api/invoice/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('_id');
      // Client is autopopulated, so it might be an object or string
      const clientId = typeof response.body.result.client === 'object' 
        ? response.body.result.client._id || response.body.result.client 
        : response.body.result.client;
      expect(clientId.toString()).toBe(client._id.toString());
      expect(response.body.result.subTotal).toBe(250);
      expect(response.body.result.taxTotal).toBe(25);
      expect(response.body.result.total).toBe(275);
      expect(response.body.result.paymentStatus).toBe('unpaid');
      expect(response.body.result).toHaveProperty('pdf');
    });

    it('should set paymentStatus to paid when total equals discount', async () => {
      const invoiceData = {
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
        taxRate: 0,
        discount: 200, // discount equals total (200), so paymentStatus should be 'paid'
        status: 'draft',
        currency: 'USD',
        notes: 'Test invoice with full discount',
      };

      const response = await request(app)
        .post('/api/invoice/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.total).toBe(200);
      expect(response.body.result.discount).toBe(200);
      expect(response.body.result.paymentStatus).toBe('paid');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/invoice/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [],
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for empty items array', async () => {
      const invoiceData = {
        number: 1,
        year: new Date().getFullYear(),
        date: new Date().toISOString(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        client: client._id.toString(),
        items: [],
        taxRate: 10,
        status: 'draft',
      };

      const response = await request(app)
        .post('/api/invoice/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .post('/api/invoice/create')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/invoice/read/:id', () => {
    let invoice;

    beforeEach(async () => {
      const Invoice = mongoose.model('Invoice');
      invoice = await createTestInvoice(Invoice, client._id, admin._id);
    });

    it('should read invoice successfully', async () => {
      const response = await request(app)
        .get(`/api/invoice/read/${invoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result._id).toBe(invoice._id.toString());
      // Client is autopopulated, so it might be an object or string
      const clientId = typeof response.body.result.client === 'object' 
        ? response.body.result.client._id || response.body.result.client 
        : response.body.result.client;
      expect(clientId.toString()).toBe(client._id.toString());
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/invoice/read/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .get(`/api/invoice/read/${invoice._id}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/invoice/update/:id', () => {
    let invoice;

    beforeEach(async () => {
      const Invoice = mongoose.model('Invoice');
      invoice = await createTestInvoice(Invoice, client._id, admin._id);
    });

    it('should update invoice successfully', async () => {
      const updateData = {
        number: invoice.number,
        year: invoice.year,
        date: invoice.date.toISOString ? invoice.date.toISOString() : invoice.date,
        expiredDate: invoice.expiredDate.toISOString ? invoice.expiredDate.toISOString() : invoice.expiredDate,
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
        .patch(`/api/invoice/update/${invoice._id}`)
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
      const updateData = {
        items: [],
      };

      const response = await request(app)
        .patch(`/api/invoice/update/${invoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      // Need to provide all required fields for validation to pass
      const updateData = {
        number: 1,
        year: new Date().getFullYear(),
        date: new Date().toISOString(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        client: client._id.toString(),
        items: [{ itemName: 'Test', quantity: 1, price: 100, total: 100 }],
        taxRate: 10,
        status: 'draft',
      };
      const response = await request(app)
        .patch(`/api/invoice/update/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/invoice/delete/:id', () => {
    let invoice;

    beforeEach(async () => {
      const Invoice = mongoose.model('Invoice');
      invoice = await createTestInvoice(Invoice, client._id, admin._id);
    });

    it('should soft delete invoice successfully', async () => {
      const response = await request(app)
        .delete(`/api/invoice/delete/${invoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.removed).toBe(true);

      // Verify invoice is soft deleted
      const Invoice = mongoose.model('Invoice');
      const deletedInvoice = await Invoice.findById(invoice._id);
      expect(deletedInvoice.removed).toBe(true);
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/invoice/delete/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/invoice/list', () => {
    beforeEach(async () => {
      const Invoice = mongoose.model('Invoice');
      await createTestInvoices(Invoice, client._id, admin._id, 5);
    });

    it('should return paginated invoice list', async () => {
      const response = await request(app)
        .get('/api/invoice/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, items: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.result)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(parseInt(response.body.pagination.page)).toBe(1);
      expect(response.body.pagination).toHaveProperty('count');
    });

    it('should filter invoices by status', async () => {
      const response = await request(app)
        .get('/api/invoice/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ filter: 'status', equal: 'draft' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.every(inv => inv.status === 'draft')).toBe(true);
    });

    it('should search invoices by query', async () => {
      const response = await request(app)
        .get('/api/invoice/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: 'Test', fields: 'notes' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/invoice/summary', () => {
    beforeEach(async () => {
      const Invoice = mongoose.model('Invoice');
      await createTestInvoices(Invoice, client._id, admin._id, 5);
    });

    it('should return invoice summary statistics', async () => {
      const response = await request(app)
        .get('/api/invoice/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'month' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('total');
      expect(response.body.result).toHaveProperty('performance');
      expect(Array.isArray(response.body.result.performance)).toBe(true);
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .get('/api/invoice/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return summary with week type', async () => {
      const response = await request(app)
        .get('/api/invoice/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'week' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
    });

    it('should return summary with year type', async () => {
      const response = await request(app)
        .get('/api/invoice/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'year' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
    });

    it('should return summary with default month type when type is not provided', async () => {
      const response = await request(app)
        .get('/api/invoice/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
    });

    it('should handle summary when no invoices exist (empty totalInvoices)', async () => {
      // Clear all invoices for this specific test
      const Invoice = mongoose.model('Invoice');
      await Invoice.deleteMany({});

      const response = await request(app)
        .get('/api/invoice/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      // When no invoices exist, total might be 0, undefined, or not present depending on aggregation result
      // The result should have performance and total_undue at minimum
      expect(response.body.result).toHaveProperty('performance');
      expect(response.body.result).toHaveProperty('total_undue');
    });

    it('should handle summary when no unpaid invoices exist (empty unpaid array)', async () => {
      // Clear existing invoices first
      const Invoice = mongoose.model('Invoice');
      await Invoice.deleteMany({});
      
      // Create invoices but all are paid (no unpaid or partially paid)
      await createTestInvoice(Invoice, client._id, admin._id, {
        number: 10,
        year: new Date().getFullYear(),
        status: 'sent',
        total: 1000,
        credit: 1000,
        paymentStatus: 'paid',
      });

      const response = await request(app)
        .get('/api/invoice/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // When no unpaid/partially paid invoices exist, total_undue should be 0
      expect(response.body.result.total_undue).toBe(0);
    });
  });

  describe('GET /api/invoice/search', () => {
    beforeEach(async () => {
      const Invoice = mongoose.model('Invoice');
      await createTestInvoice(Invoice, client._id, admin._id, {
        notes: 'Special invoice for testing',
      });
    });

    it('should search invoices by notes', async () => {
      const response = await request(app)
        .get('/api/invoice/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: 'Special' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });
});

