require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');

describe('CRUD Update - Branch Coverage Tests', () => {
  let app;
  let admin;
  let authToken;
  let client;

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
  });

  describe('PATCH /api/client/update/:id - Branch Coverage', () => {
    it('should return 404 when document is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/client/update/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toBe('No document found ');
    });

    it('should successfully update document when it exists', async () => {
      const updateData = {
        name: 'Updated Client Name',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .patch(`/api/client/update/${client._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.name).toBe('Updated Client Name');
      expect(response.body.result.email).toBe('updated@example.com');
    });

    it('should prevent removed field from being updated', async () => {
      const updateData = {
        name: 'Updated Name',
        removed: true, // This should be ignored
      };

      const response = await request(app)
        .patch(`/api/client/update/${client._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // Verify that removed field is still false
      const Client = mongoose.model('Client');
      const updatedClient = await Client.findById(client._id);
      expect(updatedClient.removed).toBe(false);
    });
  });
});

