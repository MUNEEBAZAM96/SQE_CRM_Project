# Local Development Setup Guide

## 🚀 Quick Start - Run Locally

### Prerequisites
- Node.js 20.9.0
- npm 10.2.4
- MongoDB (local or Atlas)

---

## 📦 Step 1: Backend Setup

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
Create `backend/.env` file with:
```env
NODE_ENV=development
DATABASE=mongodb+srv://Muneeb:BT05LlGZPPvzTbl9@cluster0.jhtmzqx.mongodb.net/crm?appName=Cluster0
PORT=8888
SECRET=hackthoon
KEY=idurar
JWT_SCHEME=jwt
JWT_TOKEN_PREFIX=Bearer
JWT_SECRET=thiscanbechangedlater123654789
JWT_TOKEN_EXPIRATION=18000000
JWT_TOKEN_HASH_ALGO=SHA-256
```

### 4. Run setup (create admin user)
```bash
npm run setup
```

This creates the default admin:
- Email: `admin@admin.com`
- Password: `admin123`

### 5. Start backend server
```bash
npm start
```

Backend will run on: `http://localhost:8888`

---

## 🎨 Step 2: Frontend Setup

### 1. Open new terminal and navigate to frontend folder
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start frontend development server
```bash
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## ✅ Verify Setup

1. **Backend**: Open `http://localhost:8888` - Should see server running
2. **Frontend**: Open `http://localhost:3000` - Should see login page
3. **Login** with:
   - Email: `admin@admin.com`
   - Password: `admin123`

---

## 🔧 Troubleshooting

### Backend not starting?
- Check MongoDB connection string in `.env`
- Verify PORT 8888 is not in use
- Check backend logs for errors

### Frontend can't connect to backend?
- Ensure backend is running on port 8888
- Check browser console for errors
- Verify CORS settings in backend

### Port already in use?
- Change PORT in backend `.env` file
- Update frontend config if needed

---

## 📝 Available Scripts

### Backend
- `npm start` - Start server
- `npm run dev` - Development mode (with nodemon)
- `npm run setup` - Create admin user
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## 🎯 Quick Commands Summary

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Then open: `http://localhost:3000`

