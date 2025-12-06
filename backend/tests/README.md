# White-Box Testing Suite

This directory contains comprehensive white-box tests for the IDURAR ERP/CRM backend application.

## Test Structure

```
tests/
├── setup/              # Test setup and configuration
│   ├── jest.setup.js   # Jest global setup
│   └── db.setup.js     # MongoDB Memory Server setup
├── fixtures/           # Test data fixtures
│   ├── admin.fixtures.js
│   ├── client.fixtures.js
│   ├── invoice.fixtures.js
│   ├── quote.fixtures.js
│   └── payment.fixtures.js
├── mocks/              # Mock objects and services
│   ├── auth.mock.js
│   └── email.mock.js
├── unit/               # Unit tests
│   ├── controllers/
│   ├── middleware/
│   └── helpers.test.js
└── integration/        # Integration tests
    ├── auth.integration.test.js
    ├── invoice.integration.test.js
    └── client.integration.test.js
```

## Prerequisites

- Node.js 20.9.0+
- npm 10.2.4+
- MongoDB Memory Server (automatically installed)

## Installation

```bash
# Install dependencies (including test dependencies)
npm install
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Run Tests for CI/CD
```bash
npm run test:ci
```

## Test Coverage

The test suite aims for:
- **≥80% code coverage** overall
- **100% API endpoint coverage**
- **100% critical path coverage**

View coverage reports:
- HTML: `coverage/lcov-report/index.html`
- LCOV: `coverage/lcov.info`
- Text: Console output

## Test Categories

### Unit Tests
- **Controllers**: Individual controller method testing
- **Middleware**: Authentication, error handling, validation
- **Helpers**: Utility functions, calculations
- **Services**: Business logic functions

### Integration Tests
- **API Endpoints**: Full request-response cycle
- **Database Operations**: CRUD operations with MongoDB
- **Authentication Flow**: Login, logout, token validation
- **Business Workflows**: Complete user journeys

## Writing New Tests

### Unit Test Example
```javascript
describe('MyController', () => {
  test('should perform action correctly', async () => {
    // Arrange
    const input = { /* test data */ };
    
    // Act
    const result = await myFunction(input);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
```

### Integration Test Example
```javascript
describe('POST /api/endpoint', () => {
  test('should create resource', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .send({ /* data */ });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Test Fixtures

Use fixtures to create consistent test data:

```javascript
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const { createTestClient } = require('../fixtures/client.fixtures');
const { createTestInvoice } = require('../fixtures/invoice.fixtures');
```

## Mocking

### Authentication Mock
```javascript
const { createAuthenticatedRequest } = require('../mocks/auth.mock');
const req = createAuthenticatedRequest(userId);
```

### Email Service Mock
```javascript
const mockEmailService = require('../mocks/email.mock');
// Email service is automatically mocked
```

## Database Setup

Tests use MongoDB Memory Server for isolated testing:
- Each test suite gets a fresh database
- Database is automatically cleaned between tests
- No external MongoDB instance required

## CI/CD Integration

Tests run automatically on:
- Push to main/master/develop branches
- Pull requests
- GitHub Actions workflow: `.github/workflows/test.yml`

## Troubleshooting

### Tests Failing with Database Connection
- Ensure MongoDB Memory Server is installed: `npm install mongodb-memory-server`
- Check that test environment variables are set correctly

### Coverage Below Threshold
- Run `npm run test:coverage` to see detailed coverage report
- Add tests for uncovered code paths
- Check `coverage/lcov-report/index.html` for line-by-line coverage

### Authentication Tests Failing
- Verify JWT_SECRET is set in test environment
- Check that test admin users are created correctly
- Ensure tokens are generated with correct secret

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data after tests
3. **Fixtures**: Use fixtures for consistent test data
4. **Mocks**: Mock external services (email, file upload)
5. **Assertions**: Use specific assertions (toBe, toEqual, etc.)
6. **Naming**: Use descriptive test names
7. **Coverage**: Aim for high coverage but focus on critical paths

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

