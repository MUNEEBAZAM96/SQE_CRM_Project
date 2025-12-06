/**
 * Generate test invoice data
 */
const generateInvoice = (clientId, createdById, overrides = {}) => {
  const items = overrides.items || [
    {
      itemName: 'Test Product 1',
      description: 'Test Description 1',
      quantity: 2,
      price: 100.00,
      total: 200.00,
    },
    {
      itemName: 'Test Product 2',
      description: 'Test Description 2',
      quantity: 1,
      price: 50.00,
      total: 50.00,
    },
  ];

  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = overrides.taxRate || 10;
  const taxTotal = (subTotal * taxRate) / 100;
  const total = subTotal + taxTotal;

  return {
    number: overrides.number || 1,
    year: overrides.year || new Date().getFullYear(),
    date: overrides.date || new Date(),
    expiredDate: overrides.expiredDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    client: clientId,
    createdBy: createdById,
    items: items,
    taxRate: taxRate,
    subTotal: subTotal,
    taxTotal: taxTotal,
    total: total,
    discount: overrides.discount || 0,
    currency: overrides.currency || 'USD',
    paymentStatus: overrides.paymentStatus || 'unpaid',
    status: overrides.status || 'draft',
    notes: overrides.notes || 'Test invoice notes',
    removed: false,
    ...overrides,
  };
};

/**
 * Create and save test invoice
 */
const createTestInvoice = async (InvoiceModel, clientId, createdById, overrides = {}) => {
  const invoiceData = generateInvoice(clientId, createdById, overrides);
  const invoice = await new InvoiceModel(invoiceData).save();
  return invoice;
};

/**
 * Create multiple test invoices
 */
const createTestInvoices = async (InvoiceModel, clientId, createdById, count = 5) => {
  const invoices = [];
  for (let i = 0; i < count; i++) {
    const invoice = await createTestInvoice(InvoiceModel, clientId, createdById, {
      number: i + 1,
      status: i % 2 === 0 ? 'sent' : 'draft',
    });
    invoices.push(invoice);
  }
  return invoices;
};

module.exports = {
  generateInvoice,
  createTestInvoice,
  createTestInvoices,
};

