require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');
const { createTestInvoice } = require('../fixtures/invoice.fixtures');

describe('Invoice Update - Branch Coverage Tests', () => {
  let app;
  let admin;
  let authToken;
  let client;
  let invoice;

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
  });

  describe('PATCH /api/invoice/update/:id - Payment Status Branches', () => {
    it('should set payment status to paid when total equals credit', async () => {
      // Update invoice to have credit equal to total
      const Invoice = mongoose.model('Invoice');
      await Invoice.findByIdAndUpdate(invoice._id, { credit: 1000 });

      const updateData = {
        number: 1,
        year: new Date().getFullYear(),
        date: new Date().toISOString(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        client: client._id.toString(),
        items: [{ itemName: 'Test', quantity: 1, price: 1000, total: 1000 }],
        taxRate: 0,
        discount: 0,
        currency: 'USD',
        status: 'draft',
      };

      const response = await request(app)
        .patch(`/api/invoice/update/${invoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.paymentStatus).toBe('paid');
    });

    it('should set payment status to partially when credit > 0 but less than total', async () => {
      // Update invoice to have partial credit
      const Invoice = mongoose.model('Invoice');
      await Invoice.findByIdAndUpdate(invoice._id, { credit: 500 });

      const updateData = {
        number: 1,
        year: new Date().getFullYear(),
        date: new Date().toISOString(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        client: client._id.toString(),
        items: [{ itemName: 'Test', quantity: 1, price: 1000, total: 1000 }],
        taxRate: 0,
        discount: 0,
        currency: 'USD',
        status: 'draft',
      };

      const response = await request(app)
        .patch(`/api/invoice/update/${invoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.paymentStatus).toBe('partially');
    });

    it('should set payment status to unpaid when credit is 0', async () => {
      const updateData = {
        number: 1,
        year: new Date().getFullYear(),
        date: new Date().toISOString(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        client: client._id.toString(),
        items: [{ itemName: 'Test', quantity: 1, price: 1000, total: 1000 }],
        taxRate: 0,
        discount: 0,
        currency: 'USD',
        status: 'draft',
      };

      const response = await request(app)
        .patch(`/api/invoice/update/${invoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.paymentStatus).toBe('unpaid');
    });

    it('should handle currency field removal when present in body', async () => {
      const updateData = {
        number: 1,
        year: new Date().getFullYear(),
        date: new Date().toISOString(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        client: client._id.toString(),
        items: [{ itemName: 'Test', quantity: 1, price: 1000, total: 1000 }],
        taxRate: 0,
        discount: 0,
        currency: 'EUR', // This should be removed
        status: 'draft',
      };

      const response = await request(app)
        .patch(`/api/invoice/update/${invoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // Currency should not be in the result
      expect(response.body.result.currency).not.toBe('EUR');
    });
  });
});

