const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestQuote } = require('../../fixtures/quote.fixtures');

describe('Quote Controller - Update (Currency Branch)', () => {
  let QuoteModel;
  let ClientModel;
  let AdminModel;
  let AdminPasswordModel;
  let admin;
  let client;
  let quote;
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
    quote = await createTestQuote(QuoteModel, client._id, admin._id);

    req = {
      params: { id: quote._id },
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

  test('should delete currency field when it exists in body', async () => {
    const updateQuote = require('@/controllers/appControllers/quoteController/update');
    req.body = {
      client: client._id,
      number: quote.number,
      year: quote.year,
      date: quote.date,
      expiredDate: quote.expiredDate,
      items: [
        { itemName: 'Item', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 0,
      discount: 0,
      currency: 'EUR', // This should be deleted
    };

    await updateQuote(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(req.body.currency).toBeUndefined();
  });

  test('should not delete currency when it does not exist in body', async () => {
    const updateQuote = require('@/controllers/appControllers/quoteController/update');
    req.body = {
      client: client._id,
      number: quote.number,
      year: quote.year,
      date: quote.date,
      expiredDate: quote.expiredDate,
      items: [
        { itemName: 'Item', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 0,
      discount: 0,
      // No currency field
    };

    await updateQuote(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(req.body.currency).toBeUndefined();
  });
});

