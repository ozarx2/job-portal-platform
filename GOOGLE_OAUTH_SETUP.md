# Google OAuth Setup Guide

This guide will help you set up Google OAuth for your job portal platform.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required fields:
   - App name: "Ozarx Job Portal"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Add test users (for development) or publish the app (for production)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `http://localhost:5173` (for Vite development)
   - Your production domain (e.g., `https://ozarx.in`)
5. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production domain (e.g., `https://ozarx.in`)

## Step 4: Configure Environment Variables

### Backend (.env file)
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### Frontend (.env file)
```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Note:** Use the same Client ID for both backend and frontend.

## Step 5: Install Dependencies

### Backend
```bash
cd backend
npm install google-auth-library
```

### Frontend
```bash
cd frontend
npm install react-google-login
```

## Step 6: Test the Integration

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to the login/signup page
4. Click the "Sign in with Google" button
5. Complete the Google OAuth flow

## Features Implemented

✅ **Backend:**
- Google OAuth service (`backend/services/googleAuthService.js`)
- Google OAuth route (`/api/auth/google`)
- User model updated with Google OAuth fields
- Automatic user creation/linking for Google users

✅ **Frontend:**
- Google OAuth component (`frontend/src/components/auth/GoogleAuth.jsx`)
- Updated login form with Google sign-in
- Updated signup form with Google sign-up
- Automatic role-based dashboard routing

## Security Notes

- Google emails are automatically verified
- Users can link Google accounts to existing accounts
- JWT tokens are generated for Google-authenticated users
- All existing authentication middleware works with Google users

## Troubleshooting

### Common Issues:

1. **"Invalid client" error:**
   - Check that your Client ID is correct
   - Ensure the domain is added to authorized origins

2. **"Access blocked" error:**
   - Make sure your OAuth consent screen is properly configured
   - Add test users if in development mode

3. **CORS errors:**
   - Ensure your frontend domain is in the authorized origins
   - Check that your backend CORS configuration allows your frontend domain

### Getting Help:

- Check the browser console for detailed error messages
- Verify your environment variables are loaded correctly
- Ensure all dependencies are installed

## Production Deployment

For production deployment:

1. Update authorized origins and redirect URIs in Google Cloud Console
2. Set environment variables in your production environment
3. Ensure your domain is verified in Google Cloud Console
4. Publish your OAuth consent screen if required

---

**Need help?** Check the Google OAuth documentation: https://developers.google.com/identity/oauth2/web/guides/overview












