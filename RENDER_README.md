# SolarFlowPro Backend

## Environment Variables Required

Make sure to set these in your Render dashboard:

- `DATABASE_URL`: Your PostgreSQL connection string
- `SESSION_SECRET`: A secure random string for session encryption
- `NODE_ENV`: Set to "production"
- `PORT`: Will be automatically set by Render (usually 10000)

## Deployment Steps

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use the following settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node.js
4. Set the environment variables listed above
5. Deploy!

## Database Setup

You'll need a PostgreSQL database. You can:
1. Use Render's managed PostgreSQL service
2. Use an external service like Neon, Supabase, or Railway
3. Set the `DATABASE_URL` environment variable to your database connection string

## Health Check

Your service will be available at the URL provided by Render. The API endpoints will be accessible at:
- `https://your-app.onrender.com/api/*`