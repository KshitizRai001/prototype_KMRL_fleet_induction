// API configuration for different environments
const isDev = import.meta.env.DEV;
const isNetlify = window.location.hostname.includes('.netlify.app');

// Environment-aware API base URL configuration
const getApiBaseUrl = () => {
  // Production on Netlify - use Netlify Functions
  if (isNetlify || import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';
  }
  
  // Development environments
  if (isDev) {
    // Use the current domain but with port 8000 for the backend
    const currentDomain = window.location.hostname;
    const isReplit = currentDomain.includes('replit.dev');
    
    if (isReplit) {
      // For Replit, use the same domain but with port 8000
      return `https://${currentDomain}:8000`;
    } else {
      // Fallback for localhost development
      return 'http://localhost:8000';
    }
  }
  
  // Default fallback
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();