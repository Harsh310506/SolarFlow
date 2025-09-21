# SolarFlowPro Frontend - Vercel Deployment

## Prerequisites

1. Your backend should be deployed on Render first
2. Get the backend URL from Render (e.g., `https://your-app.onrender.com`)

## Deployment Steps

### 1. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository

### 2. Configure Build Settings

Vercel should automatically detect it's a Vite project, but verify these settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables

In the Vercel dashboard, add these environment variables:

- `VITE_API_URL`: Your Render backend URL (e.g., `https://your-backend-app.onrender.com`)

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Important Notes

### CORS Configuration

Make sure your backend (on Render) allows requests from your Vercel domain. You may need to update CORS settings in your Express server.

### Domain Configuration

After deployment, your frontend will be available at:
- `https://your-project.vercel.app`

### Environment Variables

The frontend will automatically use:
- Relative URLs (`/api/*`) in development
- Full backend URLs (`https://your-backend.onrender.com/api/*`) in production

## Troubleshooting

1. **API calls failing**: Check if `VITE_API_URL` is set correctly
2. **CORS errors**: Configure CORS on your backend to allow your Vercel domain
3. **Build failures**: Check if all dependencies are properly listed in `package.json`

## Local Development

For local development with deployed backend:
```bash
# Create .env.local file
echo "VITE_API_URL=https://your-backend-app.onrender.com" > .env.local

# Run development server
npm run dev
```