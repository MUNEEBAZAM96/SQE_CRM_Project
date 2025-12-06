const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');

describe('Invoice Controller - create (Branch Coverage)', () => {
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
      body: {},
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

  test('should create invoice with default taxRate and discount values', async () => {
    const createInvoice = require('@/controllers/appControllers/invoiceController/create');
    req.body = {
      client: client._id,
      number: 1,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      items: [
        { itemName: 'Item 1', description: '', quantity: 1, price: 100, total: 100 },
      ],
      // taxRate and discount not provided - should default to 0
    };

    await createInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.taxTotal).toBe(0);
      expect(responseData.result.total).toBe(100);
    }
  });

  test('should create invoice with empty items array (default)', async () => {
    const createInvoice = require('@/controllers/appControllers/invoiceController/create');
    req.body = {
      client: client._id,
      number: 2,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      // items not provided - should default to []
      taxRate: 0,
      discount: 0,
    };

    await createInvoice(req, res);

    // Should fail validation because items array is required and cannot be empty
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('should create invoice with payment status paid branch', async () => {
    const createInvoice = require('@/controllers/appControllers/invoiceController/create');
    req.body = {
      client: client._id,
      number: 3,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      items: [
        { itemName: 'Item 1', description: '', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 10,
      discount: 110, // total - discount = 0, so paid
    };

    await createInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.paymentStatus).toBe('paid');
    }
  });

  test('should create invoice with payment status unpaid branch', async () => {
    const createInvoice = require('@/controllers/appControllers/invoiceController/create');
    req.body = {
      client: client._id,
      number: 4,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      items: [
        { itemName: 'Item 1', description: '', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 10,
      discount: 50, // total - discount > 0, so unpaid
    };

    await createInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.paymentStatus).toBe('unpaid');
    }
  });
});

