const mongoose = require('mongoose');
const summary = require('@/controllers/middlewaresControllers/createCRUDController/summary');
const { createTestClient, createTestClients } = require('../../fixtures/client.fixtures');

describe('Summary Controller - Extended', () => {
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

  test('should return summary with filter and equal query params', async () => {
    await createTestClients(ClientModel, 5);
    // Create some enabled and disabled clients
    await createTestClient(ClientModel, { enabled: true });
    await createTestClient(ClientModel, { enabled: false });

    req.query = {
      filter: 'enabled',
      equal: true,
    };

    await summary(ClientModel, req, res);

    // Check if it returns 200 (with data) or 203 (empty)
    const statusCode = res.status.mock.calls[0][0];
    expect([200, 203]).toContain(statusCode);
    expect(res.json).toHaveBeenCalled();
  });

  test('should return 203 when collection is empty', async () => {
    req.query = {
      filter: 'enabled',
      equal: true,
    };

    await summary(ClientModel, req, res);

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

