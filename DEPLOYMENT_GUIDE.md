# Deployment Guide - MERN Admin Application

## 📋 Overview

This guide covers deploying your MERN stack application (Backend + Frontend) to production. **Since you already have Render set up with a payment card, we recommend using Render for both backend and frontend** - it's simpler, cost-effective, and you're already configured!

## 🎯 Recommended Deployment Strategy

### **⭐ RECOMMENDED: Render (Both Backend & Frontend)**
**Why Render is the best choice for you:**
- ✅ **Already set up** - You have Render account with payment card configured
- ✅ **Single platform** - Manage both backend and frontend in one place
- ✅ **Cost-effective** - One platform, simpler billing
- ✅ **Auto-deploy from Git** - Automatic deployments on push
- ✅ **Free tier available** - Great for development/testing
- ✅ **Simple setup** - Less configuration needed
- ✅ **Good Node.js support** - Excellent for Express backends
- ✅ **Static site hosting** - Works well for React/Vite frontends
- ✅ **MongoDB support** - Can use MongoDB Atlas or Render's managed MongoDB
- ✅ **Environment variables** - Easy to manage
- ✅ **Custom domains** - Free SSL certificates
- ⚠️ Slightly slower cold starts (~5-10s) but acceptable for most apps

### **Alternative: Railway + Vercel**
- ✅ Railway: Excellent for Node.js/Express, built-in MongoDB support
- ✅ Vercel: Optimized for React/Vite, global CDN, faster cold starts
- ⚠️ Requires managing two platforms
- ⚠️ More setup complexity

## 🚀 Platform Comparison

| Feature | Render (Recommended) | Railway + Vercel |
|---------|---------------------|------------------|
| **Setup Complexity** | ✅ Simple (one platform) | ⚠️ Moderate (two platforms) |
| **Already Configured** | ✅ Yes (you have it!) | ❌ No |
| **Cost** | ✅ Single billing | ⚠️ Two separate bills |
| **Node.js Support** | ✅ Excellent | ✅ Excellent |
| **React/Vite Support** | ✅ Good | ✅ Excellent (Vercel) |
| **MongoDB Integration** | ✅ External (Atlas) | ✅ Built-in (Railway) |
| **Auto Deploy from Git** | ✅ Yes | ✅ Yes |
| **Environment Variables** | ✅ Easy | ✅ Easy |
| **Cold Start Time** | ~5-10s | ~2-5s (Railway), ~0.5s (Vercel) |
| **SSL/HTTPS** | ✅ Auto | ✅ Auto |
| **Custom Domains** | ✅ Yes | ✅ Yes |
| **Free Tier** | ✅ Yes | ✅ Yes |

## 📦 Deployment Setup - Render (Recommended)

### Prerequisites

1. **GitHub Repository** (already set up ✅)
2. **Render Account** (already set up ✅ with payment card)
3. **MongoDB Atlas** - [Sign up here](https://www.mongodb.com/cloud/atlas) (or use Render's managed MongoDB)

---

## 🔧 Backend Deployment (Render)

### Step 1: Create Backend Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `MUNEEBAZAM96/SQE_CRM_Project`
4. Configure the service:
   - **Name**: `mern-admin-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install` (or leave empty, Render auto-detects)
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

### Step 2: Configure Environment Variables

In Render dashboard → Your Service → **Environment** tab, add:

```env
NODE_ENV=production
PORT=10000
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this
RESEND_API=your-resend-api-key-if-using-email
```

**Important Notes:**
- **PORT**: Render uses port `10000` by default (or check your service settings)
- Replace `DATABASE` with your MongoDB Atlas connection string
- Generate a strong `JWT_SECRET` (use: `openssl rand -base64 32`)
- Get `RESEND_API` from [Resend.com](https://resend.com) if using email features

### Step 3: Update Backend Port Configuration

Render assigns a port via `PORT` environment variable. Your backend already uses `process.env.PORT || 8888`, which is good. Just ensure:
- Render sets `PORT=10000` (or whatever port Render assigns)
- Your backend listens on `process.env.PORT`

### Step 4: Get Deployment Webhook (Optional)

For GitHub Actions integration:

1. Go to Render Dashboard → Your Service → **Settings** → **Webhooks**
2. Click **"Add Webhook"**
3. Copy the webhook URL
4. Add to GitHub Secrets as `RENDER_BACKEND_DEPLOY_HOOK_URL`

### Step 5: Deploy

Render will automatically:
- ✅ Deploy on every push to `main` branch
- ✅ Build your application
- ✅ Start the service
- ✅ Provide a URL (e.g., `https://mern-admin-backend.onrender.com`)

---

## 🎨 Frontend Deployment (Render)

### Step 1: Create Frontend Static Site

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository: `MUNEEBAZAM96/SQE_CRM_Project`
4. Configure the site:
   - **Name**: `mern-admin-frontend` (or your preferred name)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment**: `Node` (version 20.9.0)

### Step 2: Configure Environment Variables

In Render dashboard → Your Site → **Environment** tab, add:

```env
VITE_BACKEND_SERVER=https://mern-admin-sqa-backend.onrender.com/
VITE_DEV_REMOTE=remote
```

**Important**: 
- Replace `VITE_BACKEND_SERVER` with your backend Render URL (from Step 5 above)
- **MUST end with `/`** (forward slash) - the config adds `/api/` automatically
- Use `VITE_BACKEND_SERVER` (NOT `VITE_API_URL`) - this is what the frontend expects
- This tells your frontend where to make API calls

### Step 3: Get Deployment Webhook (Optional)

For GitHub Actions integration:

1. Go to Render Dashboard → Your Site → **Settings** → **Webhooks**
2. Click **"Add Webhook"**
3. Copy the webhook URL
4. Add to GitHub Secrets as `RENDER_FRONTEND_DEPLOY_HOOK_URL`

### Step 4: Deploy

Render will automatically:
- ✅ Deploy on every push to `main` branch
- ✅ Build your Vite application
- ✅ Serve the static files
- ✅ Provide a URL (e.g., `https://mern-admin-frontend.onrender.com`)

---

## 🔄 Alternative: Railway + Vercel Setup

<details>
<summary>Click to expand Railway + Vercel setup instructions</summary>

### Backend Deployment (Railway)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select repository and set root directory to `backend`
4. Add environment variables (same as Render)
5. Get Railway token from Account Settings → Tokens
6. Add to GitHub Secrets: `RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID`

### Frontend Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"** → Import GitHub repository
3. Set root directory to `frontend`
4. Configure build: `npm run build`, output: `dist`
5. Add environment variables
6. Get Vercel token from Account Settings → Tokens
7. Add to GitHub Secrets: `VERCEL_TOKEN`

</details>

---

## 🚦 CI/CD Workflow

Your repository now has deployment workflows for both options:

### Render Workflows (Recommended)

#### 1. `deploy-backend-render.yml`
- Triggers Render backend deployment
- Works with Render's auto-deploy (git push)
- Optional webhook trigger

#### 2. `deploy-frontend-render.yml`
- Triggers Render frontend deployment
- Works with Render's auto-deploy (git push)
- Optional webhook trigger

#### 3. `deploy-full-stack-render.yml` ⭐ **USE THIS**
- Runs CI tests first
- Deploys both backend and frontend to Render after tests pass
- Full automation: Test → Deploy

### Alternative Workflows (Railway + Vercel)

- `deploy-backend-railway.yml`
- `deploy-frontend-vercel.yml`
- `deploy-full-stack.yml`

### Workflow Triggers

**Automatic Deployment (Render):**
- Push to `main` branch → Render auto-deploys
- GitHub Actions runs tests → If pass, triggers webhook (optional)

**Manual Deployment:**
- Go to GitHub Actions tab
- Select `deploy-full-stack-render.yml`
- Click **"Run workflow"**

---

## 🔐 Environment Variables Checklist

### Backend (Render)
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000` (Render default, or check your service)
- [ ] `DATABASE=mongodb://...` (MongoDB Atlas connection string)
- [ ] `JWT_SECRET=strong-secret-key` (generate with `openssl rand -base64 32`)
- [ ] `RESEND_API=...` (if using email)
- [ ] Any other backend-specific variables

### Frontend (Render)
- [ ] `VITE_BACKEND_SERVER=https://mern-admin-sqa-backend.onrender.com/` (MUST end with `/`)
- [ ] `VITE_DEV_REMOTE=remote`
- [ ] Any other frontend-specific variables

**Important**: Use `VITE_BACKEND_SERVER` (NOT `VITE_API_URL`) and ensure it ends with `/`

### GitHub Secrets (Optional - for webhook triggers)
- [ ] `RENDER_BACKEND_DEPLOY_HOOK_URL` (from Render service webhooks)
- [ ] `RENDER_FRONTEND_DEPLOY_HOOK_URL` (from Render site webhooks)
- [ ] `RENDER_API_KEY` (optional, for API-based deployments)

---

## 📝 Post-Deployment Steps

### 1. Update CORS Settings

In your backend (`backend/src/app.js`), ensure CORS allows your frontend domain:

```javascript
app.use(
  cors({
    origin: [
      'https://mern-admin-frontend.onrender.com', // Your Render frontend URL
      'http://localhost:5173' // for local development
    ],
    credentials: true,
  })
);
```

### 2. Test the Deployment

1. **Backend Health Check:**
   ```bash
   curl https://your-backend.onrender.com/api/health
   # or
   curl https://your-backend.onrender.com/
   ```

2. **Frontend Access:**
   - Visit your Render frontend URL
   - Test login/signup
   - Verify API calls work
   - Check browser console for errors

### 3. Set Up Custom Domains (Optional)

**Render:**
- Service/Site Settings → **Custom Domains**
- Add your domain
- Follow DNS instructions
- SSL certificate is automatically provisioned

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- ✅ Check Render service logs (Dashboard → Service → Logs)
- ✅ Verify environment variables are set correctly
- ✅ Ensure MongoDB connection string is correct
- ✅ Check PORT is set (Render uses 10000 by default)
- ✅ Verify `npm start` command works locally

**Problem**: Database connection failed
- ✅ Verify MongoDB Atlas IP whitelist (add `0.0.0.0/0` or Render IPs)
- ✅ Check connection string format
- ✅ Verify database credentials
- ✅ Test connection string locally

**Problem**: Service goes to sleep (free tier)
- ✅ Free tier services sleep after 15 minutes of inactivity
- ✅ First request after sleep takes ~30-60 seconds (cold start)
- ✅ Consider paid tier for production (no sleep)

### Frontend Issues

**Problem**: Frontend can't connect to backend
- ✅ Check `VITE_API_URL` environment variable
- ✅ Verify backend CORS settings
- ✅ Check backend is running and accessible
- ✅ Verify backend URL is correct (no trailing slash)

**Problem**: Build fails on Render
- ✅ Check build logs in Render dashboard
- ✅ Verify `package.json` scripts are correct
- ✅ Ensure all dependencies are in `package.json`
- ✅ Check Node.js version compatibility

**Problem**: Environment variables not working
- ✅ Verify variables are set in Render dashboard
- ✅ Frontend: Variables must start with `VITE_` to be accessible
- ✅ Rebuild after adding new variables

### GitHub Actions Issues

**Problem**: Deployment workflow fails
- ✅ Check GitHub Actions logs
- ✅ Verify webhook URLs are correct (if using)
- ✅ Render auto-deploys on git push, so workflows are optional
- ✅ Check workflow file syntax

---

## 📊 Monitoring & Logs

### Render Dashboard
- **Logs**: Dashboard → Service/Site → **Logs** tab (real-time)
- **Metrics**: Dashboard → Service → **Metrics** tab (CPU, Memory, Network)
- **Deployments**: Dashboard → Service/Site → **Events** tab
- **Alerts**: Set up email/Slack notifications for deployment failures

### Useful Commands

**Check service status:**
```bash
# View logs in Render dashboard
# Or use Render CLI (if installed)
render logs --service mern-admin-backend
```

**View environment variables:**
- Render Dashboard → Service/Site → Environment tab

---

## 🎯 Best Practices

1. **Never commit secrets** - Always use environment variables
2. **Test locally first** - Run `npm run build` before deploying
3. **Monitor deployments** - Check Render logs after each deployment
4. **Use staging environment** - Create separate Render services for testing
5. **Keep dependencies updated** - Regularly update `package.json`
6. **Enable branch protection** - Require CI to pass before merge
7. **Set up monitoring** - Use Render metrics and alerts
8. **Backup database** - Regular MongoDB Atlas backups
9. **Use paid tier for production** - Avoid cold starts (free tier sleeps)
10. **Set up custom domains** - Professional URLs for production

---

## 🔄 Deployment Workflow Summary

### Render (Recommended)
```
Developer pushes code to main branch
    ↓
Render detects git push
    ↓
GitHub Actions runs CI tests (optional)
    ↓
Render automatically builds and deploys
    ↓
Backend: https://your-backend.onrender.com ✅
Frontend: https://your-frontend.onrender.com ✅
    ↓
Application is live! 🎉
```

### With GitHub Actions (Full CI/CD)
```
Developer pushes code to main branch
    ↓
GitHub Actions triggers
    ↓
CI Tests run (unit, integration, E2E)
    ↓
Tests pass ✅
    ↓
GitHub Actions triggers Render webhook (optional)
    ↓
Render builds and deploys
    ↓
Application is live! 🎉
```

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Node.js Guide](https://render.com/docs/node-version)
- [Render Static Sites](https://render.com/docs/static-sites)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## ✅ Quick Start Checklist (Render)

- [x] Render account created (you have it!)
- [x] Payment card added (you have it!)
- [ ] Create MongoDB Atlas database
- [ ] Create Render Web Service (backend)
- [ ] Configure backend environment variables
- [ ] Get backend URL
- [ ] Create Render Static Site (frontend)
- [ ] Configure frontend environment variables (with backend URL)
- [ ] Update backend CORS settings
- [ ] Test backend deployment
- [ ] Test frontend deployment
- [ ] Verify full stack works end-to-end
- [ ] (Optional) Add Render webhooks to GitHub Secrets
- [ ] (Optional) Set up custom domains

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review Render documentation
3. Check Render service/site logs
4. Verify all environment variables are set correctly
5. Test locally first to isolate issues

---

## 🎉 Why Render is Perfect for You

1. **Already Configured** - You have the account and payment card set up
2. **Single Platform** - Manage everything in one dashboard
3. **Simple Setup** - Less configuration, faster deployment
4. **Cost-Effective** - One platform, one bill
5. **Auto-Deploy** - Automatic deployments on git push
6. **Good Support** - Render has excellent documentation and support

**Status**: ✅ Ready for Deployment on Render

Happy Deploying! 🚀
