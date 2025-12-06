const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestInvoices } = require('../../fixtures/invoice.fixtures');

describe('Invoice Summary Controller', () => {
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

  test('should return invoice summary statistics', async () => {
    const invoiceSummary = require('@/controllers/appControllers/invoiceController/summary');
    await createTestInvoices(InvoiceModel, client._id, admin._id, 5);

    await invoiceSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: expect.objectContaining({
          total: expect.any(Number),
          performance: expect.any(Array),
        }),
      })
    );
  });

  test('should return summary with type filter', async () => {
    const invoiceSummary = require('@/controllers/appControllers/invoiceController/summary');
    await createTestInvoices(InvoiceModel, client._id, admin._id, 3);

    req.query = { type: 'month' };
    await invoiceSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });

  test('should return 400 for invalid type', async () => {
    const invoiceSummary = require('@/controllers/appControllers/invoiceController/summary');
    req.query = { type: 'invalid' };
    await invoiceSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid type',
      })
    );
  });
});

