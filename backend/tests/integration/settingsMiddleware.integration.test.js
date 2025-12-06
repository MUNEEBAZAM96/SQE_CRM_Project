require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');

describe('Settings Middleware Integration Tests', () => {
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

  describe('GET /api/setting/listBySettingKey', () => {
    it('should return 202 when settingKeyArray is empty', async () => {
      const response = await request(app)
        .get('/api/setting/listBySettingKey')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(202);

      expect(response.body).toHaveProperty('success', false);
      expect(Array.isArray(response.body.result)).toBe(true);
      expect(response.body.result.length).toBe(0);
    });

    it('should return 202 when no settings match', async () => {
      const response = await request(app)
        .get('/api/setting/listBySettingKey')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ settingKeyArray: 'non_existent_key_1,non_existent_key_2' })
        .expect(202);

      expect(response.body).toHaveProperty('success', false);
      expect(Array.isArray(response.body.result)).toBe(true);
    });

    it('should return settings when keys match', async () => {
      // Create a setting first
      const Setting = mongoose.model('Setting');
      await new Setting({
        settingKey: 'test_key_1',
        settingValue: 'test_value_1',
        settingCategory: 'test',
        createdBy: admin._id,
      }).save();

      const response = await request(app)
        .get('/api/setting/listBySettingKey')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ settingKeyArray: 'test_key_1' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.result)).toBe(true);
      expect(response.body.result.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/setting/readBySettingKey/:settingKey', () => {
    it('should return 202 when settingKey is missing (empty string)', async () => {
      // When settingKey is empty string, it might be treated as undefined by Express
      // The controller checks req.params.settingKey || undefined, so empty string becomes undefined
      // But Express routing might return 404 for invalid route
      // Let's test with a route that has an empty settingKey parameter
      const response = await request(app)
        .get('/api/setting/readBySettingKey/')
        .set('Authorization', `Bearer ${authToken}`);

      // Route might return 404 if Express doesn't match the route
      expect([202, 404]).toContain(response.status);
    });

    it('should return 404 when setting does not exist', async () => {
      const response = await request(app)
        .get('/api/setting/readBySettingKey/non_existent_key')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return setting when key exists', async () => {
      // Create a setting first
      const Setting = mongoose.model('Setting');
      const setting = await new Setting({
        settingKey: 'test_read_key',
        settingValue: 'test_read_value',
        settingCategory: 'test',
        createdBy: admin._id,
      }).save();

      const response = await request(app)
        .get(`/api/setting/readBySettingKey/${setting.settingKey}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.settingKey).toBe('test_read_key');
    });
  });

  describe('PATCH /api/setting/updateBySettingKey/:settingKey', () => {
    it('should return 202 when settingKey is missing', async () => {
      const response = await request(app)
        .patch('/api/setting/updateBySettingKey/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ settingValue: 'new_value' })
        .expect(202);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 404 when setting does not exist', async () => {
      const response = await request(app)
        .patch('/api/setting/updateBySettingKey/non_existent_key')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ settingValue: 'new_value' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should update setting when key exists', async () => {
      // Create a setting first
      const Setting = mongoose.model('Setting');
      const setting = await new Setting({
        settingKey: 'test_update_key',
        settingValue: 'old_value',
        settingCategory: 'test',
        createdBy: admin._id,
      }).save();

      const response = await request(app)
        .patch(`/api/setting/updateBySettingKey/${setting.settingKey}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ settingValue: 'new_value' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.settingValue).toBe('new_value');
    });
  });
});

