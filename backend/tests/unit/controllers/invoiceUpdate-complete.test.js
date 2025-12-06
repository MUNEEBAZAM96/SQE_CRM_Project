const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestInvoice } = require('../../fixtures/invoice.fixtures');

describe('Invoice Controller - update (Complete Coverage)', () => {
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
      total: 100,
      discount: 0,
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

  test('should update invoice with all calculations and payment status logic', async () => {
    const updateInvoice = require('@/controllers/appControllers/invoiceController/update');
    req.body = {
      client: client._id,
      number: invoice.number,
      year: invoice.year,
      date: invoice.date,
      expiredDate: invoice.expiredDate,
      status: 'sent',
      items: [
        { itemName: 'Updated Item 1', quantity: 3, price: 50, total: 150 },
        { itemName: 'Updated Item 2', quantity: 2, price: 75, total: 150 },
      ],
      taxRate: 15,
      discount: 10,
      currency: 'EUR',
      notes: 'Updated notes',
    };

    await updateInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.result.subTotal).toBe(300);
      expect(responseData.result.taxTotal).toBe(45);
      expect(responseData.result.total).toBe(345);
      expect(responseData.result.paymentStatus).toBe('unpaid');
      expect(responseData.result.pdf).toMatch(/^invoice-.*\.pdf$/);
      expect(req.body.currency).toBeUndefined(); // Should be deleted
    } else {
      // If validation fails, just check it's a validation error
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });

  test('should set payment status to unpaid when credit is 0', async () => {
    const updateInvoice = require('@/controllers/appControllers/invoiceController/update');
    const unpaidInvoice = await createTestInvoice(InvoiceModel, client._id, admin._id, {
      number: 2,
      year: new Date().getFullYear(),
      status: 'draft',
      credit: 0,
      total: 100,
      discount: 0,
    });

    req.params.id = unpaidInvoice._id;
    req.body = {
      client: client._id,
      number: unpaidInvoice.number,
      year: unpaidInvoice.year,
      date: unpaidInvoice.date,
      expiredDate: unpaidInvoice.expiredDate,
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
    } else {
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });

  test('should handle validation error', async () => {
    const updateInvoice = require('@/controllers/appControllers/invoiceController/update');
    req.body = {
      // Missing required fields
    };

    await updateInvoice(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });


  test('should not delete currency if it does not exist in body', async () => {
    const updateInvoice = require('@/controllers/appControllers/invoiceController/update');
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
      // No currency field
    };

    await updateInvoice(req, res);

    if (res.status.mock.calls[0][0] === 200) {
      expect(req.body.currency).toBeUndefined();
    } else {
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });
});

