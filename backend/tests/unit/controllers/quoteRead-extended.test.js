const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestQuote } = require('../../fixtures/quote.fixtures');

describe('Quote Controller - Read (Extended)', () => {
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

  test('should return 404 when quote is not found', async () => {
    const readQuote = require('@/controllers/appControllers/quoteController/read');
    req.params.id = new mongoose.Types.ObjectId();

    await readQuote(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'No document found ',
      })
    );
  });

  test('should return 404 when quote is removed', async () => {
    const readQuote = require('@/controllers/appControllers/quoteController/read');
    const quote = await createTestQuote(QuoteModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
      removed: true,
    });

    req.params.id = quote._id;

    await readQuote(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'No document found ',
      })
    );
  });
});

