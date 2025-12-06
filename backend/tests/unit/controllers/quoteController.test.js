const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');

describe('Quote Controller - create', () => {
  let QuoteModel;
  let ClientModel;
  let AdminModel;
  let AdminPasswordModel;
  let admin;
  let client;
  let req;
  let res;

  beforeAll(async () => {
    const { connectDB, loadModels } = require('../../setup/db.setup');
    await connectDB();
    loadModels();
    
    QuoteModel = mongoose.model('Quote');
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
    client = await createTestClient(ClientModel);

    req = {
      body: {
        client: client._id,
        number: 1,
        year: new Date().getFullYear(),
        date: new Date(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'draft',
        items: [
          {
            itemName: 'Test Product',
            quantity: 2,
            price: 100.00,
          },
        ],
        taxRate: 10,
        currency: 'USD',
        notes: 'Test quote',
      },
      admin: {
        _id: admin._id,
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

  test('should create quote with valid data', async () => {
    const createQuote = require('@/controllers/appControllers/quoteController/create');
    await createQuote(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Quote created successfully',
      })
    );

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result).toBeDefined();
    expect(responseData.result.client._id.toString()).toBe(client._id.toString());
    expect(responseData.result.items).toHaveLength(1);
    expect(responseData.result.subTotal).toBe(200);
    expect(responseData.result.taxTotal).toBe(20);
    expect(responseData.result.total).toBe(220);
    expect(responseData.result.pdf).toBeDefined();
  });

  test('should calculate quote totals correctly', async () => {
    const createQuote = require('@/controllers/appControllers/quoteController/create');
    req.body.items = [
      { itemName: 'Product 1', quantity: 2, price: 100 },
      { itemName: 'Product 2', quantity: 1, price: 50 },
    ];
    req.body.taxRate = 10;

    await createQuote(req, res);

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.subTotal).toBe(250);
    expect(responseData.result.taxTotal).toBe(25);
    expect(responseData.result.total).toBe(275);
  });
});

