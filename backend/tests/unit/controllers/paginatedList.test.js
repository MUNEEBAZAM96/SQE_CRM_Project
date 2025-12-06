const mongoose = require('mongoose');
const paginatedList = require('@/controllers/middlewaresControllers/createCRUDController/paginatedList');
const { createTestClients } = require('../../fixtures/client.fixtures');

describe('Paginated List Controller', () => {
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
    };
  });

  afterEach(async () => {
    const { clearDB } = require('../../setup/db.setup');
    await clearDB();
  });

  test('should return paginated list with default pagination', async () => {
    await createTestClients(ClientModel, 15);

    req.query = { page: 1, items: 10 };

    await paginatedList(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        pagination: expect.objectContaining({
          page: 1,
          count: 15,
        }),
      })
    );

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result).toHaveLength(10);
    expect(responseData.pagination.pages).toBe(2);
  });

  test('should return empty array when no documents', async () => {
    req.query = { page: 1, items: 10 };

    await paginatedList(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(203);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: [],
        pagination: expect.objectContaining({
          count: 0,
        }),
      })
    );
  });

  test('should handle custom page and limit', async () => {
    await createTestClients(ClientModel, 25);

    req.query = { page: 2, items: 10 };

    await paginatedList(ClientModel, req, res);

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result).toHaveLength(10);
    expect(responseData.pagination.page).toBe(2);
    expect(responseData.pagination.pages).toBe(3);
  });

  test('should sort by specified field', async () => {
    await createTestClients(ClientModel, 5);

    req.query = {
      page: 1,
      items: 10,
      sortBy: 'name',
      sortValue: 1, // ascending
    };

    await paginatedList(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.length).toBeGreaterThan(0);
  });

  test('should filter by specified field', async () => {
    const { createTestClient } = require('../../fixtures/client.fixtures');
    await createTestClient(ClientModel, { name: 'Enabled Client', enabled: true });
    await createTestClient(ClientModel, { name: 'Disabled Client', enabled: false });

    req.query = {
      page: 1,
      items: 10,
      filter: 'enabled',
      equal: true,
    };

    await paginatedList(ClientModel, req, res);

    const responseData = res.json.mock.calls[0][0];
    responseData.result.forEach((client) => {
      expect(client.enabled).toBe(true);
    });
  });

  test('should search by query fields', async () => {
    const { createTestClient } = require('../../fixtures/client.fixtures');
    await createTestClient(ClientModel, { name: 'Unique Search Term', email: 'unique@test.com' });

    req.query = {
      page: 1,
      items: 10,
      q: 'Unique',
      fields: 'name,email',
    };

    await paginatedList(ClientModel, req, res);

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.length).toBeGreaterThan(0);
  });
});

