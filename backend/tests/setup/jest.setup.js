require('module-alias/register');
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';
process.env.DATABASE = process.env.DATABASE || 'mongodb://localhost:27017/test-db';
// Set mock Resend API key to prevent errors (even though sendMail will skip sending)
process.env.RESEND_API = process.env.RESEND_API || 're_test_mock_key';

// Mock Resend module to prevent API key errors
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn().mockResolvedValue({
          id: 'mock-email-id',
          from: 'test@example.com',
          to: ['test@example.com'],
          created_at: new Date().toISOString(),
        }),
      },
    })),
  };
});

// Increase timeout for async operations
jest.setTimeout(60000);

// Global test utilities
global.console = {
  ...console,
  // Uncomment to silence console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

