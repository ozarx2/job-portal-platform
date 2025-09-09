# Job Portal Platform - Vercel Deployment Guide

## 🚀 Frontend Deployment to Vercel

### Prerequisites
- Vercel account (free tier available)
- GitHub repository with your code
- Backend API deployed (separate service)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done)
2. **Ensure your frontend is in the `frontend` folder**
3. **Verify build configuration** is correct

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: job-portal-frontend
# - Directory: ./
# - Override settings? N
```

#### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set **Root Directory** to `frontend`
5. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Environment Variables

In Vercel dashboard, go to your project → Settings → Environment Variables:

```
VITE_API_BASE_URL = https://your-backend-api-url.com/api
```

**Important**: Replace with your actual backend API URL

### Step 4: Backend Deployment Options

#### Option A: Deploy Backend to Vercel (Serverless)
1. Create `api` folder in your project root
2. Move backend files to `api` folder
3. Create `vercel.json` in root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

#### Option B: Deploy Backend Separately
- **Railway**: railway.app
- **Render**: render.com
- **Heroku**: heroku.com
- **DigitalOcean App Platform**: digitalocean.com

### Step 5: Update API URLs

After backend deployment, update your environment variables:

```bash
# In Vercel dashboard
VITE_API_BASE_URL = https://your-deployed-backend.com/api
```

### Step 6: Test Deployment

1. Visit your Vercel URL
2. Test all functionality:
   - User registration/login
   - Dashboard access
   - Lead management
   - File uploads

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Node.js version (use 18.x)
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

2. **API Calls Fail**
   - Verify VITE_API_BASE_URL is set correctly
   - Check CORS settings in backend
   - Ensure backend is deployed and accessible

3. **Routing Issues**
   - Verify vercel.json configuration
   - Check React Router setup

### Environment Variables Checklist:
- [ ] VITE_API_BASE_URL (backend API URL)
- [ ] Any other environment variables your app needs

## 📱 Mobile Responsiveness

Your app should work on mobile devices. Test on:
- iOS Safari
- Android Chrome
- Various screen sizes

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure properly for production
3. **JWT Secrets**: Use strong, unique secrets
4. **HTTPS**: Vercel provides this automatically

## 📊 Performance Optimization

1. **Code Splitting**: Already configured in vite.config.js
2. **Image Optimization**: Use Vercel's Image Optimization
3. **Caching**: Configure appropriate cache headers

## 🎉 Success!

Once deployed, your job portal will be available at:
`https://your-project-name.vercel.app`

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints separately
4. Check browser console for errors

