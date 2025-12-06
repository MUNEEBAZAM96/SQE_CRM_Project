const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestQuote } = require('../../fixtures/quote.fixtures');

describe('Quote Paginated List - Branch Coverage', () => {
  let QuoteModel;
  let ClientModel;
  let AdminModel;
  let AdminPasswordModel;
  let admin;
  let client;
  let req;
  let res;
  let quotePaginatedList;

  beforeAll(async () => {
    const { connectDB, loadModels } = require('../../setup/db.setup');
    loadModels();
    await connectDB();
    
    QuoteModel = mongoose.model('Quote');
    ClientModel = mongoose.model('Client');
    AdminModel = mongoose.model('Admin');
    AdminPasswordModel = mongoose.model('AdminPassword');
    quotePaginatedList = require('@/controllers/appControllers/quoteController/paginatedList');
  });

  afterAll(async () => {
    const { closeDB } = require('../../setup/db.setup');
    await closeDB();
  });

  beforeEach(async () => {
    const adminResult = await createTestAdmin(AdminModel, AdminPasswordModel);
    admin = adminResult.admin;
    client = await createTestClient(ClientModel);
    
    // Create multiple quotes
    for (let i = 0; i < 5; i++) {
      await createTestQuote(QuoteModel, client._id, admin._id, {
        number: i + 1,
        year: new Date().getFullYear(),
      });
    }

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

  test('should handle default page value (page = 1)', async () => {
    req.query = {
      items: 10,
    };

    await quotePaginatedList(req, res);

    expect(res.status).toHaveBeenCalled();
  });

  test('should handle default limit value (items not provided)', async () => {
    req.query = {
      page: 1,
    };

    await quotePaginatedList(req, res);

    expect(res.status).toHaveBeenCalled();
  });

  test('should handle count > 0 branch (return 200)', async () => {
    req.query = {
      page: 1,
      items: 10,
    };

    await quotePaginatedList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should handle count = 0 branch (return 203)', async () => {
    const { clearDB } = require('../../setup/db.setup');
    await clearDB(); // Clear all quotes

    req.query = {
      page: 1,
      items: 10,
    };

    await quotePaginatedList(req, res);

    expect(res.status).toHaveBeenCalledWith(203);
  });
});

