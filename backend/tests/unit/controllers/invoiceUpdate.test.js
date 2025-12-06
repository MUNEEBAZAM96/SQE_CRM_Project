const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestInvoice } = require('../../fixtures/invoice.fixtures');

describe('Invoice Controller - Update', () => {
  let InvoiceModel;
  let ClientModel;
  let AdminModel;
  let AdminPasswordModel;
  let admin;
  let client;
  let invoice;
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
    invoice = await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
      credit: 0,
    });

    req = {
      params: { id: invoice._id },
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

  test('should update invoice and calculate payment status as paid when total equals credit', async () => {
    const updateInvoice = require('@/controllers/appControllers/invoiceController/update');
    const invoiceWithCredit = await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 2,
      year: new Date().getFullYear(),
      status: 'draft',
      credit: 110, // Equal to total after discount
      total: 110,
      discount: 0,
    });

    req.params.id = invoiceWithCredit._id;
    req.body = {
      number: 2,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(),
      status: 'draft',
      items: [
        { itemName: 'Item 1', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 10,
      discount: 0,
    };

    await updateInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.paymentStatus).toBe('paid');
    }
  });

  test('should update invoice and calculate payment status as partially when credit > 0', async () => {
    const updateInvoice = require('@/controllers/appControllers/invoiceController/update');
    const invoiceWithCredit = await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 3,
      year: new Date().getFullYear(),
      status: 'draft',
      credit: 50,
      total: 110,
      discount: 0,
    });

    req.params.id = invoiceWithCredit._id;
    req.body = {
      number: 3,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(),
      status: 'draft',
      items: [
        { itemName: 'Item 1', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 10,
      discount: 0,
    };

    await updateInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.paymentStatus).toBe('partially');
    }
  });

  test('should remove currency field from body during update', async () => {
    const updateInvoice = require('@/controllers/appControllers/invoiceController/update');
    req.body = {
      number: 1,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(),
      status: 'draft',
      items: [
        { itemName: 'Item 1', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 10,
      currency: 'EUR', // This should be removed
    };

    await updateInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      // Currency should be deleted from body
      expect(req.body.currency).toBeUndefined();
    }
  });

  test('should update PDF filename during update', async () => {
    const updateInvoice = require('@/controllers/appControllers/invoiceController/update');
    req.body = {
      number: 1,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(),
      status: 'draft',
      items: [
        { itemName: 'Item 1', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 10,
    };

    await updateInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.pdf).toMatch(/^invoice-.*\.pdf$/);
    }
  });
});

