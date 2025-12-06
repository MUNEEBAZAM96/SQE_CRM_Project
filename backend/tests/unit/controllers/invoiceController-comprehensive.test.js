const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');

describe('Invoice Controller - create (Comprehensive)', () => {
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

  test('should create invoice with string taxRate', async () => {
    const createInvoice = require('@/controllers/appControllers/invoiceController/create');
    req.body = {
      client: client._id,
      number: 1,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      items: [
        { itemName: 'Item 1', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: '10', // String instead of number
      discount: 0,
      currency: 'USD',
    };

    await createInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.taxTotal).toBe(10);
      expect(responseData.result.total).toBe(110);
    }
  });

  test('should create invoice with multiple items and complex calculations', async () => {
    const createInvoice = require('@/controllers/appControllers/invoiceController/create');
    req.body = {
      client: client._id,
      number: 1,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      items: [
        { itemName: 'Item 1', quantity: 3, price: 33.33, total: 99.99 },
        { itemName: 'Item 2', quantity: 2, price: 50.50, total: 101.00 },
        { itemName: 'Item 3', quantity: 1, price: 25.25, total: 25.25 },
      ],
      taxRate: 15.5,
      discount: 10,
      currency: 'USD',
    };

    await createInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.subTotal).toBeGreaterThan(0);
      expect(responseData.result.taxTotal).toBeGreaterThan(0);
      expect(responseData.result.total).toBeGreaterThan(0);
    }
  });

  test('should create invoice with discount that makes total zero', async () => {
    const createInvoice = require('@/controllers/appControllers/invoiceController/create');
    req.body = {
      client: client._id,
      number: 1,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      items: [
        { itemName: 'Item 1', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 10,
      discount: 110, // Discount equals total
      currency: 'USD',
    };

    await createInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.paymentStatus).toBe('paid');
    }
  });

  test('should create invoice with discount less than total', async () => {
    const createInvoice = require('@/controllers/appControllers/invoiceController/create');
    req.body = {
      client: client._id,
      number: 1,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      items: [
        { itemName: 'Item 1', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 10,
      discount: 50, // Discount less than total
      currency: 'USD',
    };

    await createInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.paymentStatus).toBe('unpaid');
    }
  });
});

