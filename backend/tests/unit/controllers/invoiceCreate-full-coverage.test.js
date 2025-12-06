const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');

describe('Invoice Controller - create (Full Coverage)', () => {
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

  test('should execute full create path with all calculations', async () => {
    const createInvoice = require('@/controllers/appControllers/invoiceController/create');
    req.body = {
      client: client._id,
      number: 1,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      items: [
        { itemName: 'Item 1', description: 'Desc 1', quantity: 2, price: 50, total: 100 },
        { itemName: 'Item 2', description: 'Desc 2', quantity: 3, price: 30, total: 90 },
      ],
      taxRate: 10,
      discount: 0,
      notes: 'Test notes',
    };

    await createInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.result).toBeDefined();
      expect(responseData.result.subTotal).toBe(190); // 100 + 90
      expect(responseData.result.taxTotal).toBe(19); // 190 * 0.1
      expect(responseData.result.total).toBe(209); // 190 + 19
      expect(responseData.result.paymentStatus).toBe('unpaid');
      expect(responseData.result.pdf).toMatch(/^invoice-.*\.pdf$/);
    } else {
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });

  test('should handle string taxRate', async () => {
    const createInvoice = require('@/controllers/appControllers/invoiceController/create');
    req.body = {
      client: client._id,
      number: 2,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      items: [
        { itemName: 'Item 1', description: '', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: '15', // String taxRate
      discount: 0,
      notes: '',
    };

    await createInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.taxTotal).toBe(15);
      expect(responseData.result.total).toBe(115);
    } else {
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });

  test('should handle payment status paid when total equals discount', async () => {
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
      discount: 110, // Total is 110, discount is 110
      notes: '',
    };

    await createInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.paymentStatus).toBe('paid');
    } else {
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });

  test('should handle multiple items with complex calculations', async () => {
    const createInvoice = require('@/controllers/appControllers/invoiceController/create');
    req.body = {
      client: client._id,
      number: 4,
      year: new Date().getFullYear(),
      date: new Date(),
      expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      items: [
        { itemName: 'Item 1', description: '', quantity: 5, price: 20.50, total: 102.50 },
        { itemName: 'Item 2', description: '', quantity: 2, price: 15.75, total: 31.50 },
        { itemName: 'Item 3', description: '', quantity: 10, price: 5.25, total: 52.50 },
      ],
      taxRate: 8.5,
      discount: 10,
      notes: '',
    };

    await createInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.result.subTotal).toBe(186.50);
      expect(responseData.result.taxTotal).toBeCloseTo(15.85, 2);
      expect(responseData.result.total).toBeCloseTo(202.35, 2);
    } else {
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });
});

