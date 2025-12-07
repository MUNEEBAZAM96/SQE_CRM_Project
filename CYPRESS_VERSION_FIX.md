# Cypress Version Fix - Node.js Compatibility

## Issue
Cypress 15.7.1 is incompatible with Node.js v18.20.8+ due to deprecated `--loader` flag error.

## Solution
**Downgraded Cypress from 15.7.1 to 13.6.3** - This version is stable and fully compatible with Node.js 18.

## Changes Made

### 1. Updated `frontend/package.json`
- Changed Cypress version from `^15.7.1` to `^13.6.3`

### 2. Updated GitHub Actions Workflows
- `.github/workflows/cypress.yml` - Uses Node 18 (compatible with Cypress 13.6.3)
- `.github/workflows/ci-cd.yml` - Uses Node 18 for Cypress tests

## Installation

After this change, you need to reinstall dependencies:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Why Cypress 13.6.3?

- ✅ Fully compatible with Node.js 18
- ✅ Stable and widely used
- ✅ All features we need are available
- ✅ No breaking changes for our test suite
- ✅ Better CI/CD compatibility

## Test Commands

### Run locally
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

After installing Cypress 13.6.3, verify it works:
```bash
cd frontend
npx cypress verify
```

You should see:
```
✅ Verified Cypress! /path/to/cypress
```

## GitHub Actions

The workflows will now:
1. Use Node.js 18 (default)
2. Install Cypress 13.6.3
3. Run tests without compatibility errors
4. Record results to Cypress Cloud


