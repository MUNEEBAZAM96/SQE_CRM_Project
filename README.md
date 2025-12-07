# MERN Admin CRM/ERP Application

<div align="center">
    <a href="https://www.idurarapp.com/">
  <img src="https://avatars.githubusercontent.com/u/50052356?s=200&v=4" width="128px" />
    </a>
    <h1>Open Source ERP / CRM Accounting Invoice Quote</h1>
    <p align="center">
        <p>IDURAR ERP CRM | Simple To Use</p>
    </p>
</div>

**🚀 Self-hosted Enterprise Version** : [https://cloud.idurarapp.com](https://cloud.idurarapp.com/)

IDURAR is Open Source ERP / CRM (Invoice / Quote / Accounting) Based on Advanced MERN Stack (Node.js / Express.js / MongoDB / React.js) with Ant Design (AntD) and Redux.

## Features

- Invoice Management
- Payment Management
- Quote Management
- Customer Management
- Lead Management
- Product Management
- Admin Management
- Ant Design Framework (AntD)
- Based on MERN Stack (Node.js / Express.js / MongoDB / React.js)

### Commercial Use

Yes, you can use IDURAR for free for personal or commercial use.

## Tech Stack

- **Backend**: Node.js 20.9.0, Express.js, MongoDB
- **Frontend**: React.js, Vite, Ant Design, Redux
- **Testing**: Jest, Cypress
- **CI/CD**: GitHub Actions
- **Deployment**: Render

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm 10.2.4 or higher
- MongoDB (local or Atlas)

### Local Development Setup

#### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `backend/` directory:
```env
NODE_ENV=development
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/crm?appName=Cluster0
PORT=8888
SECRET=hackthoon
KEY=idurar
JWT_SCHEME=jwt
JWT_TOKEN_PREFIX=Bearer
JWT_SECRET=thiscanbechangedlater123654789
JWT_TOKEN_EXPIRATION=18000000
JWT_TOKEN_HASH_ALGO=SHA-256
RESEND_API=your-resend-api-key-if-using-email
```

4. Run setup (creates default admin user):
```bash
npm run setup
```

Default admin credentials:
- Email: `admin@admin.com`
- Password: `admin123`

5. Start backend server:
```bash
npm start
```

Backend will run on: `http://localhost:8888`

#### Frontend Setup

1. Open new terminal and navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `frontend/` directory (for local development):
```env
VITE_BACKEND_SERVER=http://localhost:8888/
VITE_DEV_REMOTE=local
```

4. Start frontend development server:
```bash
npm run dev
```

Frontend will run on: `http://localhost:3000`

### Verify Setup

1. **Backend**: Open `http://localhost:8888/health` - Should return JSON response
2. **Frontend**: Open `http://localhost:3000` - Should see login page
3. **Login** with default credentials:
   - Email: `admin@admin.com`
   - Password: `admin123`

## Available Scripts

### Backend
- `npm start` - Start server
- `npm run dev` - Development mode (with nodemon)
- `npm run setup` - Create admin user
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:coverage` - Run tests with coverage report

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## CI/CD Pipeline

This project uses **GitHub Actions** for Continuous Integration and Continuous Deployment.

### CI/CD Architecture

```
Developer pushes code to GitHub
    ↓
GitHub Actions triggers workflows
    ↓
CI Phase: Automated Testing
    ├── Backend Unit Tests
    ├── Backend Integration Tests
    ├── Frontend E2E Tests (Cypress)
    └── Test Coverage Analysis
    ↓
Tests Pass? ✅
    ↓
CD Phase: Automated Deployment
    ├── Deploy Backend to Render
    └── Deploy Frontend to Render
    ↓
Application Live in Production 🚀
```

### GitHub Actions Workflows

#### 1. Main CI Pipeline (`ci.yml`)
**Purpose**: Primary continuous integration workflow for automated testing

**Features**:
- Runs on every push and pull request to `main`, `develop`, `master` branches
- Parallel test execution for faster feedback
- Three parallel jobs:
  - Backend Unit Tests
  - Backend Integration Tests
  - Frontend E2E Tests (Cypress)
- Test results summary generation
- Coverage report uploads

**Triggers**:
- Push to main/develop/master branches
- Pull requests to main/develop/master branches

#### 2. Test Coverage Report (`test-coverage.yml`)
**Purpose**: Generate comprehensive test coverage reports

**Features**:
- Runs backend tests with coverage instrumentation
- Validates coverage thresholds
- Uploads coverage to Codecov
- Generates HTML coverage reports
- Stores coverage artifacts for 30 days

**Coverage Thresholds**:
- Branch coverage: ≥50%
- Function coverage: ≥65%
- Line coverage: ≥70%
- Statement coverage: ≥70%

#### 3. Full Test Suite (`full-test-suite.yml`)
**Purpose**: Comprehensive test suite with matrix strategy

**Features**:
- Matrix strategy for testing across different configurations
- Daily scheduled runs (2 AM UTC)
- MongoDB service container integration
- Complete test coverage

**Triggers**:
- Daily at 2 AM UTC (automated regression testing)
- On push to main/develop/master
- Manual workflow dispatch

#### 4. Simplified CI (`ci-simple.yml`)
**Purpose**: Quick CI pipeline for fast feedback

**Features**:
- Fast execution
- Essential tests only
- Quick failure detection

#### 5. Backend Deployment (`deploy-backend-render.yml`)
**Purpose**: Deploy backend to Render platform

**Features**:
- Automatic deployment on push to main (backend changes)
- Manual deployment option available
- Webhook integration for deployment triggers

**Triggers**:
- Push to main/master (when backend files change)
- Manual workflow dispatch

#### 6. Frontend Deployment (`deploy-frontend-render.yml`)
**Purpose**: Deploy frontend to Render platform

**Features**:
- Automatic deployment on push to main (frontend changes)
- Manual deployment option available
- Webhook integration for deployment triggers

**Triggers**:
- Push to main/master (when frontend files change)
- Manual workflow dispatch

#### 7. Full Stack Deployment (`deploy-full-stack-render.yml`)
**Purpose**: Complete CI/CD pipeline (test then deploy)

**Features**:
- Runs all tests first
- Deploys backend and frontend after tests pass
- Deployment summary generation

**Workflow**:
1. Run CI tests
2. Deploy backend to Render
3. Deploy frontend to Render
4. Generate deployment summary

### CI/CD Configuration

#### Environment Variables for CI

The workflows use the following environment variables:

**Backend Tests**:
- `NODE_ENV=test`
- `DATABASE=mongodb://localhost:27017/test`
- `JWT_SECRET=test-secret-key-for-ci`
- `PORT=3000`

**Frontend Tests**:
- `CYPRESS_BASE_URL=http://localhost:3000`
- `TERM=xterm`

#### MongoDB Service Container

All workflows use MongoDB service container for integration tests:
- Version: MongoDB 7.0
- Port: 27017
- Database: test

### Test Coverage

The project maintains the following coverage thresholds:
- **Branch Coverage**: ≥50%
- **Function Coverage**: ≥65%
- **Line Coverage**: ≥70%
- **Statement Coverage**: ≥70%

Coverage reports are generated and uploaded to:
- Codecov (for tracking over time)
- GitHub Actions artifacts (for download)

## Deployment

### Render Deployment (Recommended)

This project is configured to deploy to **Render** platform.

#### Backend Deployment

1. **Create Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Configure:
     - **Name**: `mern-admin-backend`
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free (or paid)

2. **Environment Variables**:
```env
NODE_ENV=production
PORT=10000
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
RESEND_API=your-resend-api-key-if-using-email
SECRET=hackthoon
KEY=idurar
JWT_SCHEME=jwt
JWT_TOKEN_PREFIX=Bearer
JWT_TOKEN_EXPIRATION=18000000
JWT_TOKEN_HASH_ALGO=SHA-256
```

3. **Deployment Webhook** (Optional):
   - Go to Service Settings → Webhooks
   - Copy webhook URL
   - Add to GitHub Secrets as `RENDER_BACKEND_DEPLOY_HOOK_URL`

#### Frontend Deployment

1. **Create Static Site**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Static Site"
   - Connect GitHub repository
   - Configure:
     - **Name**: `mern-admin-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
     - **Environment**: Node 20.9.0

2. **Environment Variables**:
```env
VITE_BACKEND_SERVER=https://your-backend-service.onrender.com/
VITE_DEV_REMOTE=remote
```

**Important**: 
- Replace `VITE_BACKEND_SERVER` with your backend Render URL
- **MUST end with `/`** (forward slash)
- Use `VITE_BACKEND_SERVER` (NOT `VITE_API_URL`)

3. **Deployment Webhook** (Optional):
   - Go to Site Settings → Webhooks
   - Copy webhook URL
   - Add to GitHub Secrets as `RENDER_FRONTEND_DEPLOY_HOOK_URL`

### Auto-Deployment

Render automatically deploys when you push to `main` branch. No GitHub Actions needed (but you can use them for CI/CD).

### Deployment Workflow

1. Developer pushes code to `main` branch
2. GitHub Actions runs CI tests
3. If tests pass, deployment workflows trigger
4. Render receives webhook (or auto-deploys)
5. Render builds and deploys application
6. Application is live

## Testing

### Backend Tests

**Unit Tests**:
```bash
cd backend
npm run test:unit
```

**Integration Tests**:
```bash
cd backend
npm run test:integration
```

**All Tests with Coverage**:
```bash
cd backend
npm run test:coverage
```

### Frontend Tests

**E2E Tests (Cypress)**:
```bash
cd frontend
npx cypress run
```

**Cypress Interactive Mode**:
```bash
cd frontend
npx cypress open
```

### Test Coverage

View coverage reports:
- HTML: `backend/coverage/lcov-report/index.html`
- LCOV: `backend/coverage/lcov.info`

## Project Structure

```
mern-admin/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── router/
│   ├── cypress/
│   │   └── e2e/
│   └── package.json
└── .github/
    └── workflows/
        ├── ci.yml
        ├── deploy-backend-render.yml
        ├── deploy-frontend-render.yml
        └── ...
```

## Troubleshooting

### Backend Issues

**Backend not starting?**
- Check MongoDB connection string in `.env`
- Verify PORT is not in use
- Check backend logs for errors

**MongoDB connection failed?**
- Verify connection string is correct
- Check network connectivity
- Ensure MongoDB Atlas IP whitelist includes your IP

### Frontend Issues

**Frontend can't connect to backend?**
- Ensure backend is running
- Check `VITE_BACKEND_SERVER` in frontend `.env`
- Verify CORS settings in backend
- Check browser console for errors

**Build fails?**
- Clear `node_modules` and reinstall
- Check Node.js version (20.9.0)
- Verify all dependencies are installed

### CI/CD Issues

**Tests failing in CI?**
- Check test logs in GitHub Actions
- Verify environment variables are set
- Ensure MongoDB service container is running
- Check coverage thresholds

**Deployment failing?**
- Verify Render environment variables
- Check Render deployment logs
- Ensure webhook URLs are correct (if using)
- Verify build commands are correct

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Guidelines

- Use clear, descriptive commit messages
- Follow conventional commit format when possible
- Reference issue numbers in commits

### Coding Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## License

IDURAR is Free Open Source Released under the GNU Affero General Public License v3.0.

## Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub
- **Enterprise Version**: [https://cloud.idurarapp.com](https://cloud.idurarapp.com)

## Show your support

Don't forget to give a ⭐️ to this project ... Happy coding!

---

**Built with ❤️ using MERN Stack**
