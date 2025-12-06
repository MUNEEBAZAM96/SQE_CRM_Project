const mongoose = require('mongoose');
const search = require('@/controllers/middlewaresControllers/createCRUDController/search');
const { createTestClient, createTestClients } = require('../../fixtures/client.fixtures');

describe('Search Controller', () => {
  let ClientModel;
  let req;
  let res;

  beforeAll(async () => {
    const { connectDB, loadModels } = require('../../setup/db.setup');
    await connectDB();
    loadModels();
    ClientModel = mongoose.model('Client');
  });

  afterAll(async () => {
    const { closeDB } = require('../../setup/db.setup');
    await closeDB();
  });

  beforeEach(() => {
    req = {
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
  });

  afterEach(async () => {
    const { clearDB } = require('../../setup/db.setup');
    await clearDB();
  });

  test('should search by default field (name)', async () => {
    await createTestClient(ClientModel, { name: 'Test Client Search' });

    req.query = { q: 'Test Client' };

    await search(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: expect.any(Array),
      })
    );

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.length).toBeGreaterThan(0);
  });

  test('should search by multiple fields', async () => {
    await createTestClient(ClientModel, {
      name: 'Test Client',
      email: 'test@example.com',
    });

    req.query = {
      q: 'test@example.com',
      fields: 'name,email',
    };

    await search(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.length).toBeGreaterThan(0);
  });

  test('should return empty array when no matches', async () => {
    await createTestClients(ClientModel, 3);

    req.query = { q: 'NonExistentTerm12345' };

    await search(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        result: [],
        message: 'No document found by this request',
      })
    );
  });

  test('should be case-insensitive', async () => {
    await createTestClient(ClientModel, { name: 'Test Client' });

    req.query = { q: 'TEST CLIENT' };

    await search(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.length).toBeGreaterThan(0);
  });

  test('should limit results to 20', async () => {
    await createTestClients(ClientModel, 25);

    req.query = { q: 'Test Client' };

    await search(ClientModel, req, res);

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.length).toBeLessThanOrEqual(20);
  });

  test('should exclude removed documents', async () => {
    const client = await createTestClient(ClientModel, { name: 'Removed Client' });
    client.removed = true;
    await client.save();

    req.query = { q: 'Removed Client' };

    await search(ClientModel, req, res);

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.length).toBe(0);
  });
});

