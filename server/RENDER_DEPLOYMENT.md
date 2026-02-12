# Render Deployment Guide for Weather Platform

This guide provides step-by-step instructions for deploying the Weather Platform server on Render.

## Prerequisites

1. **Render Account**: Create an account at [render.com](https://render.com)
2. **MongoDB Atlas**: You'll need a MongoDB Atlas account for the database
3. **OpenWeatherMap API Key**: Get a free API key from [openweathermap.org](https://openweathermap.org/api)

## Step 1: Prepare Your Repository

Ensure your repository has the following files in the `server/` directory:

- ✅ `package.json` - Already configured with start script
- ✅ `Procfile` - Created for web service
- ✅ `.env.example` - Updated with production variables

## Step 2: Set Up MongoDB Atlas

1. Create a free MongoDB Atlas account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a new cluster (free tier)
3. Create a database user with read/write permissions
4. Network Access: Allow access from anywhere (0.0.0.0/0) for Render
5. Get your connection string (click "Connect" → "Connect your application")
   - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/weather-app?retryWrites=true&w=majority`

## Step 3: Deploy to Render

### Option A: Deploy from GitHub (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `weather-platform-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

### Option B: Deploy from CLI

```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy --repo https://github.com/your-username/your-repo.git --root server
```

## Step 4: Configure Environment Variables

In the Render dashboard, go to your service → "Environment" tab and add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | (Leave empty - Render sets this) |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `WEATHER_API_KEY` | Your OpenWeatherMap API key |
| `WEATHER_API_BASE_URL` | `https://api.openweathermap.org/data/2.5` |
| `SYNC_INTERVAL_MINUTES` | `15` |

**Important**: Never commit `.env` files with real credentials to GitHub!

## Step 5: Verify Deployment

1. Once deployed, Render will provide a URL (e.g., `https://weather-platform-api.onrender.com`)
2. Test the health endpoint: `https://your-app.onrender.com/health`
3. You should see:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "syncService": {...}
   }
   ```

## Step 6: Deploy the Client (Optional)

For a full-stack deployment, you'll need to either:

### Option A: Deploy Client Separately (Vercel/Netlify)

1. Deploy the `client/` folder to Vercel or Netlify
2. Set the environment variable:
   - `VITE_API_URL`: `https://your-render-api.onrender.com/api/locations`

### Option B: Configure Render for Full-Stack

Create a `server/static` endpoint to serve the built client:

```javascript
// In app.js, add after your API routes:
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

Then update your package.json build script to build the client first.

## Troubleshooting

### Health Check Fails
- Check that MongoDB Atlas IP whitelist includes Render's IPs (or 0.0.0.0/0)
- Verify `MONGODB_URI` is correct and credentials are right

### Weather API Errors
- Ensure `WEATHER_API_KEY` is valid and has not hit rate limits
- Check OpenWeatherMap API status at [openweathermap.org/api/one-call-3](https://openweathermap.org/api/one-call-3)

### Slow Startup
- The first request may be slow due to cold starts (free tier)
- Consider upgrading to a paid plan for always-on instances

### CORS Issues
- Ensure CORS is configured in `app.js` (already enabled by default)
- Client requests must go to the correct Render API URL

## Monitoring

- View logs in Render Dashboard → your service → "Logs"
- Use the `/health` endpoint for uptime monitoring services
- Consider setting up alerts in Render for service outages

## Security Recommendations

1. 🔒 Keep `NODE_ENV=production` in production
2. 🔒 Use Render's secret store for sensitive environment variables
3. 🔒 Regularly rotate your MongoDB Atlas and API keys
4. 🔒 Consider rate limiting on the `/api` endpoints
5. 🔒 Enable Render's built-in DDoS protection

## Next Steps

- Set up a custom domain in Render settings
- Configure HTTPS (automatic with Render)
- Set up staging and production environments
- Implement CI/CD pipeline with GitHub Actions
