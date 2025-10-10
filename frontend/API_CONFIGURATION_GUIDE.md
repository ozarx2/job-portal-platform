# API Configuration Guide

## Environment Variables

Create a `.env` file in the root directory with the following configuration:

```env
# Production API Configuration
VITE_API_BASE_URL=https://api.ozarx.in/api
VITE_API_URL=https://api.ozarx.in/api

# Environment
VITE_NODE_ENV=production

# CORS Configuration
VITE_CORS_ORIGIN=https://api.ozarx.in
```

## Development Configuration

For local development, use:

```env
# Development API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
VITE_CORS_ORIGIN=http://localhost:5000
```

## API Endpoints

All API endpoints have been standardized to use the base URL from environment variables:

### Auth Endpoints
- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/me` - Get current user
- `/auth/google` - Google authentication
- `/auth/forgot-password` - Forgot password
- `/auth/reset-password` - Reset password
- `/auth/resend-verification` - Resend verification email
- `/auth/preuser-login` - Pre-user login

### Job Endpoints
- `/jobs` - Get all jobs
- `/jobs/employer` - Get employer jobs
- `/jobs/active` - Get active jobs
- `/jobs` (POST) - Create job
- `/jobs/:id` (PUT) - Update job
- `/jobs/:id` (DELETE) - Delete job

### Application Endpoints
- `/applications` - Get applications
- `/applications/me` - Get my applications
- `/applications/employer` - Get employer applications
- `/applications/selected` - Get selected applications
- `/applications/apply` - Apply for job
- `/applications/:id` (PATCH) - Update application status

### Company Endpoints
- `/companies` - Get companies
- `/companies` (POST) - Create company
- `/companies/:id` (PUT) - Update company
- `/companies/:id` (DELETE) - Delete company

### CRM Endpoints
- `/crm/leads` - Get leads
- `/crm/upload` - Upload leads
- `/crm/admin/summary` - Get CRM summary
- `/crm/leads/:id/collect-email` - Collect email
- `/crm/leads/:id/convert-to-preuser` - Convert to pre-user

### Onboarding Endpoints
- `/onboarding/submit` - Submit onboarding
- `/onboarding/simple-submit` - Simple onboarding submit
- `/onboarding/status` - Get onboarding status
- `/onboarding/candidate/:userId` - Get candidate onboarding
- `/onboarding/upload-document` - Upload document

### Reports Endpoints
- `/reports/summary` - Get reports summary
- `/reports/conversion-analytics` - Get conversion analytics

### Email Endpoints
- `/email/forgot-password` - Send forgot password email
- `/email/reset-password` - Send reset password email
- `/email/newsletter/subscribe` - Subscribe to newsletter

## CORS Configuration

CORS has been configured in:
1. `vercel.json` - For production deployment
2. `vite.config.js` - For development server
3. API service configurations - For axios requests

## Usage

All API calls should now use the centralized `apiService` or import from `src/api.js`:

```javascript
import apiService from './services/apiService';
// or
import { getJobs, loginUser } from './api';

// Usage
const jobs = await apiService.getJobs();
const user = await loginUser(credentials);
```

## Testing

To test the API configuration:

1. Run `npm run dev` to start the development server
2. Check browser console for any CORS errors
3. Test API calls from different components
4. Verify environment variables are loaded correctly


