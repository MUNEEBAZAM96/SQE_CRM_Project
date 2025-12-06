const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestInvoices } = require('../../fixtures/invoice.fixtures');

describe('Invoice Paginated List - Branch Coverage', () => {
  let InvoiceModel;
  let ClientModel;
  let AdminModel;
  let AdminPasswordModel;
  let admin;
  let client;
  let req;
  let res;
  let invoicePaginatedList;

  beforeAll(async () => {
    const { connectDB, loadModels } = require('../../setup/db.setup');
    loadModels();
    await connectDB();
    
    InvoiceModel = mongoose.model('Invoice');
    ClientModel = mongoose.model('Client');
    AdminModel = mongoose.model('Admin');
    AdminPasswordModel = mongoose.model('AdminPassword');
    invoicePaginatedList = require('@/controllers/appControllers/invoiceController/paginatedList');
  });

  afterAll(async () => {
    const { closeDB } = require('../../setup/db.setup');
    await closeDB();
  });

  beforeEach(async () => {
    const adminResult = await createTestAdmin(AdminModel, AdminPasswordModel);
    admin = adminResult.admin;
    client = await createTestClient(ClientModel);
    await createTestInvoices(InvoiceModel, client._id, admin._id, 5);

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

    await invoicePaginatedList(req, res);

    expect(res.status).toHaveBeenCalled();
  });

  test('should handle default limit value (items not provided)', async () => {
    req.query = {
      page: 1,
    };

    await invoicePaginatedList(req, res);

    expect(res.status).toHaveBeenCalled();
  });

  test('should handle count > 0 branch (return 200)', async () => {
    req.query = {
      page: 1,
      items: 10,
    };

    await invoicePaginatedList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should handle count = 0 branch (return 203)', async () => {
    const { clearDB } = require('../../setup/db.setup');
    await clearDB(); // Clear all invoices

    req.query = {
      page: 1,
      items: 10,
    };

    await invoicePaginatedList(req, res);

    expect(res.status).toHaveBeenCalledWith(203);
  });
});

