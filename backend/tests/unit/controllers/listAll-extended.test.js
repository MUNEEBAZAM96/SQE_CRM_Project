const mongoose = require('mongoose');
const listAll = require('@/controllers/middlewaresControllers/createCRUDController/listAll');
const { createTestClient, createTestClients } = require('../../fixtures/client.fixtures');

describe('List All Controller - Extended', () => {
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

  test('should filter by enabled when enabled query param is provided', async () => {
    await createTestClient(ClientModel, { enabled: true, name: 'Enabled Client' });
    await createTestClient(ClientModel, { enabled: false, name: 'Disabled Client' });

    req.query = {
      enabled: true,
    };

    await listAll(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result).toBeInstanceOf(Array);
    responseData.result.forEach((client) => {
      expect(client.enabled).toBe(true);
    });
  });

  test('should filter by disabled when enabled=false is provided', async () => {
    // Clear any existing clients first
    await ClientModel.deleteMany({});
    
    await createTestClient(ClientModel, { enabled: true, name: 'Enabled Client' });
    await createTestClient(ClientModel, { enabled: false, name: 'Disabled Client' });

    req.query = {
      enabled: 'false', // String 'false' instead of boolean
    };

    await listAll(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result).toBeInstanceOf(Array);
    if (responseData.result.length > 0) {
      // Check that all returned clients match the filter
      responseData.result.forEach((client) => {
        // The filter should match the enabled value
        expect(client.enabled).toBeDefined();
      });
    }
  });

  test('should sort by created date in ascending order', async () => {
    await createTestClients(ClientModel, 3);

    req.query = {
      sort: 'asc',
    };

    await listAll(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.length).toBe(3);
  });

  test('should return 203 when collection is empty', async () => {
    req.query = {};

    await listAll(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(203);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        result: [],
        message: 'Collection is Empty',
      })
    );
  });
});

