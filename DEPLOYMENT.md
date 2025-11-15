# Deployment Guide for Elevate Admin Frontend

This guide will help you deploy the updated frontend application to your server.

## Prerequisites

- SSH access to the server (172.234.201.117)
- Node.js and npm installed on the server
- Git installed on the server
- Nginx installed and configured (for serving the built application)
- Backend API running and accessible

## Server Information

- **Server IP**: 172.234.201.117
- **Username**: elevatefrntend
- **Old Deployment**: `/home/elevatefrntend/Elevate_Admin_Frontend_S26`
- **New Deployment**: `/home/elevatefrntend/Elevate_Admin_Frontend`
- **Repository**: https://github.com/Sridharraj2023/Elevate-music-admin-Oct28.git

## Deployment Steps

### Option 1: Using the Deployment Script (Recommended)

1. **SSH into the server**:
   ```bash
   ssh elevatefrntend@172.234.201.117
   ```

2. **Make the deployment script executable** (if you upload it):
   ```bash
   chmod +x deploy.sh
   ```

3. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

   Or if the script is in the repository:
   ```bash
   cd ~/Elevate_Admin_Frontend/frontend
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option 2: Manual Deployment

1. **SSH into the server**:
   ```bash
   ssh elevatefrntend@172.234.201.117
   ```

2. **Navigate to home directory**:
   ```bash
   cd ~
   ```

3. **Clone or update the repository**:
   ```bash
   # If repository doesn't exist
   git clone https://github.com/Sridharraj2023/Elevate-music-admin-Oct28.git Elevate_Admin_Frontend
   
   # If repository exists, update it
   cd Elevate_Admin_Frontend
   git fetch origin
   git reset --hard origin/main
   git clean -fd
   ```

4. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

5. **Create/Update .env file**:
   ```bash
   nano .env
   ```
   
   Add the following content:
   ```env
   VITE_API_URL=http://172.234.201.117:5000/api
   ```
   
   **Note**: This is the API URL for the backend running on the same server.

6. **Install dependencies**:
   ```bash
   npm install
   ```

7. **Build the application**:
   ```bash
   npm run build
   ```

8. **Verify the build**:
   ```bash
   ls -la dist/
   ```
   
   You should see `index.html` and an `assets` directory.

## Nginx Configuration

1. **Create nginx configuration file**:
   ```bash
   sudo nano /etc/nginx/sites-available/elevate-admin-frontend
   ```

2. **Copy the configuration** from `nginx.conf.example` and update the paths:
   ```nginx
   server {
       listen 80;
       server_name 172.234.201.117;
       
       root /home/elevatefrntend/Elevate_Admin_Frontend/frontend/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/elevate-admin-frontend /etc/nginx/sites-enabled/
   ```

4. **Test nginx configuration**:
   ```bash
   sudo nginx -t
   ```

5. **Reload nginx**:
   ```bash
   sudo systemctl reload nginx
   ```

## Environment Variables

The application requires the following environment variable:

- **VITE_API_URL**: The base URL of your backend API
  - **Current configuration**: `http://172.234.201.117:5000/api`
  - This points to the backend API running on the same server
  - Update this in the `.env` file in the `frontend` directory if needed

**Important**: After updating `.env`, you must rebuild the application:
```bash
npm run build
```

## Updating the Application

To update the application with new changes:

1. **SSH into the server**
2. **Navigate to the project directory**:
   ```bash
   cd ~/Elevate_Admin_Frontend
   ```
3. **Pull latest changes**:
   ```bash
   git fetch origin
   git reset --hard origin/main
   git clean -fd
   ```
4. **Rebuild**:
   ```bash
   cd frontend
   npm install  # Only if package.json changed
   npm run build
   ```
5. **Reload nginx**:
   ```bash
   sudo systemctl reload nginx
   ```

## Troubleshooting

### Build fails
- Check Node.js version: `node --version` (should be 18+)
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for errors in the build output

### Application not loading
- Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify nginx is running: `sudo systemctl status nginx`
- Check file permissions: `ls -la ~/Elevate_Admin_Frontend/frontend/dist`

### API connection issues
- Verify `VITE_API_URL` in `.env` is correct: `http://172.234.201.117:5000/api`
- Check if backend is accessible: `curl http://172.234.201.117:5000/api/health`
- Rebuild after changing `.env`: `npm run build`

### 404 errors on routes
- Ensure nginx configuration has `try_files $uri $uri/ /index.html;`
- Check that `dist/index.html` exists

## Backup Old Deployment

Before deploying, you may want to backup the old deployment:

```bash
cp -r ~/Elevate_Admin_Frontend_S26 ~/Elevate_Admin_Frontend_S26_backup_$(date +%Y%m%d)
```

## Rollback

If you need to rollback to the old deployment:

1. Update nginx configuration to point to old directory:
   ```bash
   sudo nano /etc/nginx/sites-available/elevate-admin-frontend
   # Change root to: /home/elevatefrntend/Elevate_Admin_Frontend_S26/frontend/dist
   ```
2. Reload nginx:
   ```bash
   sudo systemctl reload nginx
   ```

## System Requirements

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **Disk Space**: At least 500MB free (for node_modules and build)
- **Memory**: At least 1GB available

## Notes

- The build process creates a `dist` directory with static files
- Environment variables are embedded at build time, so changes require a rebuild
- The application is a Single Page Application (SPA), so all routes should redirect to `index.html`
- Static assets are cached for 1 year for better performance

