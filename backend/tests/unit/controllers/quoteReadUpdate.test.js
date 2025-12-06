const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestQuote } = require('../../fixtures/quote.fixtures');

describe('Quote Controller - Read, Update', () => {
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

  test('should read quote by ID', async () => {
    const readQuote = require('@/controllers/appControllers/quoteController/read');
    const quote = await createTestQuote(QuoteModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
    });

    req.params.id = quote._id;
    await readQuote(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result._id.toString()).toBe(quote._id.toString());
  });

  test('should update quote', async () => {
    const updateQuote = require('@/controllers/appControllers/quoteController/update');
    const quote = await createTestQuote(QuoteModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
    });

    req.params.id = quote._id;
    req.body = {
      items: [
        {
          itemName: 'Updated Product',
          quantity: 1,
          price: 150.00,
        },
      ],
      taxRate: 10,
      status: 'sent',
      notes: 'Updated quote notes',
    };

    await updateQuote(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.status).toBe('sent');
    expect(responseData.result.notes).toBe('Updated quote notes');
  });

  test('should return 400 for empty items', async () => {
    const updateQuote = require('@/controllers/appControllers/quoteController/update');
    const quote = await createTestQuote(QuoteModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
    });

    req.params.id = quote._id;
    req.body = {
      items: [],
      taxRate: 0,
    };

    await updateQuote(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Items cannot be empty',
      })
    );
  });
});

