const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestInvoice } = require('../../fixtures/invoice.fixtures');

describe('Invoice Summary - Status Branch Coverage', () => {
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

  test('should handle status not found branch (if (!found))', async () => {
    // Create invoices with specific statuses
    await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
    });

    await invoiceSummary(req, res);

    // The statuses array includes 'draft', 'pending', 'overdue', 'paid', 'unpaid', 'partially'
    // Some of these may not be found in the results
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should handle status found branch (if (found))', async () => {
    // Create invoices with all statuses
    await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
    });
    await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 2,
      year: new Date().getFullYear(),
      status: 'sent',
      paymentStatus: 'paid',
    });
    await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 3,
      year: new Date().getFullYear(),
      status: 'sent',
      paymentStatus: 'unpaid',
    });

    await invoiceSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.result.performance).toBeInstanceOf(Array);
  });

  test('should handle totalInvoices when totalInvoice array is empty (line 129)', async () => {
    // Create and remove all invoices to get empty totalInvoice array
    const invoice = await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
    });
    await InvoiceModel.findByIdAndUpdate(invoice._id, { removed: true });

    await invoiceSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

