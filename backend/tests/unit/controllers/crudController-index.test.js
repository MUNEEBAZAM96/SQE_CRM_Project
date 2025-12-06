const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

describe('CRUD Controller - Index (Factory)', () => {
  beforeAll(async () => {
    const { connectDB, loadModels } = require('../../setup/db.setup');
    await connectDB();
    loadModels();
  });

  afterAll(async () => {
    const { closeDB } = require('../../setup/db.setup');
    await closeDB();
  });

  test('should create CRUD methods for valid model', () => {
    const methods = createCRUDController('Client');
    
    expect(methods).toBeDefined();
    expect(methods.create).toBeDefined();
    expect(methods.read).toBeDefined();
    expect(methods.update).toBeDefined();
    expect(methods.delete).toBeDefined();
    expect(methods.list).toBeDefined();
    expect(methods.listAll).toBeDefined();
    expect(methods.search).toBeDefined();
    expect(methods.filter).toBeDefined();
    expect(methods.summary).toBeDefined();
  });

  test('should throw error for invalid model', () => {
    expect(() => {
      createCRUDController('NonExistentModel');
    }).toThrow('Model NonExistentModel does not exist');
  });

  test('should return methods that are functions', () => {
    const methods = createCRUDController('Invoice');
    
    expect(typeof methods.create).toBe('function');
    expect(typeof methods.read).toBe('function');
    expect(typeof methods.update).toBe('function');
    expect(typeof methods.delete).toBe('function');
    expect(typeof methods.list).toBe('function');
    expect(typeof methods.listAll).toBe('function');
    expect(typeof methods.search).toBe('function');
    expect(typeof methods.filter).toBe('function');
    expect(typeof methods.summary).toBe('function');
  });
});

