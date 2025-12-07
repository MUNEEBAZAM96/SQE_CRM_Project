# GitHub Actions CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and continuous deployment.

## Workflows

### 1. `ci.yml` - Main CI Pipeline
**Triggers:** Push and Pull Requests to main/develop/master branches

**Jobs:**
- **Backend Unit Tests**: Runs unit tests for backend code
- **Backend Integration Tests**: Runs integration tests for API endpoints
- **Frontend E2E Tests**: Runs Cypress end-to-end tests
- **Test Results Summary**: Aggregates test results and generates summary

**Features:**
- Parallel test execution for faster CI
- Coverage report generation and upload
- Artifact storage for test results
- Codecov integration for coverage tracking

### 2. `test-coverage.yml` - Coverage Report Generation
**Triggers:** Push, Pull Requests, Manual dispatch

**Purpose:**
- Generates comprehensive coverage reports
- Validates coverage thresholds (≥80%)
- Uploads coverage to Codecov
- Creates HTML coverage reports as artifacts

### 3. `full-test-suite.yml` - Complete Test Suite
**Triggers:** Push, Pull Requests, Daily schedule (2 AM UTC), Manual dispatch

**Jobs:**
- **Backend Tests**: Matrix strategy for unit and integration tests
- **Frontend E2E**: Cypress tests with MongoDB service
- **Test Summary**: Aggregated test results

**Features:**
- Matrix testing for parallel execution
- MongoDB service container for integration tests
- Comprehensive test coverage
- Daily scheduled runs for regression testing

## Test Execution Flow

```
┌─────────────────┐
│  Code Push/PR   │
└────────┬────────┘
         │
         ├───► Backend Unit Tests
         │         └──► Coverage Report
         │
         ├───► Backend Integration Tests
         │         └──► Coverage Report
         │
         ├───► Frontend E2E Tests (Cypress)
         │         ├──► Start Backend Server
         │         ├──► Run Cypress Tests
         │         └──► Upload Screenshots/Videos
         │
         └───► Test Summary
                   └──► Pass/Fail Status
```

## Coverage Reports

Coverage reports are generated in LCOV format and uploaded to:
- **Codecov**: For coverage tracking and trends
- **Artifacts**: For download and local viewing
- **HTML Reports**: Available in artifacts for detailed analysis

## Environment Variables

The workflows use the following environment variables:
- `NODE_VERSION`: 20.9.0
- `NPM_VERSION`: 10.2.4
- `NODE_ENV`: test (for test execution)
- `PORT`: 3000 (for backend server)
- `MONGODB_URI`: mongodb://localhost:27017/test

## Artifacts

The following artifacts are generated and stored:
- `backend-unit-coverage`: Backend unit test coverage reports
- `backend-integration-coverage`: Backend integration test coverage reports
- `cypress-screenshots`: Screenshots from failed Cypress tests
- `cypress-videos`: Videos of Cypress test execution
- `coverage-report`: Combined coverage HTML reports

## Coverage Thresholds

The project enforces the following coverage thresholds:
- **Branches**: ≥80%
- **Functions**: ≥80%
- **Lines**: ≥80%
- **Statements**: ≥80%

## Troubleshooting

### Backend Tests Failing
1. Check MongoDB connection (for integration tests)
2. Verify environment variables are set correctly
3. Check test timeout settings
4. Review test logs in GitHub Actions

### Cypress Tests Failing
1. Verify backend server is running and accessible
2. Check Cypress screenshots/videos in artifacts
3. Verify baseUrl in `cypress.config.ts`
4. Check for flaky tests and add appropriate waits

### Coverage Not Uploading
1. Verify LCOV file is generated in `backend/coverage/`
2. Check Codecov token (if using private repo)
3. Verify file paths in workflow configuration

## Manual Workflow Dispatch

You can manually trigger workflows:
1. Go to Actions tab in GitHub
2. Select the workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Daily Scheduled Runs

The `full-test-suite.yml` workflow runs daily at 2 AM UTC to:
- Catch regressions early
- Monitor test stability
- Track coverage trends

