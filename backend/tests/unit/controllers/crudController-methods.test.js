const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');

describe('CRUD Controller - Methods', () => {
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
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
  });

  afterEach(async () => {
    const { clearDB } = require('../../setup/db.setup');
    await clearDB();
  });

  test('should have all CRUD methods properly assigned', () => {
    const crud = createCRUDController('Client');
    
    expect(typeof crud.create).toBe('function');
    expect(typeof crud.read).toBe('function');
    expect(typeof crud.update).toBe('function');
    expect(typeof crud.delete).toBe('function');
    expect(typeof crud.list).toBe('function');
    expect(typeof crud.listAll).toBe('function');
    expect(typeof crud.search).toBe('function');
    expect(typeof crud.filter).toBe('function');
    expect(typeof crud.summary).toBe('function');
  });

  test('should call list method correctly', async () => {
    const crud = createCRUDController('Client');
    req.query = { page: 1, items: 10 };

    await crud.list(req, res);

    expect(res.status).toHaveBeenCalled();
  });

  test('should call listAll method correctly', async () => {
    const crud = createCRUDController('Client');

    await crud.listAll(req, res);

    expect(res.status).toHaveBeenCalled();
  });

  test('should call search method correctly', async () => {
    const crud = createCRUDController('Client');
    req.query = { q: 'test', fields: 'name' };

    await crud.search(req, res);

    expect(res.status).toHaveBeenCalled();
  });

  test('should call filter method correctly', async () => {
    const crud = createCRUDController('Client');
    req.query = { filter: 'enabled', equal: true };

    await crud.filter(req, res);

    expect(res.status).toHaveBeenCalled();
  });

  test('should call summary method correctly', async () => {
    const crud = createCRUDController('Client');
    req.query = { filter: 'enabled', equal: true };

    await crud.summary(req, res);

    expect(res.status).toHaveBeenCalled();
  });
});

