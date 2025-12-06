/**
 * Generate test quote data
 */
const generateQuote = (clientId, createdById, overrides = {}) => {
  const items = overrides.items || [
    {
      itemName: 'Test Product 1',
      description: 'Test Description 1',
      quantity: 2,
      price: 100.00,
      total: 200.00,
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
    status: overrides.status || 'draft',
    converted: overrides.converted || false,
    notes: overrides.notes || 'Test quote notes',
    removed: false,
    ...overrides,
  };
};

/**
 * Create and save test quote
 */
const createTestQuote = async (QuoteModel, clientId, createdById, overrides = {}) => {
  const quoteData = generateQuote(clientId, createdById, overrides);
  const quote = await new QuoteModel(quoteData).save();
  return quote;
};

/**
 * Create multiple test quotes
 */
const createTestQuotes = async (QuoteModel, clientId, createdById, count = 5) => {
  const quotes = [];
  for (let i = 0; i < count; i++) {
    const quote = await createTestQuote(QuoteModel, clientId, createdById, {
      number: i + 1,
      status: i % 2 === 0 ? 'sent' : 'draft',
    });
    quotes.push(quote);
  }
  return quotes;
};

module.exports = {
  generateQuote,
  createTestQuote,
  createTestQuotes,
};

