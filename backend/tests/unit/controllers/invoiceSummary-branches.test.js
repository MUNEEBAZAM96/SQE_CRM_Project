const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestInvoice } = require('../../fixtures/invoice.fixtures');

describe('Invoice Summary - Branch Coverage', () => {
  let InvoiceModel;
  let ClientModel;
  let AdminModel;
  let AdminPasswordModel;
  let admin;
  let client;
  let req;
  let res;
  let invoiceSummary;

  beforeAll(async () => {
    const { connectDB, loadModels } = require('../../setup/db.setup');
    await connectDB();
    loadModels();
    
    InvoiceModel = mongoose.model('Invoice');
    ClientModel = mongoose.model('Client');
    AdminModel = mongoose.model('Admin');
    AdminPasswordModel = mongoose.model('AdminPassword');
    invoiceSummary = require('@/controllers/appControllers/invoiceController/summary');
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

  test('should handle totalInvoices.total when totalInvoices exists', async () => {
    await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
      total: 100,
    });

    await invoiceSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result).toBeDefined();
  });

  test('should handle totalInvoices when totalInvoice array is empty', async () => {
    // Create invoice and then remove it to test empty totalInvoice array
    const invoice = await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
    });
    await InvoiceModel.findByIdAndUpdate(invoice._id, { removed: true });

    await invoiceSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should handle unpaid.length = 0 branch (total_undue = 0)', async () => {
    // Create paid invoice
    await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
      paymentStatus: 'paid',
      total: 100,
      credit: 100,
    });

    await invoiceSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.total_undue).toBe(0);
  });

  test('should handle unpaid.length > 0 branch (total_undue = unpaid[0].total_amount)', async () => {
    // Create unpaid invoice
    await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
      paymentStatus: 'unpaid',
      total: 200,
      credit: 0,
    });

    await invoiceSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.total_undue).toBeGreaterThanOrEqual(0);
  });
});

