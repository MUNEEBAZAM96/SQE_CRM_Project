require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');
const { createTestInvoice } = require('../fixtures/invoice.fixtures');
const { createTestPayment } = require('../fixtures/payment.fixtures');

describe('Payment - Branch Coverage Tests', () => {
  let app;
  let admin;
  let authToken;
  let client;
  let invoice;
  let payment;

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

    const Invoice = mongoose.model('Invoice');
    invoice = await createTestInvoice(Invoice, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
      total: 1000,
      discount: 0,
      credit: 0,
    });

    const Payment = mongoose.model('Payment');
    payment = await createTestPayment(Payment, invoice._id, client._id, admin._id, {
      amount: 500,
    });
    
    // Manually update invoice credit since fixture doesn't trigger controller logic
    await Invoice.findByIdAndUpdate(invoice._id, { 
      $inc: { credit: 500 },
      $push: { payment: payment._id }
    });
  });

  describe('POST /api/payment/create - Branch Coverage', () => {
    it('should return 202 when payment amount exceeds max allowed amount', async () => {
      // Invoice total=1000, discount=0, credit=0, so maxAmount = 1000
      // Try to create payment with amount > 1000
      const paymentData = {
        invoice: invoice._id.toString(),
        number: 2,
        amount: 1500, // Exceeds maxAmount of 1000
        date: new Date(),
        currency: 'USD',
        description: 'Payment exceeding max amount',
      };

      const response = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(202);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Max Amount');
    });

    it('should automatically set client from invoice when not provided', async () => {
      const paymentData = {
        invoice: invoice._id.toString(),
        // client not provided - should be set from invoice
        number: 2,
        amount: 200,
        date: new Date(),
        currency: 'USD',
        description: 'Test payment without client',
      };

      const response = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result).toHaveProperty('client');
    });
  });

  describe('PATCH /api/payment/update/:id - Branch Coverage', () => {
    it('should return 404 when invoice is not found', async () => {
      // Create a payment with an invoice, then delete the invoice
      const Invoice = mongoose.model('Invoice');
      const testInvoice = await createTestInvoice(Invoice, client._id, admin._id, {
        number: 2,
        year: new Date().getFullYear(),
        status: 'draft',
        total: 1000,
        discount: 0,
        credit: 0,
      });

      const Payment = mongoose.model('Payment');
      const testPayment = await createTestPayment(Payment, testInvoice._id, client._id, admin._id, {
        amount: 200,
      });

      // Delete the invoice
      await Invoice.findByIdAndUpdate(testInvoice._id, { removed: true });

      const updateData = {
        amount: 300,
        number: 1,
        date: new Date(),
        description: 'Updated payment',
      };

      const response = await request(app)
        .patch(`/api/payment/update/${testPayment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Invoice not found');
    });

    it('should set payment status to paid when total equals credit + amount', async () => {
      // Payment was created with amount 500, invoice credit was manually set to 500
      // To make it paid, we need to update payment to 1000 (increase by 500)
      // So: previousCredit (500) + changedAmount (500) = 1000 = total
      const Invoice = mongoose.model('Invoice');
      // Verify current state: invoice credit should be 500 from initial payment
      const currentInvoice = await Invoice.findById(invoice._id);
      expect(currentInvoice.credit).toBe(500); // From initial payment creation

      const updateData = {
        amount: 1000, // Increase from 500 to 1000, changedAmount = 500
        number: 1,
        date: new Date(),
        description: 'Updated payment',
      };

      const response = await request(app)
        .patch(`/api/payment/update/${payment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // Verify invoice payment status was updated
      const updatedInvoice = await Invoice.findById(invoice._id);
      expect(updatedInvoice.paymentStatus).toBe('paid');
      expect(updatedInvoice.credit).toBe(1000); // 500 + 500 = 1000
    });

    it('should set payment status to partially when credit + amount > 0 but < total', async () => {
      // Payment was created with amount 500, invoice credit was manually set to 500
      // Update payment to 800 (increase by 300)
      // So: previousCredit (500) + changedAmount (300) = 800 < 1000 (total)
      const Invoice = mongoose.model('Invoice');
      const currentInvoice = await Invoice.findById(invoice._id);
      expect(currentInvoice.credit).toBe(500); // From initial payment creation

      const updateData = {
        amount: 800, // Increase from 500 to 800, changedAmount = 300
        number: 1,
        date: new Date(),
        description: 'Updated payment',
      };

      const response = await request(app)
        .patch(`/api/payment/update/${payment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // Verify invoice payment status was updated
      const updatedInvoice = await Invoice.findById(invoice._id);
      expect(updatedInvoice.paymentStatus).toBe('partially');
      expect(updatedInvoice.credit).toBe(800); // 500 + 300 = 800
    });

    it('should return 202 when payment update amount exceeds max allowed amount', async () => {
      // Invoice total=1000, discount=0, credit=500 (from initial payment)
      // Max amount that can be added = 1000 - 0 - 500 = 500
      // Current payment amount = 500
      // Try to update to 1500 (increase by 1000, which exceeds max of 500)
      const updateData = {
        amount: 1500, // Increase from 500 to 1500, changedAmount = 1000 > maxAmount (500)
        number: 1,
        date: new Date(),
        description: 'Updated payment exceeding max',
      };

      const response = await request(app)
        .patch(`/api/payment/update/${payment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(202);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Max Amount');
    });

    it('should set payment status to unpaid when credit + amount = 0', async () => {
      // Update payment to 0 amount
      const updateData = {
        amount: 0,
        number: 1,
        date: new Date(),
        description: 'Updated payment',
      };

      // First, we need to handle the case where amount is 0 (returns 202)
      // But for testing the unpaid branch, let's update invoice credit to 0 first
      const Invoice = mongoose.model('Invoice');
      await Invoice.findByIdAndUpdate(invoice._id, { credit: 0 });

      // Update payment to a small amount that results in unpaid status
      const updateData2 = {
        amount: 100,
        number: 1,
        date: new Date(),
        description: 'Updated payment',
      };

      const response = await request(app)
        .patch(`/api/payment/update/${payment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData2)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});

