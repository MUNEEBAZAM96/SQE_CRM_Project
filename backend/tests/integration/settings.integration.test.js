require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');

describe('Settings API Integration Tests', () => {
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

  describe('POST /api/setting/create', () => {
    it('should create setting successfully with valid data', async () => {
      const settingData = {
        settingKey: 'test_setting',
        settingValue: 'test_value',
        settingCategory: 'test',
      };

      const response = await request(app)
        .post('/api/setting/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(settingData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.settingKey).toBe('test_setting');
      expect(response.body.result.settingValue).toBe('test_value');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/setting/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          settingKey: 'test_setting',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/setting/read/:id', () => {
    let setting;

    beforeEach(async () => {
      const Setting = mongoose.model('Setting');
      setting = await new Setting({
        settingKey: 'test_setting',
        settingValue: 'test_value',
        settingCategory: 'test',
        createdBy: admin._id,
      }).save();
    });

    it('should read setting successfully', async () => {
      const response = await request(app)
        .get(`/api/setting/read/${setting._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result._id).toBe(setting._id.toString());
      expect(response.body.result.settingKey).toBe('test_setting');
    });

    it('should return 404 for non-existent setting', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/setting/read/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/setting/update/:id', () => {
    let setting;

    beforeEach(async () => {
      const Setting = mongoose.model('Setting');
      setting = await new Setting({
        settingKey: 'test_setting',
        settingValue: 'test_value',
        settingCategory: 'test',
        createdBy: admin._id,
      }).save();
    });

    it('should update setting successfully', async () => {
      const updateData = {
        settingValue: 'updated_value',
      };

      const response = await request(app)
        .patch(`/api/setting/update/${setting._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.settingValue).toBe('updated_value');
    });
  });

  describe('GET /api/setting/list', () => {
    beforeEach(async () => {
      const Setting = mongoose.model('Setting');
      await new Setting({
        settingKey: 'setting1',
        settingValue: 'value1',
        settingCategory: 'test',
        createdBy: admin._id,
      }).save();
      await new Setting({
        settingKey: 'setting2',
        settingValue: 'value2',
        settingCategory: 'test',
        createdBy: admin._id,
      }).save();
    });

    it('should return paginated settings list', async () => {
      const response = await request(app)
        .get('/api/setting/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, items: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });

  describe('GET /api/setting/listAll', () => {
    beforeEach(async () => {
      const Setting = mongoose.model('Setting');
      await new Setting({
        settingKey: 'setting1',
        settingValue: 'value1',
        settingCategory: 'test',
        createdBy: admin._id,
      }).save();
    });

    it('should return all settings', async () => {
      const response = await request(app)
        .get('/api/setting/listAll')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });

  describe('GET /api/setting/readBySettingKey/:settingKey', () => {
    beforeEach(async () => {
      const Setting = mongoose.model('Setting');
      await new Setting({
        settingKey: 'app_name',
        settingValue: 'IDURAR ERP/CRM',
        settingCategory: 'app',
        createdBy: admin._id,
      }).save();
    });

    it('should read setting by key successfully', async () => {
      const response = await request(app)
        .get('/api/setting/readBySettingKey/app_name')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.settingKey).toBe('app_name');
    });

    it('should return 404 for non-existent setting key', async () => {
      const response = await request(app)
        .get('/api/setting/readBySettingKey/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/setting/listBySettingKey', () => {
    beforeEach(async () => {
      const Setting = mongoose.model('Setting');
      await new Setting({
        settingKey: 'currency_symbol',
        settingValue: '$',
        settingCategory: 'currency',
        createdBy: admin._id,
      }).save();
      await new Setting({
        settingKey: 'currency_position',
        settingValue: 'before',
        settingCategory: 'currency',
        createdBy: admin._id,
      }).save();
    });

    it('should list settings by keys successfully', async () => {
      const response = await request(app)
        .get('/api/setting/listBySettingKey')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ settingKeyArray: 'currency_symbol,currency_position' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
      expect(response.body.result.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/setting/updateBySettingKey/:settingKey', () => {
    beforeEach(async () => {
      const Setting = mongoose.model('Setting');
      await new Setting({
        settingKey: 'app_name',
        settingValue: 'IDURAR ERP/CRM',
        settingCategory: 'app',
        createdBy: admin._id,
      }).save();
    });

    it('should update setting by key successfully', async () => {
      const updateData = {
        settingValue: 'Updated App Name',
      };

      const response = await request(app)
        .patch('/api/setting/updateBySettingKey/app_name')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.settingValue).toBe('Updated App Name');
    });

    it('should return 404 for non-existent setting key', async () => {
      const response = await request(app)
        .patch('/api/setting/updateBySettingKey/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ settingValue: 'value' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/setting/search', () => {
    beforeEach(async () => {
      const Setting = mongoose.model('Setting');
      await new Setting({
        settingKey: 'test_setting',
        settingValue: 'test value for search',
        settingCategory: 'test',
        createdBy: admin._id,
      }).save();
    });

    it('should search settings successfully', async () => {
      const response = await request(app)
        .get('/api/setting/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: 'test' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });
});

