/**
 * Generate test payment data
 */
const generatePayment = (invoiceId, clientId, createdById, overrides = {}) => {
  return {
    invoice: invoiceId,
    client: clientId,
    number: overrides.number || 1,
    amount: overrides.amount || 100.00,
    date: overrides.date || new Date(),
    currency: overrides.currency || 'USD',
    paymentMode: overrides.paymentMode || null,
    ref: overrides.ref || null,
    description: overrides.description || 'Test payment notes',
    createdBy: createdById,
    removed: false,
    ...overrides,
  };
};

/**
 * Create and save test payment
 */
const createTestPayment = async (PaymentModel, invoiceId, clientId, createdById, overrides = {}) => {
  const paymentData = generatePayment(invoiceId, clientId, createdById, overrides);
  const payment = await new PaymentModel(paymentData).save();
  return payment;
};

module.exports = {
  generatePayment,
  createTestPayment,
};

