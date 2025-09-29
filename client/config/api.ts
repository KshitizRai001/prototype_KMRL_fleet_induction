// API configuration for different environments
const isDev = import.meta.env.DEV;

// In development, use the Replit domain for the backend
// In production, this would be configured differently
const getApiBaseUrl = () => {
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
  
  // Production would use environment variables or similar
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();