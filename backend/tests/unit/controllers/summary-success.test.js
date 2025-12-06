const mongoose = require('mongoose');
const summary = require('@/controllers/middlewaresControllers/createCRUDController/summary');
const { createTestClients } = require('../../fixtures/client.fixtures');

describe('Summary Controller - Success Case', () => {
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
      query: {
        filter: 'enabled',
        equal: true,
      },
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

  test('should return 203 when countAllDocs is a number (not array)', async () => {
    // countAllDocs from countDocuments is a number, not an array
    // So countAllDocs.length will be undefined, and the condition will be false
    await summary(ClientModel, req, res);

    // Since countAllDocs is a number, countAllDocs.length is undefined, so it goes to else
    expect(res.status).toHaveBeenCalledWith(203);
  });
});

