# Integration Tests Documentation

## Overview

This directory contains comprehensive integration tests for the IDURAR ERP/CRM backend API. These tests verify end-to-end API behavior, including HTTP requests, database operations, authentication, and business logic.

## 📚 Documentation Files

- **[INTEGRATION_TESTING_DOCUMENTATION.md](./INTEGRATION_TESTING_DOCUMENTATION.md)** - Comprehensive documentation of all test cases, coverage, and test execution results
- **[BUGS_DISCOVERED.md](./BUGS_DISCOVERED.md)** - Detailed documentation of bugs discovered and fixed during testing

## Quick Stats

- **Total Test Suites:** 26
- **Total Test Cases:** 211
- **Test Status:** ✅ All Passing (211/211)
- **Coverage:** 81.14% Statements, 60.27% Branches, 70.13% Functions, 81.28% Lines
- **Bugs Discovered:** 2 Critical Bugs (Both Fixed)

## Test Structure

```
tests/integration/
├── setup/
│   └── integration.setup.js    # Test setup and utilities
├── auth.integration.test.js     # Authentication API tests
├── admin.integration.test.js    # Admin management API tests
├── settings.integration.test.js # Settings API tests
├── client.integration.test.js   # Client CRUD API tests
├── invoice.integration.test.js  # Invoice CRUD API tests
├── quote.integration.test.js    # Quote CRUD API tests
├── payment.integration.test.js  # Payment CRUD API tests
├── paymentMode.integration.test.js # Payment Mode API tests
├── taxes.integration.test.js    # Taxes API tests
└── README.md                    # This file
```

## Test Setup

### Prerequisites

- Node.js 20+
- MongoDB Memory Server (automatically installed)
- Jest and Supertest (already in devDependencies)

### Test Environment

Tests use:
- **MongoDB Memory Server**: In-memory MongoDB instance for isolated testing
- **Supertest**: HTTP assertion library for testing Express routes
- **Jest**: Test framework

### Setup File

The `setup/integration.setup.js` file provides:
- Database connection/disconnection utilities
- Model loading functionality
- Express app initialization
- Database cleanup utilities

## Running Tests

### Run All Integration Tests

```bash
cd backend
npm run test:integration
```

### Run Specific Test File

```bash
cd backend
npm test tests/integration/auth.integration.test.js
```

### Run Tests with Coverage

```bash
cd backend
npm test -- --coverage tests/integration
```

## Test Coverage

### Authentication API (`auth.integration.test.js`)

- ✅ POST `/api/login` - User login
  - Valid credentials
  - Missing email/password
  - Invalid credentials
  - Disabled account
- ✅ POST `/api/logout` - User logout
  - Valid token
  - Missing/invalid token
- ✅ POST `/api/forgetpassword` - Password reset request
- ✅ POST `/api/resetpassword` - Password reset

### Admin API (`admin.integration.test.js`)

- ✅ GET `/api/admin/read/:id` - Read admin
- ✅ PATCH `/api/admin/password-update/:id` - Update admin password
- ✅ PATCH `/api/admin/profile/password` - Update profile password
- ✅ PATCH `/api/admin/profile/update` - Update admin profile

### Settings API (`settings.integration.test.js`)

- ✅ POST `/api/setting/create` - Create setting
- ✅ GET `/api/setting/read/:id` - Read setting
- ✅ PATCH `/api/setting/update/:id` - Update setting
- ✅ GET `/api/setting/list` - Paginated settings list
- ✅ GET `/api/setting/listAll` - All settings
- ✅ GET `/api/setting/readBySettingKey/:settingKey` - Read by key
- ✅ GET `/api/setting/listBySettingKey` - List by keys
- ✅ PATCH `/api/setting/updateBySettingKey/:settingKey` - Update by key
- ✅ GET `/api/setting/search` - Search settings

### Client API (`client.integration.test.js`)

- ✅ POST `/api/client/create` - Create client
- ✅ GET `/api/client/read/:id` - Read client
- ✅ PATCH `/api/client/update/:id` - Update client
- ✅ DELETE `/api/client/delete/:id` - Soft delete client
- ✅ GET `/api/client/list` - Paginated client list
- ✅ GET `/api/client/listAll` - All clients
- ✅ GET `/api/client/search` - Search clients
- ✅ GET `/api/client/summary` - Client summary statistics

### Invoice API (`invoice.integration.test.js`)

- ✅ POST `/api/invoice/create` - Create invoice
  - Valid data with calculations
  - Missing required fields
  - Empty items array
- ✅ GET `/api/invoice/read/:id` - Read invoice
- ✅ PATCH `/api/invoice/update/:id` - Update invoice
  - Recalculate totals
  - Update payment status
- ✅ DELETE `/api/invoice/delete/:id` - Soft delete invoice
- ✅ GET `/api/invoice/list` - Paginated invoice list
  - Filtering by status
  - Search functionality
- ✅ GET `/api/invoice/summary` - Invoice summary statistics
- ✅ GET `/api/invoice/search` - Search invoices

### Quote API (`quote.integration.test.js`)

- ✅ POST `/api/quote/create` - Create quote
- ✅ GET `/api/quote/read/:id` - Read quote
- ✅ PATCH `/api/quote/update/:id` - Update quote
- ✅ DELETE `/api/quote/delete/:id` - Soft delete quote
- ✅ GET `/api/quote/list` - Paginated quote list
- ✅ GET `/api/quote/convert/:id` - Convert quote to invoice
- ✅ GET `/api/quote/summary` - Quote summary statistics

### Payment API (`payment.integration.test.js`)

- ✅ POST `/api/payment/create` - Create payment
  - Update invoice credit
  - Update invoice payment status
- ✅ GET `/api/payment/read/:id` - Read payment
- ✅ PATCH `/api/payment/update/:id` - Update payment
  - Adjust invoice credit
- ✅ DELETE `/api/payment/delete/:id` - Soft delete payment
  - Revert invoice credit
- ✅ GET `/api/payment/list` - Paginated payment list
- ✅ GET `/api/payment/summary` - Payment summary statistics

### PaymentMode API (`paymentMode.integration.test.js`)

- ✅ POST `/api/paymentmode/create` - Create payment mode
- ✅ GET `/api/paymentmode/read/:id` - Read payment mode
- ✅ PATCH `/api/paymentmode/update/:id` - Update payment mode
- ✅ DELETE `/api/paymentmode/delete/:id` - Soft delete payment mode
- ✅ GET `/api/paymentmode/list` - Paginated payment mode list
- ✅ GET `/api/paymentmode/listAll` - All payment modes

### Taxes API (`taxes.integration.test.js`)

- ✅ POST `/api/taxes/create` - Create tax
- ✅ GET `/api/taxes/read/:id` - Read tax
- ✅ PATCH `/api/taxes/update/:id` - Update tax
- ✅ DELETE `/api/taxes/delete/:id` - Soft delete tax
- ✅ GET `/api/taxes/list` - Paginated taxes list
- ✅ GET `/api/taxes/listAll` - All taxes

## Test Patterns

### Authentication Flow

All protected routes require authentication. Tests follow this pattern:

```javascript
beforeEach(async () => {
  // Create admin user
  const { admin } = await createTestAdmin(Admin, AdminPassword);
  
  // Login to get auth token
  const loginResponse = await request(app)
    .post('/api/login')
    .send({ email: admin.email, password: 'password123' });
  
  authToken = loginResponse.body.result.token;
});

// Use token in requests
const response = await request(app)
  .get('/api/some-endpoint')
  .set('Cookie', `token=${authToken}`)
  .expect(200);
```

### Database Cleanup

Each test suite:
1. Clears database before each test (`beforeEach`)
2. Closes database connection after all tests (`afterAll`)

### Response Assertions

All tests verify:
- ✅ Correct HTTP status codes
- ✅ Response body structure (`success`, `result`, `message`)
- ✅ Database operations (create/read/update/delete)
- ✅ Business logic (calculations, status updates)
- ✅ Error handling (400, 401, 404)

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: Database is cleared before each test
3. **Fixtures**: Reusable test data creation functions
4. **Assertions**: Comprehensive verification of responses and database state
5. **Error Cases**: Both success and error paths are tested

## Troubleshooting

### Tests Failing with Connection Errors

- Ensure MongoDB Memory Server is properly installed
- Check that `beforeAll` and `afterAll` hooks are properly set up

### Authentication Errors

- Verify that admin user is created with correct password
- Check that JWT_SECRET is set in test environment
- Ensure token is properly set in Cookie header

### Model Loading Errors

- Verify that `loadModels()` is called before requiring controllers
- Check that all model files are in the correct directory structure

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Integration Tests
  run: |
    cd backend
    npm run test:integration
```

## Future Enhancements

- [ ] Add tests for file upload endpoints
- [ ] Add tests for email sending functionality
- [ ] Add performance/load testing
- [ ] Add tests for PDF generation
- [ ] Add tests for complex business workflows

