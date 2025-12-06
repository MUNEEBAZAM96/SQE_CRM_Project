# Test Plan

## IDURAR ERP/CRM Application

**Test Plan Identifier:** TP-IDURAR-ERP-CRM-001

**Version:** 1.0

**Date:** 15 December 2024

**Author:** Software Quality Engineering Team

**Status:** Approved for Execution

**Repository:** https://github.com/MUNEEBAZAM96/SQE_CRM_Project

---

## 1. Test Objective

The test plan will cover both **white-box** and **black-box** testing, focusing on internal code structure (white-box) and functional user behaviors (black-box).

### Primary Objectives:

- Ensure that the application functions correctly in both **development** and **production** environments.
- Perform both **UI testing** and **backend API testing** to validate the end-to-end user journey.
- Verify all functional requirements are met across all modules (Invoice, Quote, Payment, Client, Settings, Dashboard, Authentication).
- Achieve ≥80% code coverage with 100% API endpoint coverage.
- Ensure application stability, security, performance, and usability.
- Validate data integrity and business logic correctness.
- Test PDF generation and email functionality.
- Verify responsive design and cross-browser compatibility.
- Automate regression testing via CI/CD pipeline.
- Deliver a production-ready, defect-free application.

---

## 2. Test Scope

### 2.1 Functional Testing (Black-Box)

Validating core features and user interactions without knowledge of internal code structure:

#### Authentication & Authorization
- Login functionality with valid/invalid credentials
- Logout functionality
- Forget Password and Reset Password flows
- Protected route access control
- Session management

#### Invoice Management
- Create, Read, Update, Delete (CRUD) operations
- Invoice list with pagination
- Search and filter invoices
- Invoice summary and statistics
- Send invoice via email
- Download invoice as PDF
- Invoice status management

#### Quote Management
- CRUD operations for quotes
- Quote list with pagination
- Search and filter quotes
- Convert quote to invoice
- Send quote via email
- Download quote as PDF

#### Payment Management
- CRUD operations for payments
- Link payment to invoice
- Payment list and search
- Send payment receipt via email
- Download payment as PDF

#### Customer/Client Management
- CRUD operations for clients
- Client list with pagination
- Search and filter clients
- Client summary statistics

#### Settings Management
- Company settings configuration
- Finance settings configuration
- General settings configuration
- Money format settings
- Company logo upload

#### Dashboard
- Dashboard statistics display
- Recent invoices, quotes, payments
- Summary cards and data visualization

#### Navigation & User Experience
- Page navigation and routing
- Form submission and validation
- Error handling and user feedback
- Data table interactions (pagination, sorting, filtering)

### 2.2 Non-Functional Testing

#### Performance Testing
- **Load Times**: Page load time < 3 seconds
- **Response Times**: API response time < 500ms (95th percentile)
- **PDF Generation**: PDF generation time < 2 seconds
- **Database Query Performance**: Query optimization and indexing validation
- **Concurrent User Handling**: Application behavior under normal load

#### Security Testing
- **Injection Attacks**: SQL injection, NoSQL injection prevention
- **XSS (Cross-Site Scripting)**: Input sanitization and output encoding
- **Authentication Security**: JWT token validation, token expiration
- **Authorization**: Role-based access control validation
- **Password Security**: Password hashing with bcrypt, password strength requirements
- **Input Validation**: Server-side validation for all user inputs
- **CSRF Protection**: Cross-site request forgery prevention
- **Sensitive Data Exposure**: Secure handling of credentials and personal data

#### Accessibility Testing
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Form label associations
- ARIA attributes validation
- Basic WCAG 2.1 Level A compliance

### 2.3 Unit Testing (White-Box)

Testing individual functions and methods in the backend code with knowledge of internal implementation:

#### Backend Unit Tests
- **Controller Functions**: Testing individual controller methods (create, read, update, delete, search, filter, summary)
- **Middleware Functions**: Authentication middleware, validation middleware, upload middleware
- **Utility Functions**: Date formatting, currency formatting, calculation functions
- **Model Methods**: Database model methods and validations
- **Helper Functions**: Error handlers, response formatters, data transformers
- **Business Logic**: Invoice calculations, tax calculations, payment processing logic

#### Frontend Unit Tests
- **React Components**: Individual component rendering and behavior
- **Redux Reducers**: State management logic
- **Redux Actions**: Action creators and async actions
- **Utility Functions**: Formatters, validators, helpers
- **Custom Hooks**: Reusable hook logic

**Coverage Target**: ≥80% code coverage

### 2.4 Integration Testing

Testing the interaction between different services and components:

#### Backend Integration Tests
- **API Endpoints**: Full request-response cycle testing
- **Database Integration**: MongoDB connection, CRUD operations, transactions
- **Authentication Integration**: JWT generation, validation, middleware chain
- **Email Service Integration**: Email template rendering and sending
- **PDF Generation Integration**: PDF template rendering with data
- **File Upload Integration**: Image upload, file validation, storage

#### Frontend-Backend Integration Tests
- **API Communication**: Axios requests, response handling, error handling
- **State Management**: Redux store updates from API responses
- **Authentication Flow**: Login → Token Storage → Protected Route Access
- **Data Flow**: Create → API Call → Database → Response → UI Update

#### External Service Integration
- **MongoDB Atlas**: Database connection and operations
- **Email Service**: Email delivery (Resend or configured service)
- **File Storage**: Local storage or cloud storage (AWS S3 if configured)

**Coverage Target**: 100% API endpoint coverage

---

## 3. Test Techniques

### 3.1 Manual Testing

Performed during the **staging stage** for exploratory testing and user experience evaluation:

#### Manual Test Activities
- **Exploratory Testing**: Ad-hoc testing to discover unexpected behaviors
- **User Experience Evaluation**: Usability testing, workflow validation
- **Visual Testing**: UI/UX consistency, responsive design validation
- **Cross-Browser Testing**: Manual verification across Chrome, Firefox, Safari, Edge
- **Accessibility Testing**: Manual keyboard navigation, screen reader testing
- **Security Testing**: Manual penetration testing, security vulnerability assessment
- **Regression Testing**: Manual verification of fixed defects
- **User Acceptance Testing (UAT)**: Stakeholder validation of features

#### Manual Test Scenarios
- Complete user workflows (e.g., Create Invoice → Send Email → Record Payment)
- Edge cases and boundary conditions
- Error scenarios and error message validation
- PDF generation and download verification
- Email delivery and content verification

### 3.2 Automated Testing

#### Unit Tests for Backend Functions

**Framework**: Jest (Node.js testing framework)

**Test Coverage**:
- All controller methods
- All middleware functions
- All utility and helper functions
- All model methods
- Business logic functions

**Example Test Structure**:
```javascript
describe('Invoice Controller', () => {
  test('should create invoice with valid data', async () => {
    // Test implementation
  });
  
  test('should return 400 for invalid invoice data', async () => {
    // Test implementation
  });
});
```

#### Unit Tests for Frontend Components

**Framework**: Jest + React Testing Library

**Test Coverage**:
- Component rendering
- User interactions (clicks, form inputs)
- Props and state management
- Redux integration

#### Integration Tests

**Framework**: Jest + Supertest (for API testing)

**Test Coverage**:
- All API endpoints
- Database operations
- Authentication flows
- Error handling

#### UI Tests for User Interactions

**Framework**: Cypress (Primary) / Selenium (Alternative)

**Test Coverage**:
- Critical user journeys
- Form submissions
- Navigation flows
- Data table interactions
- Authentication flows
- PDF downloads
- Email sending workflows

**Example Cypress Test Structure**:
```javascript
describe('Invoice Management', () => {
  it('should create a new invoice', () => {
    cy.visit('/invoice/create');
    cy.get('[data-cy=client-select]').select('Client 1');
    // ... fill form
    cy.get('[data-cy=submit-btn]').click();
    cy.url().should('include', '/invoice');
  });
});
```

#### API Tests

**Framework**: Jest + Supertest

**Test Coverage**:
- All REST API endpoints
- Request/response validation
- Status code validation
- Error response validation
- Authentication and authorization

---

## 4. Test Tools and Frameworks

### 4.1 Backend Testing

| Tool | Purpose | Version |
|------|---------|---------|
| **Jest** | Unit testing, integration testing, test runner | Latest |
| **Supertest** | HTTP assertion library for API testing | Latest |
| **MongoDB Memory Server** | In-memory MongoDB for isolated testing | Latest |
| **Sinon** | Spies, stubs, and mocks | Latest |

### 4.2 UI Testing

| Tool | Purpose | Version |
|------|---------|---------|
| **Cypress** | End-to-end testing, UI automation | 15.7.1+ |
| **Selenium** | Alternative E2E testing framework | Latest |
| **React Testing Library** | Component testing, user-centric testing | Latest |

### 4.3 CI/CD

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | Continuous Integration and Deployment |
| **CircleCI** | Alternative CI/CD platform |
| **Jenkins** | Self-hosted CI/CD solution |
| **Argo CD** | GitOps continuous delivery |
| **AWS CodeDeploy** | Automated deployments to AWS |

### 4.4 Monitoring

| Tool | Purpose |
|------|---------|
| **New Relic** | Application performance monitoring, error tracking |
| **Sentry** | Error tracking, performance monitoring |

### 4.5 Additional Tools

| Tool | Purpose |
|------|---------|
| **Lighthouse** | Performance auditing, accessibility testing |
| **OWASP ZAP** | Security vulnerability scanning (optional) |
| **Artillery / k6** | Load testing and performance testing (optional) |
| **BrowserStack** | Cross-browser testing platform |

---

## 5. Test Environment

### 5.1 Development Environment

**Configuration**:
- **Local Environment**: Developer machines
- **Containerization**: Docker containers for consistent setup
- **Database**: MongoDB 6.0+ (local instance or Docker container)
- **Node.js**: Version 20.9.0
- **Package Manager**: npm 10.2.4
- **Frontend Dev Server**: Vite dev server (localhost:5173)
- **Backend Dev Server**: Express server (localhost:3000 or configured port)
- **Test Database**: MongoDB Memory Server for automated tests

**Setup**:
- Docker Compose for local development stack
- Environment variables via `.env` files
- Hot reload for both frontend and backend
- Test data seeding scripts

### 5.2 Staging Environment

**Configuration**:
- **Cloud Platform**: AWS, Azure, or similar cloud provider
- **Frontend Hosting**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend Hosting**: Railway, Heroku, AWS EC2, or Azure App Service
- **Database**: MongoDB Atlas (cloud database)
- **Domain**: Staging subdomain (e.g., staging.app.com)
- **SSL/TLS**: HTTPS enabled
- **Environment Variables**: Managed through cloud platform secrets

**Purpose**:
- Pre-production testing
- User acceptance testing (UAT)
- Integration testing with production-like data
- Performance testing
- Security testing

### 5.3 Production Environment

**Configuration**:
- **Live Production Server**: Cloud-hosted production environment
- **Frontend**: Production build deployed to CDN
- **Backend**: Production server with load balancing (if needed)
- **Database**: MongoDB Atlas production cluster
- **Domain**: Production domain with SSL certificate
- **Monitoring Tools**: New Relic, Sentry integrated
- **Logging**: Centralized logging system
- **Backup**: Automated database backups
- **Security**: Firewall, DDoS protection, security headers

**Monitoring**:
- Real-time error tracking (Sentry)
- Performance monitoring (New Relic)
- Uptime monitoring
- Database performance monitoring
- API response time monitoring

---

## 6. Test Cases

### 6.1 UI Test Cases

#### Test Case 1: User Login

**Test Scenario**: User logs into the application.

**Test Type**: Black-Box (Functional)

**Priority**: High

**Preconditions**:
- Application is running
- Valid user credentials exist in the database
- User is on the login page

**Test Steps**:
1. Navigate to the login page (`/login`)
2. Enter valid email address in the email field
3. Enter valid password in the password field
4. Click on the login button

**Expected Result**: 
- User is successfully logged in
- User is redirected to the dashboard (`/`)
- JWT token is stored in localStorage
- User session is established
- Navigation menu is displayed

**Automated**: Yes (Cypress)

---

#### Test Case 2: Create Invoice

**Test Scenario**: User creates a new invoice.

**Test Type**: Black-Box (Functional)

**Priority**: High

**Preconditions**:
- User is logged in
- At least one client exists in the system
- User navigates to invoice create page

**Test Steps**:
1. Navigate to `/invoice/create`
2. Select a client from the client dropdown
3. Fill in invoice details (date, due date, items, quantities, prices)
4. Add tax if applicable
5. Click on the "Create Invoice" button

**Expected Result**:
- Invoice is successfully created
- Success notification is displayed
- User is redirected to invoice list page
- New invoice appears in the invoice list
- Invoice number is generated automatically

**Automated**: Yes (Cypress)

---

#### Test Case 3: Search Invoices

**Test Scenario**: User searches for invoices.

**Test Type**: Black-Box (Functional)

**Priority**: Medium

**Preconditions**:
- User is logged in
- Multiple invoices exist in the system
- User is on the invoice list page

**Test Steps**:
1. Navigate to `/invoice`
2. Enter search keyword in the search field
3. Press Enter or click search button

**Expected Result**:
- Search results are displayed based on the keyword
- Results match invoice numbers, client names, or other searchable fields
- Search is performed in real-time or after submission
- Empty state is shown if no results found

**Automated**: Yes (Cypress)

---

#### Test Case 4: Convert Quote to Invoice

**Test Scenario**: User converts a quote to an invoice.

**Test Type**: Black-Box (Functional)

**Priority**: High

**Preconditions**:
- User is logged in
- A quote exists in the system (not already converted)
- User is viewing the quote details page

**Test Steps**:
1. Navigate to a quote detail page (`/quote/read/:id`)
2. Click on the "Convert to Invoice" button
3. Confirm the conversion if prompted

**Expected Result**:
- Quote is successfully converted to an invoice
- New invoice is created with quote data
- User is redirected to the new invoice page
- Quote status is updated to "Converted"
- Success notification is displayed

**Automated**: Yes (Cypress)

---

#### Test Case 5: Download Invoice PDF

**Test Scenario**: User downloads an invoice as PDF.

**Test Type**: Black-Box (Functional)

**Priority**: Medium

**Preconditions**:
- User is logged in
- An invoice exists in the system
- User is viewing the invoice details page

**Test Steps**:
1. Navigate to invoice detail page (`/invoice/read/:id`)
2. Click on the "Download PDF" button
3. Wait for PDF generation

**Expected Result**:
- PDF file is generated successfully
- PDF download starts automatically
- PDF contains correct invoice data (client info, items, totals, tax)
- PDF is properly formatted with company logo and branding
- PDF file name includes invoice number

**Automated**: Yes (Cypress - with PDF validation)

---

#### Test Case 6: Protected Route Access

**Test Scenario**: Unauthenticated user tries to access protected route.

**Test Type**: Black-Box (Security)

**Priority**: High

**Preconditions**:
- User is not logged in
- No valid JWT token in localStorage

**Test Steps**:
1. Navigate directly to a protected route (e.g., `/invoice`)
2. Observe the application behavior

**Expected Result**:
- User is redirected to login page (`/login`)
- Access to protected route is denied
- No data is displayed
- Error message may be shown (optional)

**Automated**: Yes (Cypress)

---

### 6.2 Backend Test Cases

#### Test Case 7: Validate Login API Endpoint

**Test Scenario**: Validate the login API endpoint with valid credentials.

**Test Type**: White-Box (Integration)

**Priority**: High

**Preconditions**:
- Backend server is running
- Test user exists in the database with hashed password
- Database connection is established

**Test Steps**:
1. Send a POST request to `/api/auth/login` endpoint
2. Include valid credentials in request body:
   ```json
   {
     "email": "admin@demo.com",
     "password": "123456"
   }
   ```

**Expected Result**:
- API returns status code 200 (OK)
- Response contains JWT token:
   ```json
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "...",
       "email": "admin@demo.com",
       "name": "..."
     }
   }
   ```
- Token is valid and can be used for authenticated requests
- Password is verified using bcrypt comparison

**Automated**: Yes (Jest + Supertest)

---

#### Test Case 8: Login API with Invalid Credentials

**Test Scenario**: Validate login API endpoint with invalid credentials.

**Test Type**: White-Box (Integration)

**Priority**: High

**Preconditions**:
- Backend server is running
- Database connection is established

**Test Steps**:
1. Send a POST request to `/api/auth/login` endpoint
2. Include invalid credentials in request body:
   ```json
   {
     "email": "invalid@example.com",
     "password": "wrongpassword"
   }
   ```

**Expected Result**:
- API returns status code 401 (Unauthorized)
- Response contains error message:
   ```json
   {
     "success": false,
     "error": "Invalid credentials"
   }
   ```
- No JWT token is returned
- User session is not created

**Automated**: Yes (Jest + Supertest)

---

#### Test Case 9: Create Invoice API

**Test Scenario**: Validate the create invoice API endpoint.

**Test Type**: White-Box (Integration)

**Priority**: High

**Preconditions**:
- Backend server is running
- Valid JWT token is available
- Client exists in the database
- Database connection is established

**Test Steps**:
1. Send a POST request to `/api/invoice/create` endpoint
2. Include valid JWT token in Authorization header: `Bearer <token>`
3. Include valid invoice data in request body:
   ```json
   {
     "client": "client_id_here",
     "invoiceDate": "2024-12-15",
     "dueDate": "2024-12-30",
     "items": [
       {
         "itemName": "Product 1",
         "quantity": 2,
         "price": 100.00
       }
     ],
     "tax": 10,
     "notes": "Test invoice"
   }
   ```

**Expected Result**:
- API returns status code 200 (OK) or 201 (Created)
- Response contains created invoice data:
   ```json
   {
     "success": true,
     "invoice": {
       "id": "...",
       "invoiceNumber": "INV-001",
       "client": {...},
       "total": 220.00,
       "status": "draft"
     }
   }
   ```
- Invoice is saved in the database
- Invoice number is auto-generated
- Total amount is calculated correctly (including tax)

**Automated**: Yes (Jest + Supertest)

---

#### Test Case 10: Create Invoice API - Validation Error

**Test Scenario**: Validate invoice creation API with missing required fields.

**Test Type**: White-Box (Unit/Integration)

**Priority**: High

**Preconditions**:
- Backend server is running
- Valid JWT token is available
- Database connection is established

**Test Steps**:
1. Send a POST request to `/api/invoice/create` endpoint
2. Include valid JWT token in Authorization header
3. Include incomplete invoice data (missing required fields):
   ```json
   {
     "invoiceDate": "2024-12-15"
   }
   ```

**Expected Result**:
- API returns status code 400 (Bad Request)
- Response contains validation errors:
   ```json
   {
     "success": false,
     "error": "Validation failed",
     "details": {
       "client": "Client is required",
       "items": "Items are required"
     }
   }
   ```
- Invoice is not created in the database
- Joi validation schema catches the errors

**Automated**: Yes (Jest + Supertest)

---

#### Test Case 11: Get Invoice by ID API

**Test Scenario**: Validate the get invoice by ID API endpoint.

**Test Type**: White-Box (Integration)

**Priority**: High

**Preconditions**:
- Backend server is running
- Valid JWT token is available
- Invoice exists in the database with known ID
- Database connection is established

**Test Steps**:
1. Send a GET request to `/api/invoice/read/:id` endpoint
2. Replace `:id` with a valid invoice ID
3. Include valid JWT token in Authorization header

**Expected Result**:
- API returns status code 200 (OK)
- Response contains invoice data:
   ```json
   {
     "success": true,
     "invoice": {
       "id": "...",
       "invoiceNumber": "INV-001",
       "client": {...},
       "items": [...],
       "total": 220.00,
       "status": "draft",
       "createdAt": "...",
       "updatedAt": "..."
     }
   }
   ```
- Invoice data is populated with related client information
- All invoice fields are present and correctly formatted

**Automated**: Yes (Jest + Supertest)

---

#### Test Case 12: Get Invoice by Invalid ID

**Test Scenario**: Validate get invoice API with non-existent ID.

**Test Type**: White-Box (Integration)

**Priority**: Medium

**Preconditions**:
- Backend server is running
- Valid JWT token is available
- Database connection is established

**Test Steps**:
1. Send a GET request to `/api/invoice/read/invalid_id_12345` endpoint
2. Include valid JWT token in Authorization header

**Expected Result**:
- API returns status code 404 (Not Found)
- Response contains error message:
   ```json
   {
     "success": false,
     "error": "Invoice not found"
   }
   ```
- No invoice data is returned

**Automated**: Yes (Jest + Supertest)

---

#### Test Case 13: Update Invoice API

**Test Scenario**: Validate the update invoice API endpoint.

**Test Type**: White-Box (Integration)

**Priority**: High

**Preconditions**:
- Backend server is running
- Valid JWT token is available
- Invoice exists in the database
- Database connection is established

**Test Steps**:
1. Send a PATCH request to `/api/invoice/update/:id` endpoint
2. Replace `:id` with a valid invoice ID
3. Include valid JWT token in Authorization header
4. Include updated invoice data in request body:
   ```json
   {
     "status": "sent",
     "notes": "Updated notes"
   }
   ```

**Expected Result**:
- API returns status code 200 (OK)
- Response contains updated invoice data:
   ```json
   {
     "success": true,
     "invoice": {
       "id": "...",
       "status": "sent",
       "notes": "Updated notes",
       "updatedAt": "..."
     }
   }
   ```
- Invoice is updated in the database
- Only provided fields are updated (partial update)
- `updatedAt` timestamp is automatically updated

**Automated**: Yes (Jest + Supertest)

---

#### Test Case 14: Delete Invoice API

**Test Scenario**: Validate the delete invoice API endpoint.

**Test Type**: White-Box (Integration)

**Priority**: High

**Preconditions**:
- Backend server is running
- Valid JWT token is available
- Invoice exists in the database
- Database connection is established

**Test Steps**:
1. Send a DELETE request to `/api/invoice/delete/:id` endpoint
2. Replace `:id` with a valid invoice ID
3. Include valid JWT token in Authorization header

**Expected Result**:
- API returns status code 200 (OK)
- Response confirms deletion:
   ```json
   {
     "success": true,
     "message": "Invoice deleted successfully"
   }
   ```
- Invoice is removed from the database
- Subsequent GET request for the same ID returns 404

**Automated**: Yes (Jest + Supertest)

---

#### Test Case 15: List Invoices with Pagination API

**Test Scenario**: Validate the list invoices API with pagination.

**Test Type**: White-Box (Integration)

**Priority**: Medium

**Preconditions**:
- Backend server is running
- Valid JWT token is available
- Multiple invoices exist in the database (at least 15)
- Database connection is established

**Test Steps**:
1. Send a GET request to `/api/invoice/list?page=1&limit=10` endpoint
2. Include valid JWT token in Authorization header

**Expected Result**:
- API returns status code 200 (OK)
- Response contains paginated invoice list:
   ```json
   {
     "success": true,
     "invoices": [...], // Array of 10 invoices
     "pagination": {
       "currentPage": 1,
       "totalPages": 2,
       "totalItems": 15,
       "itemsPerPage": 10
     }
   }
   ```
- Only 10 invoices are returned (as per limit)
- Pagination metadata is included
- Invoices are sorted by creation date (newest first) or as configured

**Automated**: Yes (Jest + Supertest)

---

#### Test Case 16: Search Invoices API

**Test Scenario**: Validate the search invoices API endpoint.

**Test Type**: White-Box (Integration)

**Priority**: Medium

**Preconditions**:
- Backend server is running
- Valid JWT token is available
- Invoices exist in the database with various invoice numbers and client names
- Database connection is established

**Test Steps**:
1. Send a GET request to `/api/invoice/search?q=INV-001` endpoint
2. Include valid JWT token in Authorization header

**Expected Result**:
- API returns status code 200 (OK)
- Response contains matching invoices:
   ```json
   {
     "success": true,
     "invoices": [...], // Array of matching invoices
     "count": 1
   }
   ```
- Search is performed on invoice number, client name, or other searchable fields
- Case-insensitive search (if implemented)
- Empty array returned if no matches found

**Automated**: Yes (Jest + Supertest)

---

#### Test Case 17: Convert Quote to Invoice API

**Test Scenario**: Validate the convert quote to invoice API endpoint.

**Test Type**: White-Box (Integration)

**Priority**: High

**Preconditions**:
- Backend server is running
- Valid JWT token is available
- Quote exists in the database (not already converted)
- Database connection is established

**Test Steps**:
1. Send a GET request to `/api/quote/convert/:id` endpoint
2. Replace `:id` with a valid quote ID
3. Include valid JWT token in Authorization header

**Expected Result**:
- API returns status code 200 (OK)
- Response contains created invoice data:
   ```json
   {
     "success": true,
     "invoice": {
       "id": "...",
       "invoiceNumber": "INV-002",
       "quote": {...}, // Reference to original quote
       "items": [...], // Copied from quote
       "total": 220.00
     }
   }
   ```
- New invoice is created in the database
- Invoice data is copied from quote
- Quote status is updated to "converted"
- Invoice number is auto-generated

**Automated**: Yes (Jest + Supertest)

---

#### Test Case 18: Send Invoice Email API

**Test Scenario**: Validate the send invoice email API endpoint.

**Test Type**: White-Box (Integration)

**Priority**: Medium

**Preconditions**:
- Backend server is running
- Valid JWT token is available
- Invoice exists in the database
- Email service is configured
- Client has valid email address
- Database connection is established

**Test Steps**:
1. Send a POST request to `/api/invoice/mail` endpoint
2. Include valid JWT token in Authorization header
3. Include invoice ID and recipient email in request body:
   ```json
   {
     "invoiceId": "invoice_id_here",
     "to": "client@example.com",
     "subject": "Invoice #INV-001"
   }
   ```

**Expected Result**:
- API returns status code 200 (OK)
- Response confirms email sent:
   ```json
   {
     "success": true,
     "message": "Invoice email sent successfully"
   }
   ```
- Email is sent to the specified recipient
- Email contains invoice details and PDF attachment (if implemented)
- Email template is properly rendered

**Automated**: Yes (Jest + Supertest - with email service mock)

---

#### Test Case 19: JWT Token Validation Middleware

**Test Scenario**: Validate JWT token validation middleware.

**Test Type**: White-Box (Unit)

**Priority**: High

**Preconditions**:
- Backend server is running
- JWT secret is configured

**Test Steps**:
1. Create a valid JWT token
2. Send a request to a protected endpoint with valid token in Authorization header
3. Send a request to a protected endpoint with invalid/expired token
4. Send a request to a protected endpoint without token

**Expected Result**:
- Valid token: Request proceeds, user data is attached to request object
- Invalid token: API returns 401 (Unauthorized)
- Expired token: API returns 401 (Unauthorized)
- No token: API returns 401 (Unauthorized)
- Error messages are clear and consistent

**Automated**: Yes (Jest)

---

#### Test Case 20: Password Hashing Verification

**Test Scenario**: Validate password hashing with bcrypt.

**Test Type**: White-Box (Unit)

**Priority**: High

**Preconditions**:
- Backend server is running
- bcryptjs is installed

**Test Steps**:
1. Create a new admin/user with a password
2. Retrieve the stored password hash from database
3. Compare stored hash with plain text password using bcrypt.compare()

**Expected Result**:
- Password is hashed before storing in database
- Stored password is not plain text
- bcrypt.compare() returns true for correct password
- bcrypt.compare() returns false for incorrect password
- Hash includes salt (bcrypt format)

**Automated**: Yes (Jest)

---

## 7. Test Execution Schedule

### Phase 1: Unit Testing (Weeks 1-2)
- Backend unit tests development and execution
- Frontend component unit tests
- Target: ≥80% code coverage

### Phase 2: Integration Testing (Weeks 3-4)
- API integration tests
- Database integration tests
- Frontend-backend integration tests
- Target: 100% API endpoint coverage

### Phase 3: UI/E2E Testing (Week 5)
- Cypress test suite development
- Critical user journey automation
- Target: All critical paths covered

### Phase 4: System Testing (Week 6)
- Manual exploratory testing
- Performance testing
- Security testing
- Accessibility testing

### Phase 5: Regression Testing (Week 7)
- Full regression suite execution
- Bug fix verification
- Staging environment validation

### Phase 6: User Acceptance Testing (Week 8)
- UAT with stakeholders
- Final validation
- Production readiness sign-off

---

## 8. Test Deliverables

1. **Test Plan Document** (This document)
2. **Test Cases Document** (Detailed test cases with steps and expected results)
3. **Test Execution Reports** (Daily/weekly execution summaries)
4. **Test Summary Report** (Final test execution summary)
5. **Code Coverage Reports** (Jest coverage reports)
6. **Defect Reports** (Bug tracking and defect reports)
7. **Automated Test Scripts** (Jest and Cypress test files)
8. **Test Data** (Test data sets and seed scripts)
9. **Performance Test Reports** (API and page load metrics)
10. **Security Test Report** (Security testing findings)

---

## 9. Entry and Exit Criteria

### Entry Criteria
- ✅ Code builds successfully (both frontend and backend)
- ✅ All dependencies resolved and installed
- ✅ Test environment is fully operational
- ✅ Test plan approved by stakeholders
- ✅ Initial test data seeded
- ✅ Development environment matches production configuration

### Exit Criteria
- ✅ ≥90% test cases passed
- ✅ 100% critical test cases passed
- ✅ No P0/P1 defects open
- ✅ ≥80% code coverage achieved
- ✅ 100% API endpoint coverage
- ✅ Performance benchmarks met (API <500ms, Page Load <3s)
- ✅ Security testing completed with no critical vulnerabilities
- ✅ All deliverables completed and approved

---

## 10. Risk Management

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Flaky automated tests | High | Medium | Explicit waits, retry logic, stable selectors |
| Test data inconsistency | High | High | MongoDB Memory Server, seed scripts, cleanup |
| Staging environment unavailable | Medium | High | Docker-based local environment, CI/CD fallback |
| Incomplete code coverage | Medium | Medium | Coverage gates in CI, mandatory coverage reports |
| Performance degradation | Medium | High | Performance benchmarks, automated performance tests |

---

## Appendix A: Glossary

- **White-Box Testing**: Testing with knowledge of internal code structure
- **Black-Box Testing**: Testing without knowledge of internal code structure
- **CRUD**: Create, Read, Update, Delete operations
- **JWT**: JSON Web Token for authentication
- **API**: Application Programming Interface
- **E2E**: End-to-End testing
- **CI/CD**: Continuous Integration / Continuous Deployment
- **XSS**: Cross-Site Scripting security vulnerability
- **PDF**: Portable Document Format

---

## Appendix B: Approval

**Prepared by:** Software Quality Engineering Team

**Date:** 15 December 2024

**Reviewed by:** __________________________

**Date:** __________________________

**Approved by:** __________________________

**Date:** __________________________

---

**End of Test Plan Document**
