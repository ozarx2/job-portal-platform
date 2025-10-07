import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleAuth } from '../../api';

const GoogleAuth = ({ role = 'candidate', onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const navigate = useNavigate();
  const buttonRef = useRef(null);

  // Simple role-based dashboard routing
  const getDashboardByRole = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case 'employer':
        return '/employer-dashboard';
      case 'candidate':
        return '/candidate-dashboard';
      case 'agent':
        return '/agent-dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      setIsLoading(true);
      
      
      const result = await googleAuth(response.credential, role);
      
      if (result.data && result.data.token && result.data.user) {
        // Store user data in localStorage
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        const userRole = result.data.user.role;
        const userName = result.data.user.name;
        
        console.log(`Google login successful! User: ${userName}, Role: ${userRole}`);
        
        if (onSuccess) {
          onSuccess(result.data.user, result.data.token);
        } else {
          // Default navigation
          const dashboardRoute = getDashboardByRole(userRole);
          navigate(dashboardRoute);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      if (onError) {
        onError(error.response?.data?.msg || 'Google authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        setIsScriptLoaded(true);
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google script'));
      
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    // Load Google script when component mounts
    loadGoogleScript().catch(console.error);
  }, []);

  useEffect(() => {
    if (isScriptLoaded && window.google && buttonRef.current) {
      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '828879208061-9qjg0fsumvkg9s3sd5nd8s32icgbrgts.apps.googleusercontent.com';
        console.log('Google Client ID:', clientId);
        
        if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
          console.warn('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
          if (onError) {
            onError('Google Sign-In not configured. Please contact administrator.');
          }
          return;
        }

        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false
        });

        // Render the Google sign-in button
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular'
        });
        
        console.log('Google Sign-In button rendered successfully');
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        if (onError) {
          onError('Failed to initialize Google Sign-In. Please try again.');
        }
      }
    }
  }, [isScriptLoaded]);

  return (
    <div className="w-full">
      <div 
        ref={buttonRef}
        className="w-full"
        style={{ minHeight: '40px' }}
      />
      
      {/* Fallback button if Google script doesn't load */}
      {!isScriptLoaded && (
        <button
          onClick={() => {
            if (onError) {
              onError('Google Sign-In is not available. Please use email/password login or check your internet connection.');
            }
          }}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center mt-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Signing in...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;
