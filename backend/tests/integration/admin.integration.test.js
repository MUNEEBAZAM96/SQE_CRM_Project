require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');

describe('Admin API Integration Tests', () => {
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

  describe('GET /api/admin/read/:id', () => {
    it('should read admin successfully', async () => {
      const response = await request(app)
        .get(`/api/admin/read/${admin._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result._id).toBe(admin._id.toString());
      expect(response.body.result.email).toBe(admin.email);
    });

    it('should return 404 for non-existent admin', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/admin/read/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .get(`/api/admin/read/${admin._id}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/admin/password-update/:id', () => {
    it('should update admin password successfully', async () => {
      const updateData = {
        password: 'newpassword123',
      };

      const response = await request(app)
        .patch(`/api/admin/password-update/${admin._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      // Verify password was updated by trying to login with new password
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: admin.email,
          password: 'newpassword123',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('success', true);
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .patch(`/api/admin/password-update/${admin._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/admin/profile/password', () => {
    it('should update profile password successfully', async () => {
      const updateData = {
        password: 'newprofilepassword123',
        passwordCheck: 'newprofilepassword123',
      };

      const response = await request(app)
        .patch('/api/admin/profile/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 400 for password mismatch', async () => {
      const updateData = {
        password: 'newpassword123',
        passwordCheck: 'differentpassword123',
      };

      const response = await request(app)
        .patch('/api/admin/profile/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      // Controller returns { msg: ... } for validation errors
      expect(response.body).toHaveProperty('msg');
      expect(response.body.msg).toContain('same password twice');
    });
  });

  describe('PATCH /api/admin/profile/update', () => {
    it('should update admin profile successfully', async () => {
      const updateData = {
        name: 'Updated Admin Name',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .patch('/api/admin/profile/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.name).toBe('Updated Admin Name');
    });

    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .patch('/api/admin/profile/update')
        .send({ name: 'Updated' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});

