require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');

describe('Taxes - Branch Coverage Tests', () => {
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

  describe('PATCH /api/taxes/update/:id - Branch Coverage', () => {
    it('should update other tax to default when isDefault is false', async () => {
      const Taxes = mongoose.model('Taxes');
      
      // Create first tax as default
      const defaultTax = await new Taxes({
        taxName: 'Default Tax',
        taxValue: 10,
        enabled: true,
        isDefault: true,
      }).save();

      // Create second tax
      const secondTax = await new Taxes({
        taxName: 'Second Tax',
        taxValue: 15,
        enabled: true,
        isDefault: false,
      }).save();

      // Update second tax to set isDefault: false (should trigger branch)
      const response = await request(app)
        .patch(`/api/taxes/update/${secondTax._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taxName: 'Updated Second Tax',
          taxValue: 15,
          isDefault: false,
          enabled: true,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // Verify that another enabled tax was set to default
      const updatedDefault = await Taxes.findById(defaultTax._id);
      expect(updatedDefault.isDefault).toBe(true);
    });

    it('should update other tax to default when enabled is false and isDefault is true', async () => {
      const Taxes = mongoose.model('Taxes');
      
      // Create first tax as default and enabled
      const defaultTax = await new Taxes({
        taxName: 'Default Tax',
        taxValue: 10,
        enabled: true,
        isDefault: true,
      }).save();

      // Create second tax
      const secondTax = await new Taxes({
        taxName: 'Second Tax',
        taxValue: 15,
        enabled: true,
        isDefault: false,
      }).save();

      // Update default tax to disabled (should trigger branch: !enabled && isDefault)
      // Note: We need to provide all required fields or they won't be preserved
      const response = await request(app)
        .patch(`/api/taxes/update/${defaultTax._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taxName: defaultTax.taxName, // Preserve existing
          taxValue: defaultTax.taxValue, // Preserve existing
          isDefault: true,
          enabled: false,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // Verify that another enabled tax was set to default
      const updatedSecond = await Taxes.findById(secondTax._id);
      expect(updatedSecond.isDefault).toBe(true);
    });

    it('should set other taxes to non-default when isDefault is true and enabled is true', async () => {
      const Taxes = mongoose.model('Taxes');
      
      // Create first tax as default
      const firstTax = await new Taxes({
        taxName: 'First Tax',
        taxValue: 10,
        enabled: true,
        isDefault: true,
      }).save();

      // Create second tax
      const secondTax = await new Taxes({
        taxName: 'Second Tax',
        taxValue: 15,
        enabled: true,
        isDefault: false,
      }).save();

      // Update second tax to default and enabled (should trigger branch: isDefault && enabled)
      const response = await request(app)
        .patch(`/api/taxes/update/${secondTax._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taxName: 'New Default Tax',
          taxValue: 15,
          isDefault: true,
          enabled: true,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // Verify that first tax is no longer default
      const updatedFirst = await Taxes.findById(firstTax._id);
      expect(updatedFirst.isDefault).toBe(false);
      
      // Verify that second tax is now default
      const updatedSecond = await Taxes.findById(secondTax._id);
      expect(updatedSecond.isDefault).toBe(true);
    });

    it('should return 422 when trying to disable the only existing tax', async () => {
      const Taxes = mongoose.model('Taxes');
      
      // Create only one tax
      const onlyTax = await new Taxes({
        taxName: 'Only Tax',
        taxValue: 10,
        enabled: true,
        isDefault: true,
      }).save();

      // Try to disable it (should trigger branch: (!enabled || !isDefault) && count <= 1)
      const response = await request(app)
        .patch(`/api/taxes/update/${onlyTax._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taxName: 'Only Tax',
          taxValue: 10,
          enabled: false,
          isDefault: true,
        })
        .expect(422);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('only existing one');
    });

    it('should return 422 when trying to set isDefault to false on the only existing tax', async () => {
      const Taxes = mongoose.model('Taxes');
      
      // Create only one tax
      const onlyTax = await new Taxes({
        taxName: 'Only Tax',
        taxValue: 10,
        enabled: true,
        isDefault: true,
      }).save();

      // Try to set isDefault to false (should trigger branch: (!enabled || !isDefault) && count <= 1)
      const response = await request(app)
        .patch(`/api/taxes/update/${onlyTax._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taxName: 'Only Tax',
          taxValue: 10,
          enabled: true,
          isDefault: false,
        })
        .expect(422);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('only existing one');
    });
  });
});

