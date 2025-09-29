# R.O.P.S. Deployment Guide for Netlify + Supabase

## Overview

This guide explains how to deploy the R.O.P.S. (Rail Optimization and Planning System) to Netlify with Supabase database integration. The application is configured to work seamlessly between development (Replit) and production (Netlify) environments.

## Prerequisites

1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization and set project name
4. Set a strong database password
5. Select your preferred region

### 1.2 Get Database URL
1. In your Supabase project, go to **Settings** → **Database**
2. Scroll to "Connection string"
3. Copy the **"URI"** connection string
4. Replace `[YOUR-PASSWORD]` with your actual database password

Example format:
```
postgresql://postgres.your_project_ref:[password]@aws-0-region.pooler.supabase.co:5432/postgres
```

### 1.3 Set Up Database Schema
The Django models will automatically create the necessary tables when you deploy, but you can also run migrations manually in Supabase SQL Editor if needed.

## Step 2: Configure Netlify Deployment

### 2.1 Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Choose the repository containing your R.O.P.S. code

### 2.2 Build Settings
Netlify will automatically detect the build settings from `netlify.toml`, but verify:
- **Build command**: `npm run build:client`
- **Publish directory**: `dist/spa`
- **Functions directory**: `netlify/functions`

### 2.3 Environment Variables
In your Netlify site dashboard, go to **Site settings** → **Environment variables** and add:

#### Required Variables:
```bash
# Environment
ENVIRONMENT=production
NODE_ENV=production

# Django Configuration
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-site.netlify.app,.netlify.app

# Supabase Database
SUPABASE_DATABASE_URL=postgresql://postgres.your_ref:[password]@aws-0-region.pooler.supabase.co:5432/postgres

# Frontend / API Configuration  
# Netlify Functions base (Express)
VITE_API_BASE_URL=/.netlify/functions
# Django API base (public URL where Django is deployed)
VITE_DJANGO_API_BASE=https://your-django-host
# Netlify Functions -> Django backend base URL (same as above)
DJANGO_API_URL=https://your-django-host

# CORS / CSRF Configuration
FRONTEND_URL=https://your-site.netlify.app
NETLIFY_URL=https://your-site.netlify.app
```

#### Optional Variables for Advanced Configuration:
```bash
# Custom domain (if you have one)
ALLOWED_HOSTS=your-custom-domain.com,.netlify.app

# Additional security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### 2.4 Deploy
1. Click "Deploy site"
2. Netlify will automatically build and deploy your application
3. Check the deploy logs for any errors

## Step 3: Verify Deployment

### 3.1 Check the Application
1. Visit your Netlify site URL
2. Verify the login page loads correctly
3. Test the staff login functionality
4. Check that API calls work through Netlify Functions

### 3.2 Database Connection
- Login should work if database connection is successful
- Check Netlify Function logs for any database connection errors
- Verify that user sessions are maintained properly

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain
1. In Netlify: **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Follow DNS configuration instructions

### 4.2 Update Environment Variables
Add your custom domain to:
- `ALLOWED_HOSTS`
- `FRONTEND_URL`
- `NETLIFY_URL`

## Architecture Overview

### Development (Replit)
- **Frontend**: Vite dev server on port 5000
- **Backend**: Django on port 8000  
- **Database**: Replit's PostgreSQL (Neon)
- **API Calls**: Direct to `https://replit-domain:8000`

### Production (Netlify)
- **Frontend**: Static files served by Netlify CDN
- **Backend**: Netlify Functions (Express server)
- **Database**: Supabase PostgreSQL
- **API Calls**: Through `/.netlify/functions/api`

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
- Verify `SUPABASE_DATABASE_URL` is correct
- Check that `ENVIRONMENT=production` is set
- Ensure Supabase project is not paused

#### 2. API Calls Failing
- Check that `VITE_API_BASE_URL=/.netlify/functions`
- Verify Netlify Functions are deploying correctly
- Check Function logs in Netlify dashboard

#### 3. Login Issues
- Verify Django `SECRET_KEY` is set
- Check `ALLOWED_HOSTS` includes your domain
- Ensure CORS settings allow your frontend domain

#### 4. Build Failures
- Check that all environment variables are set
- Verify Node.js version compatibility
- Check build logs for specific error messages

### Debug Commands

For local testing with production settings:
```bash
# Set environment variables
export ENVIRONMENT=production
export SUPABASE_DATABASE_URL=your-supabase-url

# Test Django settings
cd kmrl_backend && python manage.py check

# Test database connection
cd kmrl_backend && python manage.py dbshell
```

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Netlify provides automatic HTTPS
3. **Database Security**: Use Supabase Row Level Security (RLS) if needed
4. **Session Security**: Configure secure session cookies for production

## Monitoring

- **Netlify Analytics**: Monitor site performance and usage
- **Supabase Dashboard**: Monitor database performance and usage
- **Error Tracking**: Consider adding Sentry for error monitoring

## Support

If you encounter issues:
1. Check Netlify deploy logs
2. Check Netlify Function logs  
3. Check Supabase logs in dashboard
4. Review this deployment guide
5. Test locally with production environment variables