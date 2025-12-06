const mongoose = require('mongoose');
const listAll = require('@/controllers/middlewaresControllers/createCRUDController/listAll');
const { createTestClients } = require('../../fixtures/client.fixtures');

describe('List All Controller', () => {
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

  test('should return all documents', async () => {
    await createTestClients(ClientModel, 10);

    await listAll(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result).toHaveLength(10);
  });

});

