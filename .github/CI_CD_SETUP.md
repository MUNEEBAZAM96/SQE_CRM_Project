# CI/CD Pipeline Setup Guide

## Overview

This project uses GitHub Actions for Continuous Integration and Continuous Deployment. The CI/CD pipeline automatically runs tests on every push and pull request to ensure code quality and prevent regressions. After tests pass, the pipeline automatically deploys the application to production.

## 🚀 Deployment Strategy

- **Backend**: Deployed to [Railway](https://railway.app)
- **Frontend**: Deployed to [Vercel](https://vercel.com)
- **Full Documentation**: See [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md) for detailed setup instructions

## Workflows

### 1. Main CI Pipeline (`ci.yml`)
**Purpose**: Run all tests in parallel for faster feedback

**Jobs:**
- Backend Unit Tests
- Backend Integration Tests  
- Frontend E2E Tests (Cypress)
- Test Results Summary

**When it runs:**
- On push to main/develop/master branches
- On pull requests to main/develop/master branches

### 2. Test Coverage Report (`test-coverage.yml`)
**Purpose**: Generate comprehensive coverage reports

**Features:**
- Runs backend tests with coverage
- Validates coverage thresholds (≥80%)
- Uploads to Codecov
- Generates HTML coverage reports

**When it runs:**
- On push to main/develop/master branches
- On pull requests
- Manual dispatch (workflow_dispatch)

### 3. Full Test Suite (`full-test-suite.yml`)
**Purpose**: Complete test execution with matrix strategy

**Features:**
- Matrix testing for parallel execution
- MongoDB service container
- Daily scheduled runs (2 AM UTC)
- Comprehensive test coverage

**When it runs:**
- On push to main/develop/master branches
- On pull requests
- Daily at 2 AM UTC (scheduled)
- Manual dispatch

### 4. Simplified CI (`ci-simple.yml`)
**Purpose**: Streamlined CI for quick feedback

**Features:**
- Sequential test execution
- MongoDB service container
- Simplified server startup
- Faster execution for small changes

### 5. Backend Deployment (`deploy-backend-railway.yml`)
**Purpose**: Deploy backend to Railway after tests pass

**Features:**
- Automatic deployment on push to main
- Manual deployment trigger
- Railway CLI integration
- Environment-specific deployments

**When it runs:**
- On push to main/master (backend changes only)
- Manual workflow dispatch

### 6. Frontend Deployment (`deploy-frontend-vercel.yml`)
**Purpose**: Deploy frontend to Vercel after tests pass

**Features:**
- Automatic deployment on push to main
- Manual deployment trigger
- Vercel CLI integration
- Production and preview deployments

**When it runs:**
- On push to main/master (frontend changes only)
- Manual workflow dispatch

### 7. Full Stack Deployment (`deploy-full-stack.yml`)
**Purpose**: Complete CI/CD pipeline - test then deploy

**Features:**
- Runs all CI tests first
- Deploys backend to Railway (if tests pass)
- Deploys frontend to Vercel (if tests pass)
- Deployment summary report

**When it runs:**
- On push to main/master
- Manual workflow dispatch

## Setup Instructions

### 1. Enable GitHub Actions
GitHub Actions are automatically enabled when you push the `.github/workflows/` directory to your repository.

### 2. Configure Environment Variables (Optional)
If you need to use Codecov or other services, add secrets in:
- Repository Settings → Secrets and variables → Actions

**Optional Secrets:**
- `CODECOV_TOKEN`: For private repository coverage tracking

### 3. Verify Workflow Files
Ensure all workflow files are in `.github/workflows/`:
- `ci.yml`
- `test-coverage.yml`
- `full-test-suite.yml`
- `ci-simple.yml`

## Test Execution

### Backend Tests
```bash
# Unit tests
cd backend
npm run test:unit

# Integration tests
npm run test:integration

# All tests with coverage
npm run test:coverage
```

### Frontend E2E Tests
```bash
# Install Cypress
cd frontend
npm ci
npx cypress install

# Run tests (requires backend server running)
npx cypress run
```

## Coverage Reports

### Viewing Coverage
1. **GitHub Actions**: Check the workflow run artifacts
2. **Codecov**: Visit codecov.io (if configured)
3. **Local**: Run `npm run test:coverage` and open `coverage/lcov-report/index.html`

### Coverage Thresholds
The project enforces:
- **Branches**: ≥80%
- **Functions**: ≥80%
- **Lines**: ≥80%
- **Statements**: ≥80%

## Troubleshooting

### Backend Server Not Starting
**Issue**: Backend server fails to start in CI

**Solutions**:
1. Check MongoDB connection string in `.env`
2. Verify PORT is set correctly (default: 3000)
3. Check server logs in artifacts
4. Ensure JWT_SECRET is set

### Cypress Tests Failing
**Issue**: Cypress tests fail in CI but pass locally

**Solutions**:
1. Check backend server is running and accessible
2. Verify baseUrl in `cypress.config.ts` matches CI port
3. Review screenshots/videos in artifacts
4. Add appropriate waits for async operations
5. Check for flaky tests

### Coverage Not Uploading
**Issue**: Coverage reports not appearing

**Solutions**:
1. Verify LCOV file is generated: `backend/coverage/lcov.info`
2. Check file paths in workflow configuration
3. Ensure Codecov token is set (for private repos)
4. Check workflow logs for errors

### MongoDB Connection Issues
**Issue**: Tests fail due to MongoDB connection

**Solutions**:
1. Verify MongoDB service is running in workflow
2. Check connection string format
3. Ensure MongoDB health checks pass
4. Review MongoDB service logs

## Best Practices

### 1. Test Locally First
Always run tests locally before pushing:
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npx cypress run
```

### 2. Check Workflow Status
Monitor workflow status in GitHub Actions tab:
- Green checkmark: All tests passed
- Red X: Tests failed (review logs)
- Yellow circle: Tests in progress

### 3. Review Artifacts
Download and review artifacts for:
- Coverage reports
- Cypress screenshots (on failure)
- Cypress videos
- Test logs

### 4. Fix Failing Tests
When tests fail:
1. Review error messages in workflow logs
2. Check artifacts for screenshots/videos
3. Reproduce locally
4. Fix the issue
5. Push fix and verify CI passes

## Workflow Status Badge

Add a status badge to your README:

```markdown
![CI](https://github.com/your-username/your-repo/workflows/CI%20Pipeline/badge.svg)
```

## Daily Scheduled Runs

The `full-test-suite.yml` workflow runs daily at 2 AM UTC to:
- Catch regressions early
- Monitor test stability
- Track coverage trends over time

## Manual Workflow Dispatch

To manually trigger a workflow:
1. Go to Actions tab
2. Select the workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Deployment Setup

### Required Secrets

Add these secrets in GitHub → Settings → Secrets and variables → Actions:

**For Railway (Backend):**
- `RAILWAY_TOKEN`: Your Railway API token
- `RAILWAY_PROJECT_ID`: Your Railway project ID
- `RAILWAY_SERVICE_ID`: Your Railway service ID (optional)

**For Vercel (Frontend):**
- `VERCEL_TOKEN`: Your Vercel API token

### Setup Instructions

1. **Railway Setup:**
   - Create account at [railway.app](https://railway.app)
   - Create new project from GitHub repo
   - Set root directory to `backend`
   - Get token from Account Settings → Tokens
   - Get Project ID from Project Settings

2. **Vercel Setup:**
   - Create account at [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Set root directory to `frontend`
   - Get token from Account Settings → Tokens

3. **Add Secrets:**
   - Add all required secrets to GitHub repository
   - See [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md) for detailed steps

## Next Steps

1. **Push workflows to repository**: The workflows will automatically activate
2. **Set up deployment platforms**: Railway (backend) and Vercel (frontend)
3. **Add GitHub secrets**: Required tokens for deployment
4. **Monitor first run**: Check the Actions tab for initial execution
5. **Review results**: Verify all tests pass and deployments succeed
6. **Configure Codecov** (optional): For coverage tracking
7. **Set up branch protection** (optional): Require CI to pass before merge

## Support

For issues or questions:
1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Check test logs and artifacts
4. Review TEST_PLAN.md for test details

