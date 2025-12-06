const mongoose = require('mongoose');
const { createTestAdmin } = require('../../fixtures/admin.fixtures');
const { createTestClient, createTestClients } = require('../../fixtures/client.fixtures');
const { createTestInvoice } = require('../../fixtures/invoice.fixtures');

describe('Client Summary Controller', () => {
  let ClientModel;
  let InvoiceModel;
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
    
    ClientModel = mongoose.model('Client');
    InvoiceModel = mongoose.model('Invoice');
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

  test('should return client summary statistics', async () => {
    const clientSummary = require('@/controllers/appControllers/clientController/summary');
    await createTestClients(ClientModel, 5);
    // Create invoice for one client to make it active
    const activeClient = await createTestClient(ClientModel, { name: 'Active Client' });
    await createTestInvoice(InvoiceModel, activeClient._id, admin._id, {
      number: 1,
      year: new Date().getFullYear(),
      status: 'draft',
    });

    await clientSummary(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: expect.objectContaining({
          new: expect.any(Number),
          active: expect.any(Number),
        }),
      })
    );
  });

  test('should return summary with type filter', async () => {
    const clientSummary = require('@/controllers/appControllers/clientController/summary');
    await createTestClients(ClientModel, 3);

    req.query = { type: 'month' };
    await clientSummary(ClientModel, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });
});

