require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');

describe('PaymentMode - Branch Coverage Tests', () => {
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

  describe('PATCH /api/paymentmode/update/:id - Branch Coverage', () => {
    it('should update other payment mode to default when isDefault is false', async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      
      // Create first payment mode as default
      const defaultMode = await new PaymentMode({
        name: 'Default Mode',
        description: 'Default payment mode',
        enabled: true,
        isDefault: true,
      }).save();

      // Create second payment mode
      const secondMode = await new PaymentMode({
        name: 'Second Mode',
        description: 'Second payment mode',
        enabled: true,
        isDefault: false,
      }).save();

      // Update second mode to set isDefault: false (should trigger branch)
      const response = await request(app)
        .patch(`/api/paymentmode/update/${secondMode._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Second Mode',
          description: 'Updated description',
          isDefault: false,
          enabled: true,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // Verify that another enabled mode was set to default
      const updatedDefault = await PaymentMode.findById(defaultMode._id);
      expect(updatedDefault.isDefault).toBe(true);
    });

    it('should update other payment mode to default when enabled is false and isDefault is true', async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      
      // Create first payment mode as default and enabled
      const defaultMode = await new PaymentMode({
        name: 'Default Mode',
        description: 'Default payment mode',
        enabled: true,
        isDefault: true,
      }).save();

      // Create second payment mode
      const secondMode = await new PaymentMode({
        name: 'Second Mode',
        description: 'Second payment mode',
        enabled: true,
        isDefault: false,
      }).save();

      // Update default mode to disabled (should trigger branch: !enabled && isDefault)
      const response = await request(app)
        .patch(`/api/paymentmode/update/${defaultMode._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Disabled Default Mode',
          description: 'Updated description',
          isDefault: true,
          enabled: false,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // Verify that another enabled mode was set to default
      const updatedSecond = await PaymentMode.findById(secondMode._id);
      expect(updatedSecond.isDefault).toBe(true);
    });

    it('should set other payment modes to non-default when isDefault is true and enabled is true', async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      
      // Create first payment mode as default
      const firstMode = await new PaymentMode({
        name: 'First Mode',
        description: 'First payment mode',
        enabled: true,
        isDefault: true,
      }).save();

      // Create second payment mode
      const secondMode = await new PaymentMode({
        name: 'Second Mode',
        description: 'Second payment mode',
        enabled: true,
        isDefault: false,
      }).save();

      // Update second mode to default and enabled (should trigger branch: isDefault && enabled)
      const response = await request(app)
        .patch(`/api/paymentmode/update/${secondMode._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Default Mode',
          description: 'Updated description',
          isDefault: true,
          enabled: true,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // Verify that first mode is no longer default
      const updatedFirst = await PaymentMode.findById(firstMode._id);
      expect(updatedFirst.isDefault).toBe(false);
      
      // Verify that second mode is now default
      const updatedSecond = await PaymentMode.findById(secondMode._id);
      expect(updatedSecond.isDefault).toBe(true);
    });

    it('should return 422 when trying to disable the only existing payment mode', async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      
      // Create only one payment mode
      const onlyMode = await new PaymentMode({
        name: 'Only Mode',
        description: 'Only payment mode',
        enabled: true,
        isDefault: true,
      }).save();

      // Try to disable it (should trigger branch: (!enabled || !isDefault) && count <= 1)
      const response = await request(app)
        .patch(`/api/paymentmode/update/${onlyMode._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Only Mode',
          description: 'Only payment mode',
          enabled: false,
          isDefault: true,
        })
        .expect(422);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('only existing one');
    });

    it('should return 422 when trying to set isDefault to false on the only existing payment mode', async () => {
      const PaymentMode = mongoose.model('PaymentMode');
      
      // Create only one payment mode
      const onlyMode = await new PaymentMode({
        name: 'Only Mode',
        description: 'Only payment mode',
        enabled: true,
        isDefault: true,
      }).save();

      // Try to set isDefault to false (should trigger branch: (!enabled || !isDefault) && count <= 1)
      const response = await request(app)
        .patch(`/api/paymentmode/update/${onlyMode._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Only Mode',
          description: 'Only payment mode',
          enabled: true,
          isDefault: false,
        })
        .expect(422);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('only existing one');
    });
  });
});

