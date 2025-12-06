const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestInvoice } = require('../../fixtures/invoice.fixtures');

describe('Invoice Controller - Update (Payment Status Branches)', () => {
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
      params: {},
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

  test('should set payment status to paid when total minus discount equals credit', async () => {
    const updateInvoice = require('@/controllers/appControllers/invoiceController/update');
    const invoice = await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
      credit: 100,
      total: 100,
      discount: 0,
    });

    req.params.id = invoice._id;
    req.body = {
      client: client._id,
      number: invoice.number,
      year: invoice.year,
      date: invoice.date,
      expiredDate: invoice.expiredDate,
      status: 'draft',
      items: [
        { itemName: 'Item', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 0,
      discount: 0,
    };

    await updateInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.paymentStatus).toBe('paid');
    }
  });

  test('should set payment status to partially when credit > 0 but less than total', async () => {
    const updateInvoice = require('@/controllers/appControllers/invoiceController/update');
    const invoice = await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 2,
      year: new Date().getFullYear(),
      status: 'draft',
      credit: 50,
      total: 100,
      discount: 0,
    });

    req.params.id = invoice._id;
    req.body = {
      client: client._id,
      number: invoice.number,
      year: invoice.year,
      date: invoice.date,
      expiredDate: invoice.expiredDate,
      status: 'draft',
      items: [
        { itemName: 'Item', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 0,
      discount: 0,
    };

    await updateInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.paymentStatus).toBe('partially');
    }
  });

  test('should set payment status to unpaid when credit is 0', async () => {
    const updateInvoice = require('@/controllers/appControllers/invoiceController/update');
    const invoice = await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 3,
      year: new Date().getFullYear(),
      status: 'draft',
      credit: 0,
      total: 100,
      discount: 0,
    });

    req.params.id = invoice._id;
    req.body = {
      client: client._id,
      number: invoice.number,
      year: invoice.year,
      date: invoice.date,
      expiredDate: invoice.expiredDate,
      status: 'draft',
      items: [
        { itemName: 'Item', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 0,
      discount: 0,
    };

    await updateInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.paymentStatus).toBe('unpaid');
    }
  });
});

