require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient, createTestClients } = require('../fixtures/client.fixtures');

describe('Client API Integration Tests', () => {
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

  describe('POST /api/client/create', () => {
    it('should create client successfully with valid data', async () => {
      const clientData = {
        name: 'Test Client',
        email: 'client@example.com',
        phone: '+1234567890',
        address: '123 Test St, Test City, Test State, 12345, USA',
        country: 'USA',
        enabled: true,
      };

      const response = await request(app)
        .post('/api/client/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(clientData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('_id');
      expect(response.body.result.name).toBe('Test Client');
      expect(response.body.result.email).toBe('client@example.com');
      // createdBy might be autopopulated as an object or a string
      if (response.body.result.createdBy) {
        const createdById = typeof response.body.result.createdBy === 'object' 
          ? response.body.result.createdBy._id || response.body.result.createdBy 
          : response.body.result.createdBy;
        expect(createdById.toString()).toBe(admin._id.toString());
      }
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/client/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields - name is required but let's test with empty object
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 for missing authentication token', async () => {
      const response = await request(app)
        .post('/api/client/create')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/client/read/:id', () => {
    let client;

    beforeEach(async () => {
      const Client = mongoose.model('Client');
      client = await createTestClient(Client, { createdBy: admin._id });
    });

    it('should read client successfully', async () => {
      const response = await request(app)
        .get(`/api/client/read/${client._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result._id).toBe(client._id.toString());
      expect(response.body.result.name).toBe(client.name);
    });

    it('should return 404 for non-existent client', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/client/read/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/client/update/:id', () => {
    let client;

    beforeEach(async () => {
      const Client = mongoose.model('Client');
      client = await createTestClient(Client, { createdBy: admin._id });
    });

    it('should update client successfully', async () => {
      const updateData = {
        name: 'Updated Client Name',
        email: 'updated@example.com',
        phone: '+9876543210',
      };

      const response = await request(app)
        .patch(`/api/client/update/${client._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.name).toBe('Updated Client Name');
      expect(response.body.result.email).toBe('updated@example.com');
    });

    it('should return 404 for non-existent client', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/client/update/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/client/delete/:id', () => {
    let client;

    beforeEach(async () => {
      const Client = mongoose.model('Client');
      client = await createTestClient(Client, { createdBy: admin._id });
    });

    it('should soft delete client successfully', async () => {
      const response = await request(app)
        .delete(`/api/client/delete/${client._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result.removed).toBe(true);

      // Verify client is soft deleted
      const Client = mongoose.model('Client');
      const deletedClient = await Client.findById(client._id);
      expect(deletedClient.removed).toBe(true);
    });
  });

  describe('GET /api/client/list', () => {
    beforeEach(async () => {
      const Client = mongoose.model('Client');
      await createTestClients(Client, 5);
    });

    it('should return paginated client list', async () => {
      const response = await request(app)
        .get('/api/client/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, items: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.result)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(parseInt(response.body.pagination.page)).toBe(1);
    });

    it('should filter clients by enabled status', async () => {
      const response = await request(app)
        .get('/api/client/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ filter: 'enabled', equal: 'true' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should search clients by name', async () => {
      const response = await request(app)
        .get('/api/client/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: 'Client', fields: 'name' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/client/listAll', () => {
    beforeEach(async () => {
      const Client = mongoose.model('Client');
      await createTestClients(Client, 5);
    });

    it('should return all clients', async () => {
      const response = await request(app)
        .get('/api/client/listAll')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
    });

    it('should filter clients by enabled status', async () => {
      const response = await request(app)
        .get('/api/client/listAll')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ enabled: 'true' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/client/search', () => {
    beforeEach(async () => {
      const Client = mongoose.model('Client');
      await createTestClient(Client, {
        name: 'Special Client for Testing',
        createdBy: admin._id,
      });
    });

    it('should search clients by name', async () => {
      const response = await request(app)
        .get('/api/client/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: 'Special' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });

  describe('GET /api/client/summary', () => {
    beforeEach(async () => {
      const Client = mongoose.model('Client');
      await createTestClients(Client, 5);
    });

    it('should return client summary statistics', async () => {
      const response = await request(app)
        .get('/api/client/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'month' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('new');
      expect(response.body.result).toHaveProperty('active');
    });
  });
});

