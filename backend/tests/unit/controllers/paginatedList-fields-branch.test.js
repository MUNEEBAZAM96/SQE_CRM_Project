const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestInvoices } = require('../../fixtures/invoice.fixtures');

describe('Paginated List - Fields Branch Coverage', () => {
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
    loadModels(); // Load models first
    await connectDB();
    
    InvoiceModel = mongoose.model('Invoice');
    ClientModel = mongoose.model('Client');
    AdminModel = mongoose.model('Admin');
    AdminPasswordModel = mongoose.model('AdminPassword');
    // Require controller after models are loaded
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

  test('should handle when fields array is empty (fields = {})', async () => {
    req.query = {
      page: 1,
      items: 10,
      // No fields query param - fieldsArray will be empty
    };

    await invoicePaginatedList(req, res);

    expect(res.status).toHaveBeenCalled();
    // When fieldsArray is empty, fields should be {}
  });

  test('should handle when fields array has values (fields = { $or: [] })', async () => {
    req.query = {
      page: 1,
      items: 10,
      q: 'test',
      fields: 'notes,status', // Multiple fields
    };

    await invoicePaginatedList(req, res);

    expect(res.status).toHaveBeenCalled();
    // When fieldsArray has values, fields should be { $or: [...] }
  });
});

