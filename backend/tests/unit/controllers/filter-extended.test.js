const mongoose = require('mongoose');
const filter = require('@/controllers/middlewaresControllers/createCRUDController/filter');
const { createTestClient } = require('../../fixtures/client.fixtures');

describe('Filter Controller - Extended', () => {
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

  test('should return 403 when filter is not provided', async () => {
    req.query = {
      equal: 'value',
    };

    await filter(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'filter not provided correctly',
      })
    );
  });

  test('should return 403 when equal is not provided', async () => {
    req.query = {
      filter: 'enabled',
    };

    await filter(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'filter not provided correctly',
      })
    );
  });

  test('should return 403 when both filter and equal are not provided', async () => {
    req.query = {};

    await filter(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'filter not provided correctly',
      })
    );
  });
});

