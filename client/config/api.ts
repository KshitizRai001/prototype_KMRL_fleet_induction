// API configuration for different environments
const isDev = import.meta.env.DEV;

// Base for Express API
// - Dev: same-origin Vite dev server mounts Express at /api
// - Prod (Netlify): functions base is /.netlify/functions, function name is "api"
export const API_EXPRESS_BASE = isDev ? "" : "/.netlify/functions";

// Base for Django backend
// - Dev: local Django server
// - Prod: must be provided via VITE_DJANGO_API_BASE (e.g. https://your-django-host)
const DEFAULT_DJANGO_DEV = "http://localhost:8000";
export const API_DJANGO_BASE = isDev
  ? DEFAULT_DJANGO_DEV
  : (import.meta.env.VITE_DJANGO_API_BASE as string) || DEFAULT_DJANGO_DEV;
