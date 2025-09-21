# SolarFlowPro Deployment Guide

Complete guide to deploy your SolarFlowPro application with backend on Render and frontend on Vercel.

## 📋 Prerequisites

- Git repository with your code
- GitHub account
- Render account (free tier available)
- Vercel account (free tier available)
- PostgreSQL database (Supabase, Neon, or Render PostgreSQL)

## 🗄️ Step 1: Database Setup

### Option A: Using Supabase (Recommended)
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

### Option B: Using Render PostgreSQL
1. In Render dashboard, create a new PostgreSQL database
2. Copy the connection string from the database dashboard

### Option C: Using Neon
1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string

## 🖥️ Step 2: Deploy Backend to Render

### 2.1 Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `solarflowpro-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2.3 Set Environment Variables
Add these environment variables in Render:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `DATABASE_URL` | `your-postgres-connection-string` | From Step 1 |
| `SESSION_SECRET` | `your-secure-random-string` | Generate a secure random string |
| `PORT` | `10000` | Usually auto-set by Render |

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://your-app.onrender.com`

### 2.5 Run Database Migrations
After deployment, run migrations:
1. Go to your Render service dashboard
2. Open the "Shell" tab
3. Run: `npm run db:push`

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository

### 3.2 Configure Build Settings
Vercel should auto-detect Vite, but verify:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: `.` (leave default)

### 3.3 Set Environment Variables
Add this environment variable in Vercel:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend-app.onrender.com` |

### 3.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your frontend will be available at: `https://your-project.vercel.app`

## 🔧 Step 4: Configure CORS (Important!)

Update your backend to allow requests from your Vercel domain.

### 4.1 Install CORS middleware
```bash
npm install cors
npm install @types/cors
```

### 4.2 Update server/index.ts
Add CORS configuration:

```typescript
import cors from 'cors';

// Add after other middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Development
    'https://your-project.vercel.app', // Production
  ],
  credentials: true,
}));
```

### 4.3 Redeploy Backend
Commit changes and push to trigger redeployment on Render.

## ✅ Step 5: Testing

### 5.1 Test Backend
Visit: `https://your-backend-app.onrender.com/api/health` (if you have a health endpoint)

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Try logging in
3. Check browser console for any API errors

## 📚 Environment Files Reference

### Backend (.env for local development)
```env
NODE_ENV=development
DATABASE_URL=postgresql://username:password@host:5432/database
SESSION_SECRET=your-local-secret
PORT=5000
```

### Frontend (.env.local for local development)
```env
VITE_API_URL=http://localhost:5000
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your Vercel domain is added to CORS origins
   - Check that credentials are enabled

2. **API Calls Failing**
   - Verify `VITE_API_URL` is set correctly in Vercel
   - Check Render logs for backend errors

3. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Run migrations: `npm run db:push`

4. **Build Failures**
   - Check all dependencies are in `package.json`
   - Verify build commands are correct

### Checking Logs

**Render Backend Logs:**
1. Go to your Render service dashboard
2. Click "Logs" tab
3. Check for errors

**Vercel Frontend Logs:**
1. Go to your Vercel project dashboard
2. Click on a deployment
3. View build logs

## 🔄 Continuous Deployment

Both Render and Vercel will automatically redeploy when you push to your main branch on GitHub.

## 📱 Domain Setup (Optional)

### Custom Domain for Frontend (Vercel)
1. Go to Vercel project settings
2. Add your custom domain
3. Follow DNS configuration instructions

### Custom Domain for Backend (Render)
1. Go to Render service settings
2. Add custom domain
3. Configure DNS records

## 🔒 Security Checklist

- ✅ Use strong `SESSION_SECRET`
- ✅ Enable HTTPS (automatic on both platforms)
- ✅ Configure CORS properly
- ✅ Don't commit sensitive environment variables
- ✅ Use environment variables for all configuration

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review platform documentation:
   - [Render Docs](https://docs.render.com)
   - [Vercel Docs](https://vercel.com/docs)
3. Check your application logs on both platforms

## 🎉 Congratulations!

Your SolarFlowPro application should now be live:
- **Backend**: `https://your-backend.onrender.com`
- **Frontend**: `https://your-project.vercel.app`

Remember to update any hardcoded URLs in your application to use the new production URLs.