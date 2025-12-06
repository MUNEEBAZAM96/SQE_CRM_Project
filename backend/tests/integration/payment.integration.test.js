require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');
const { createTestInvoice } = require('../fixtures/invoice.fixtures');
const { createTestPayment } = require('../fixtures/payment.fixtures');

describe('Payment API Integration Tests', () => {
  let app;
  let admin;
  let client;
  let invoice;
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
    const Invoice = mongoose.model('Invoice');
    
    const { admin: createdAdmin } = await createTestAdmin(Admin, AdminPassword);
    admin = createdAdmin;
    
    client = await createTestClient(Client, { createdBy: admin._id });
    invoice = await createTestInvoice(Invoice, client._id, admin._id, {
      total: 1000,
      credit: 0,
      paymentStatus: 'unpaid',
    });
    
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: admin.email,
        password: 'password123',
      });
    
    authToken = loginResponse.body.result.token;
  });

  describe('POST /api/payment/create', () => {
    it('should create payment successfully with valid data', async () => {
      const paymentData = {
        invoice: invoice._id.toString(),
        client: client._id.toString(),
        number: 1,
        amount: 500,
        date: new Date(),
        currency: 'USD',
        description: 'Test payment',
      };

      const response = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('_id');
      // Invoice is autopopulated, so it might be an object or string
      const invoiceId = typeof response.body.result.invoice === 'object' 
        ? response.body.result.invoice._id || response.body.result.invoice 
        : response.body.result.invoice;
      expect(invoiceId.toString()).toBe(invoice._id.toString());
      expect(response.body.result.amount).toBe(500);
      
      // Verify invoice credit was updated
      const Invoice = mongoose.model('Invoice');
      const updatedInvoice = await Invoice.findById(invoice._id);
      expect(updatedInvoice.credit).toBe(500);
      expect(updatedInvoice.paymentStatus).toBe('partially');
    });

    it('should update invoice payment status to paid when payment equals total', async () => {
      const paymentData = {
        invoice: invoice._id.toString(),
        client: client._id.toString(),
        number: 1,
        amount: 1000,
        date: new Date(),
        currency: 'USD',
        description: 'Full payment',
      };

      const response = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // Verify invoice payment status
      const Invoice = mongoose.model('Invoice');
      const updatedInvoice = await Invoice.findById(invoice._id);
      expect(updatedInvoice.credit).toBe(1000);
      expect(updatedInvoice.paymentStatus).toBe('paid');
    });

    it('should return 404 for missing invoice (invoice is required)', async () => {
      const response = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 500,
        })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .post('/api/payment/create')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/payment/read/:id', () => {
    let payment;

    beforeEach(async () => {
      const Payment = mongoose.model('Payment');
      payment = await createTestPayment(Payment, invoice._id, client._id, admin._id);
    });

    it('should read payment successfully', async () => {
      const response = await request(app)
        .get(`/api/payment/read/${payment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result._id).toBe(payment._id.toString());
      // Invoice is autopopulated, so it might be an object or string
      const invoiceId = typeof response.body.result.invoice === 'object' 
        ? response.body.result.invoice._id || response.body.result.invoice 
        : response.body.result.invoice;
      expect(invoiceId.toString()).toBe(invoice._id.toString());
    });

    it('should return 404 for non-existent payment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/payment/read/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/payment/update/:id', () => {
    let payment;

    beforeEach(async () => {
      const Payment = mongoose.model('Payment');
      payment = await createTestPayment(Payment, invoice._id, client._id, admin._id, {
        amount: 300,
      });
      
      // Update invoice credit
      invoice.credit = 300;
      invoice.paymentStatus = 'partially';
      await invoice.save();
    });

    it('should update payment successfully', async () => {
      const updateData = {
        amount: 600,
        description: 'Updated payment',
      };

      const response = await request(app)
        .patch(`/api/payment/update/${payment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.amount).toBe(600);
      
      // Verify invoice credit was updated
      const Invoice = mongoose.model('Invoice');
      const updatedInvoice = await Invoice.findById(invoice._id);
      expect(updatedInvoice.credit).toBe(600);
    });

    it('should return 404 for non-existent payment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/payment/update/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 600 })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/payment/delete/:id', () => {
    let payment;

    beforeEach(async () => {
      const Payment = mongoose.model('Payment');
      payment = await createTestPayment(Payment, invoice._id, client._id, admin._id, {
        amount: 500,
      });
      
      // Update invoice credit
      invoice.credit = 500;
      invoice.paymentStatus = 'partially';
      await invoice.save();
    });

    it('should soft delete payment and update invoice credit', async () => {
      const response = await request(app)
        .delete(`/api/payment/delete/${payment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.removed).toBe(true);
      
      // Verify invoice credit was updated
      const Invoice = mongoose.model('Invoice');
      const updatedInvoice = await Invoice.findById(invoice._id);
      expect(updatedInvoice.credit).toBe(0);
      expect(updatedInvoice.paymentStatus).toBe('unpaid');
    });
  });

  describe('GET /api/payment/list', () => {
    beforeEach(async () => {
      const Payment = mongoose.model('Payment');
      await createTestPayment(Payment, invoice._id, client._id, admin._id, { amount: 100 });
      await createTestPayment(Payment, invoice._id, client._id, admin._id, { amount: 200 });
    });

    it('should return paginated payment list', async () => {
      const response = await request(app)
        .get('/api/payment/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, items: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.result)).toBe(true);
    });

    it('should filter payments by invoice', async () => {
      const response = await request(app)
        .get('/api/payment/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ filter: 'invoice', equal: invoice._id.toString() })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/payment/summary', () => {
    beforeEach(async () => {
      const Payment = mongoose.model('Payment');
      await createTestPayment(Payment, invoice._id, client._id, admin._id, { amount: 100 });
      await createTestPayment(Payment, invoice._id, client._id, admin._id, { amount: 200 });
    });

    it('should return payment summary statistics', async () => {
      const response = await request(app)
        .get('/api/payment/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'month' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('count');
      expect(response.body.result).toHaveProperty('total');
    });

    it('should return payment summary for week type', async () => {
      const response = await request(app)
        .get('/api/payment/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'week' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
    });

    it('should return payment summary for year type', async () => {
      const response = await request(app)
        .get('/api/payment/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'year' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .get('/api/payment/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toBe('Invalid type');
    });

  });

  describe('GET /api/payment/summary - Empty Collection', () => {
    it('should return empty summary when no payments exist', async () => {
      // This test is in a separate describe block to avoid beforeEach creating payments
      const response = await request(app)
        .get('/api/payment/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result).toEqual({ count: 0, total: 0 });
    });
  });
});

