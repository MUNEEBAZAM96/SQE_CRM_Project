const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient } = require('../../fixtures/client.fixtures');
const { createTestInvoice } = require('../../fixtures/invoice.fixtures');

describe('Invoice Controller - Read (Success Case)', () => {
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
    });

    req = {
      params: { id: invoice._id },
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

  test('should return 200 and invoice when found', async () => {
    const readInvoice = require('@/controllers/appControllers/invoiceController/read');
    await readInvoice(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: expect.objectContaining({
          _id: invoice._id,
        }),
        message: 'we found this document ',
      })
    );
  });
});

