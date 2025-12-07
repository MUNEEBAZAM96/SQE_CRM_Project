# Cypress Node.js Compatibility Fix

## Issue
Cypress 15.7.1 has compatibility issues with Node.js v18.20.8+ due to deprecated `--loader` flag.

## Solution
Use Node.js v16 for Cypress tests, which is more stable and compatible.

## Local Testing

### Option 1: Use Node Version Manager (nvm)
```bash
# Install/use Node 16
nvm install 16
nvm use 16

# Run Cypress tests
cd frontend
npm run cypress:run
```

### Option 2: Run with Node 16 directly
```bash
# If you have Node 16 installed
/usr/local/bin/node16 npx cypress run --record --key b4f09d8e-71fc-47a7-b4ae-450390899a01
```

### Option 3: Update Cypress (Alternative)
If you want to use Node 18, consider downgrading Cypress:
```bash
cd frontend
npm install --save-dev cypress@13.6.3 --legacy-peer-deps
```

## GitHub Actions
The workflow has been updated to use Node.js v16 automatically.

## Test Commands

### Run locally (without recording)
```bash
cd frontend
npm run cypress:run
```

### Run with Cypress Cloud recording
```bash
cd frontend
npx cypress run --record --key b4f09d8e-71fc-47a7-b4ae-450390899a01
```

### Open Cypress GUI
```bash
cd frontend
npm run cypress:open
```

## Verification
After fixing, you should see:
- ✅ Cypress starts without errors
- ✅ Tests run successfully
- ✅ Results recorded to Cypress Cloud (if using --record)


