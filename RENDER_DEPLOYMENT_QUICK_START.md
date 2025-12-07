# Render Deployment - Quick Start Guide

Since you already have Render set up with a payment card, here's the fastest way to deploy your MERN app!

## 🚀 Quick Setup (5 Steps)

### Step 1: Create MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
4. Whitelist IP: `0.0.0.0/0` (allow all IPs)

### Step 2: Deploy Backend (2 minutes)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo: `MUNEEBAZAM96/SQE_CRM_Project`
4. Configure:
   - **Name**: `mern-admin-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE=mongodb+srv://... (from Step 1)
   JWT_SECRET=your-secret-key-here
   ```
6. Click **"Create Web Service"**
7. Wait for deployment (~2-3 minutes)
8. Copy your backend URL: `https://mern-admin-backend.onrender.com`

### Step 3: Deploy Frontend (2 minutes)
1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect same GitHub repo
3. Configure:
   - **Name**: `mern-admin-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variables:
   ```
   VITE_API_URL=https://mern-admin-backend.onrender.com
   ```
   (Use the URL from Step 2)
5. Click **"Create Static Site"**
6. Wait for deployment (~2-3 minutes)
7. Copy your frontend URL: `https://mern-admin-frontend.onrender.com`

### Step 4: Update Backend CORS
1. Go to your backend service in Render
2. Open `backend/src/app.js` in your code editor
3. Update CORS to include your frontend URL:
   ```javascript
   app.use(
     cors({
       origin: [
         'https://mern-admin-frontend.onrender.com',
         'http://localhost:5173'
       ],
       credentials: true,
     })
   );
   ```
4. Commit and push - Render will auto-deploy

### Step 5: Test!
1. Visit your frontend URL
2. Test login/signup
3. Check browser console for errors
4. Verify API calls work

## ✅ Done!

Your app is now live on Render! 🎉

## 🔄 Auto-Deploy

Render automatically deploys when you push to `main` branch. No GitHub Actions needed (but you can use them for CI/CD).

## 💡 Pro Tips

1. **Free Tier Sleep**: Free services sleep after 15 min inactivity. First request takes ~30s.
2. **Paid Tier**: $7/month removes sleep (recommended for production)
3. **Custom Domain**: Add in Render settings → Custom Domains
4. **Logs**: Check Render dashboard → Logs tab for debugging

## 🆘 Troubleshooting

**Backend not starting?**
- Check Render logs
- Verify environment variables
- Test MongoDB connection string locally

**Frontend can't connect?**
- Verify `VITE_API_URL` is correct
- Check backend CORS settings
- Ensure backend is running

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.

