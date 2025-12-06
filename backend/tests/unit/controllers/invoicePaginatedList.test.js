const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestInvoices } = require('../../fixtures/invoice.fixtures');

describe('Invoice Paginated List Controller', () => {
  let InvoiceModel;
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
    
    InvoiceModel = mongoose.model('Invoice');
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

  test('should return paginated invoice list', async () => {
    const invoicePaginatedList = require('@/controllers/appControllers/invoiceController/paginatedList');
    await createTestInvoices(InvoiceModel, client._id, admin._id, 10);

    req.query = { page: 1, items: 5 };
    await invoicePaginatedList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result).toHaveLength(5);
    expect(responseData.pagination.page).toBe(1);
    expect(responseData.pagination.count).toBe(10);
  });

  test('should return empty array when no invoices', async () => {
    const invoicePaginatedList = require('@/controllers/appControllers/invoiceController/paginatedList');
    req.query = { page: 1, items: 10 };
    await invoicePaginatedList(req, res);

    expect(res.status).toHaveBeenCalledWith(203);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result).toEqual([]);
    expect(responseData.message).toBe('Collection is Empty');
  });
});

