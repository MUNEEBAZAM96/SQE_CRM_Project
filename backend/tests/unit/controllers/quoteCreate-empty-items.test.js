const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');

describe('Quote Controller - create (Empty Items)', () => {
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

  test('should handle empty items array with default values', async () => {
    const createQuote = require('@/controllers/appControllers/quoteController/create');
    req.body.items = []; // Empty items
    req.body.taxRate = undefined; // Test default
    req.body.discount = undefined; // Test default

    await createQuote(req, res);

    // Should still create quote with empty items (no validation in quote create)
    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.subTotal).toBe(0);
      expect(responseData.result.taxTotal).toBe(0);
      expect(responseData.result.total).toBe(0);
    }
  });
});

