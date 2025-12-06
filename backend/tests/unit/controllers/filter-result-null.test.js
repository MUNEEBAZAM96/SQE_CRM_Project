const mongoose = require('mongoose');
const filter = require('@/controllers/middlewaresControllers/createCRUDController/filter');
const { createTestClient } = require('../../fixtures/client.fixtures');

describe('Filter Controller - Result Null Case', () => {
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

  test('should return 200 when result is empty array (not null)', async () => {
    req.query = {
      filter: 'enabled',
      equal: true,
    };

    await filter(ClientModel, req, res);

    // Model.find() returns empty array, not null, so it goes to else branch
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: expect.any(Array),
      })
    );
  });
});

