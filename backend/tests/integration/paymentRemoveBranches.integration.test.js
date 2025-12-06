require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');
const { createTestInvoice } = require('../fixtures/invoice.fixtures');
const { createTestPayment } = require('../fixtures/payment.fixtures');

describe('Payment Remove - Branch Coverage Tests', () => {
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

  describe('DELETE /api/payment/delete/:id - Payment Status Branches', () => {
    it('should set payment status to paid when total - discount equals credit - amount after deletion', async () => {
      // Logic: paymentStatus = total - discount === previousCredit - previousAmount ? 'paid' : ...
      // For paid: total - discount === credit - amount (before deletion)
      // Setup: invoice total=1000, discount=0, credit=1000, payment=0 (no payment means credit stays at 1000)
      // Actually, we need: total - discount === credit - amount
      // So: 1000 - 0 === 1000 - 0 = 1000, which is true, so paid
      // But we need a payment to delete, so let's set it up differently
      // If total=1000, discount=0, credit=1000, amount=0, then 1000 === 1000, so paid
      // But we can't delete a payment of 0...
      // Let me think: total=1000, discount=0, credit=500, amount=500
      // Check: 1000 - 0 === 500 - 500 = 0? No, so not paid
      // For paid: we need total - discount === credit - amount
      // If total=1000, discount=0, amount=500, we need credit=1500
      // Then: 1000 === 1500 - 500 = 1000, so paid
      const Invoice = mongoose.model('Invoice');
      await Invoice.findByIdAndUpdate(invoice._id, { 
        credit: 500, // Reset to 500
        total: 1000,
        discount: 0
      });

      const Payment = mongoose.model('Payment');
      const testPayment = await createTestPayment(Payment, invoice._id, client._id, admin._id, {
        amount: 500,
      });
      
      // Set credit to 1500 so that after deletion (credit becomes 1000), the check is: 1000 === 1500 - 500 = 1000
      await Invoice.findByIdAndUpdate(invoice._id, { 
        $set: { credit: 1500 },
        $push: { payment: testPayment._id }
      });

      const response = await request(app)
        .delete(`/api/payment/delete/${testPayment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      const updatedInvoice = await Invoice.findById(invoice._id);
      // After deletion: credit = 1500 - 500 = 1000
      // Check was: total - discount === credit - amount
      // 1000 - 0 === 1500 - 500 = 1000, so paid
      expect(updatedInvoice.paymentStatus).toBe('paid');
      expect(updatedInvoice.credit).toBe(1000);
    });

    it('should set payment status to partially when credit - amount > 0 but < total after deletion', async () => {
      // Logic: paymentStatus = previousCredit - previousAmount > 0 ? 'partially' : 'unpaid'
      // For partially: credit - amount > 0 and credit - amount < total - discount
      // Setup: invoice total=1000, discount=0, credit=800, payment=300
      // Check: 1000 - 0 === 800 - 300 = 500? No (1000 !== 500), so not paid
      // Check: 800 - 300 = 500 > 0? Yes, so partially
      const Invoice = mongoose.model('Invoice');
      await Invoice.findByIdAndUpdate(invoice._id, { 
        credit: 500, // Reset to 500
        total: 1000,
        discount: 0
      });

      const Payment = mongoose.model('Payment');
      const testPayment = await createTestPayment(Payment, invoice._id, client._id, admin._id, {
        amount: 300,
      });
      
      // Set credit to 800 so that after deletion (credit becomes 500), the check is: 800 - 300 = 500 > 0, so partially
      await Invoice.findByIdAndUpdate(invoice._id, { 
        $set: { credit: 800 },
        $push: { payment: testPayment._id }
      });

      const response = await request(app)
        .delete(`/api/payment/delete/${testPayment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      const updatedInvoice = await Invoice.findById(invoice._id);
      // After deletion: credit = 800 - 300 = 500
      // Check was: total - discount === credit - amount? 1000 === 500? No, so not paid
      // Check was: credit - amount > 0? 500 > 0? Yes, so partially
      expect(updatedInvoice.paymentStatus).toBe('partially');
      expect(updatedInvoice.credit).toBe(500);
    });

    it('should set payment status to unpaid when credit - amount <= 0 after deletion', async () => {
      // Logic: paymentStatus = credit - amount <= 0 ? 'unpaid' : ...
      // For unpaid: credit - amount <= 0
      // Setup: invoice total=1000, discount=0, credit=500, payment=500
      // Check: 1000 - 0 === 500 - 500 = 0? No (1000 !== 0), so not paid
      // Check: 500 - 500 = 0 > 0? No, so unpaid
      const Invoice = mongoose.model('Invoice');
      await Invoice.findByIdAndUpdate(invoice._id, { 
        credit: 0, // Reset to 0
        total: 1000,
        discount: 0
      });

      const Payment = mongoose.model('Payment');
      const testPayment = await createTestPayment(Payment, invoice._id, client._id, admin._id, {
        amount: 500,
      });
      
      // Set credit to 500 so that after deletion (credit becomes 0), the check is: 500 - 500 = 0 <= 0, so unpaid
      await Invoice.findByIdAndUpdate(invoice._id, { 
        $set: { credit: 500 },
        $push: { payment: testPayment._id }
      });

      const response = await request(app)
        .delete(`/api/payment/delete/${testPayment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      const updatedInvoice = await Invoice.findById(invoice._id);
      // After deletion: credit = 500 - 500 = 0
      // Check was: total - discount === credit - amount? 1000 === 0? No, so not paid
      // Check was: credit - amount > 0? 0 > 0? No, so unpaid
      expect(updatedInvoice.paymentStatus).toBe('unpaid');
      expect(updatedInvoice.credit).toBe(0);
    });
  });
});

