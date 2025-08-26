# Render Deployment Guide for Grocery Store Management System

## Prerequisites
1. Push your code to a GitHub repository
2. Sign up for a free Render account at https://render.com

## Option 1: Using render.yaml (Recommended)

1. **Deploy from GitHub:**
   - Go to Render Dashboard
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file and create both the database and web service

## Option 2: Manual Setup

### Step 1: Create MySQL Database
1. Go to Render Dashboard
2. Click "New" → "MySQL"
3. Fill in:
   - **Name:** `grocery-store-db`
   - **Database:** `grocery_store`
   - **User:** `grocery_admin`
   - **Region:** Choose closest to your users
4. Click "Create Database"
5. Wait for database to be ready and note the connection details

### Step 2: Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Fill in:
   - **Name:** `grocery-store-app`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Health Check Path:** `/health`

### Step 3: Set Environment Variables
Add these environment variables in the web service:

```
CONFIG_MODULE=config_render
SECRET_KEY=your-secret-key-here-generate-a-strong-one
DEBUG=False
DB_HOST=your-mysql-host-from-render
DB_PORT=3306
DB_NAME=grocery_store
DB_USER=your-mysql-user-from-render
DB_PASSWORD=your-mysql-password-from-render
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for build and deployment to complete
3. Your app will be available at the provided Render URL

## Important Notes

1. **Database Initialization:** 
   - The database will be automatically initialized with tables and sample data on first deployment
   - If you need to manually initialize, run: `python init_db.py`

2. **Environment Variables:**
   - Never commit sensitive data like passwords to your repository
   - Use Render's environment variables for all sensitive configuration

3. **SSL/HTTPS:**
   - Render automatically provides SSL certificates
   - Your app will be available over HTTPS

4. **Custom Domain (Optional):**
   - You can add a custom domain in the Render dashboard
   - Follow Render's documentation for DNS setup

## Troubleshooting

1. **Build Failed:**
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `requirements.txt`

2. **Database Connection Issues:**
   - Verify environment variables are set correctly
   - Check database status in Render dashboard

3. **App Not Loading:**
   - Check the application logs
   - Ensure the health check endpoint `/health` is working

## Post-Deployment

1. **Test the Application:**
   - Visit your Render URL
   - Test all CRUD operations
   - Verify database connectivity

2. **Monitor Performance:**
   - Use Render's built-in monitoring
   - Check for any errors in logs

3. **Scale as Needed:**
   - Upgrade to paid plans for better performance
   - Add more resources if needed

## Support

- Render Documentation: https://render.com/docs
- MySQL on Render: https://render.com/docs/databases
- Python on Render: https://render.com/docs/python
