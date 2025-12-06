const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const create = require('@/controllers/middlewaresControllers/createCRUDController/create');
const read = require('@/controllers/middlewaresControllers/createCRUDController/read');
const update = require('@/controllers/middlewaresControllers/createCRUDController/update');
const remove = require('@/controllers/middlewaresControllers/createCRUDController/remove');

describe('CRUD Controller', () => {
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
      body: {},
      params: {},
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

  describe('create', () => {
    test('should create a new document', async () => {
      req.body = {
        name: 'Test Client',
        email: 'test@example.com',
      };

      await create(ClientModel, req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Successfully Created the document in Model ',
        })
      );

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.name).toBe('Test Client');
      expect(responseData.result.removed).toBe(false);
    });
  });

  describe('read', () => {
    test('should read an existing document', async () => {
      const client = await new ClientModel({
        name: 'Test Client',
        email: 'test@example.com',
      }).save();

      req.params.id = client._id;

      await read(ClientModel, req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result._id.toString()).toBe(client._id.toString());
    });

    test('should return 404 for non-existent document', async () => {
      req.params.id = new mongoose.Types.ObjectId();

      await read(ClientModel, req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('update', () => {
    test('should update an existing document', async () => {
      const client = await new ClientModel({
        name: 'Test Client',
        email: 'test@example.com',
      }).save();

      req.params.id = client._id;
      req.body = { name: 'Updated Client' };

      await update(ClientModel, req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.name).toBe('Updated Client');
    });
  });

  describe('remove', () => {
    test('should delete an existing document', async () => {
      const client = await new ClientModel({
        name: 'Test Client',
        email: 'test@example.com',
      }).save();

      req.params.id = client._id;

      await remove(ClientModel, req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      
      // Verify document is soft deleted (removed = true)
      const deletedClient = await ClientModel.findById(client._id);
      expect(deletedClient.removed).toBe(true);
    });
  });

  describe('createCRUDController factory', () => {
    test('should create CRUD methods for valid model', () => {
      const crud = createCRUDController('Client');
      
      expect(crud).toHaveProperty('create');
      expect(crud).toHaveProperty('read');
      expect(crud).toHaveProperty('update');
      expect(crud).toHaveProperty('delete');
      expect(crud).toHaveProperty('list');
      expect(crud).toHaveProperty('listAll');
      expect(crud).toHaveProperty('search');
      expect(crud).toHaveProperty('filter');
      expect(crud).toHaveProperty('summary');
    });

    test('should throw error for invalid model', () => {
      expect(() => createCRUDController('InvalidModel')).toThrow();
    });
  });
});

