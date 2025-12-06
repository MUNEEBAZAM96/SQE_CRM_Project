const mongoose = require('mongoose');
const update = require('@/controllers/middlewaresControllers/createCRUDController/update');
const remove = require('@/controllers/middlewaresControllers/createCRUDController/remove');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');

describe('CRUD Controller - Extended', () => {
  let ClientModel;
  let AdminModel;
  let AdminPasswordModel;
  let admin;
  let req;
  let res;

  beforeAll(async () => {
    const { connectDB, loadModels } = require('../../setup/db.setup');
    await connectDB();
    loadModels();
    
    ClientModel = mongoose.model('Client');
    AdminModel = mongoose.model('Admin');
    AdminPasswordModel = mongoose.model('AdminPassword');
  });

  afterAll(async () => {
    const { closeDB } = require('../../setup/db.setup');
    await closeDB();
  });

  beforeEach(async () => {
    const adminResult = await createTestAdmin(AdminModel, AdminPasswordModel);
    admin = adminResult.admin;

    req = {
      params: {},
      body: {},
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

  describe('update', () => {
    test('should return 404 when document to update is not found', async () => {
      req.params.id = new mongoose.Types.ObjectId();
      req.body = {
        name: 'Updated Name',
      };

      await update(ClientModel, req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No document found ',
        })
      );
    });

    test('should return 404 when document is already removed', async () => {
      const client = await new ClientModel({
        name: 'Test Client',
        email: 'test@example.com',
        removed: true,
      }).save();

      req.params.id = client._id;
      req.body = {
        name: 'Updated Name',
      };

      await update(ClientModel, req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No document found ',
        })
      );
    });
  });

  describe('remove', () => {
    test('should return 404 when document to remove is not found', async () => {
      req.params.id = new mongoose.Types.ObjectId();

      await remove(ClientModel, req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No document found ',
        })
      );
    });
  });
});

