/**
 * Mock email service
 */
const mockEmailService = {
  send: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-message-id',
  }),
  
  sendInvoice: jest.fn().mockResolvedValue({
    success: true,
    message: 'Invoice email sent successfully',
  }),
  
  sendQuote: jest.fn().mockResolvedValue({
    success: true,
    message: 'Quote email sent successfully',
  }),
  
  sendPayment: jest.fn().mockResolvedValue({
    success: true,
    message: 'Payment receipt sent successfully',
  }),
};

module.exports = mockEmailService;

