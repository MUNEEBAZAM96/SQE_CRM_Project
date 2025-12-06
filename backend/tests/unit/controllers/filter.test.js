const mongoose = require('mongoose');
const filter = require('@/controllers/middlewaresControllers/createCRUDController/filter');
const { createTestClient, createTestClients } = require('../../fixtures/client.fixtures');

describe('Filter Controller', () => {
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

  test('should filter documents by field', async () => {
    await createTestClient(ClientModel, { name: 'Enabled Client', enabled: true });
    await createTestClient(ClientModel, { name: 'Disabled Client', enabled: false });

    req.query = {
      filter: 'enabled',
      equal: true,
    };

    await filter(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.length).toBeGreaterThan(0);
    responseData.result.forEach((client) => {
      expect(client.enabled).toBe(true);
    });
  });
});

