# Frontend Setup Guide

This guide will help you set up the frontend on your server (172.234.201.117).

## API Configuration

**API URL**: `http://172.234.201.117:5000/api`

This is already configured in all deployment files. The frontend will connect to the backend API running on the same server.

## Quick Setup Steps

### Step 1: SSH into the Server

```bash
ssh elevatefrntend@172.234.201.117
```

### Step 2: Clone the Repository

```bash
cd ~
git clone https://github.com/Sridharraj2023/Elevate-music-admin-Oct28.git Elevate_Admin_Frontend
cd Elevate_Admin_Frontend/frontend
```

### Step 3: Create Environment File

```bash
echo "VITE_API_URL=http://172.234.201.117:5000/api" > .env
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Build the Application

```bash
npm run build
```

This will create a `dist` directory with the production-ready files.

### Step 6: Verify Build

```bash
ls -la dist/
```

You should see `index.html` and an `assets` directory.

## Option A: Deploy with Nginx (Recommended)

### Step 1: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/elevate-admin-frontend
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name 172.234.201.117;
    
    root /home/elevatefrntend/Elevate_Admin_Frontend/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Serve static files - SPA routing
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

### Step 2: Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/elevate-admin-frontend /etc/nginx/sites-enabled/
```

### Step 3: Test and Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Test the Application

Open your browser and go to: `http://172.234.201.117`

## Option B: Deploy with Docker

### Step 1: Build Docker Image

```bash
cd ~/Elevate_Admin_Frontend/frontend
docker build --build-arg VITE_API_URL=http://172.234.201.117:5000/api -t elevate-admin-frontend .
```

### Step 2: Run Docker Container

```bash
docker run -d \
  --name elevate-admin-frontend \
  -p 80:80 \
  --restart unless-stopped \
  elevate-admin-frontend
```

### Step 3: Verify Container is Running

```bash
docker ps
docker logs elevate-admin-frontend
```

### Step 4: Test the Application

Open your browser and go to: `http://172.234.201.117`

## Updating the Frontend

When you need to update the frontend:

```bash
cd ~/Elevate_Admin_Frontend
git fetch origin
git reset --hard origin/main
git clean -fd
cd frontend
npm install
npm run build
```

Then:
- **If using Nginx**: Just reload nginx: `sudo systemctl reload nginx`
- **If using Docker**: Rebuild and restart the container

## Troubleshooting

### Build Fails
- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check disk space: `df -h`

### Application Not Loading
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify nginx is running: `sudo systemctl status nginx`
- Check file permissions: `ls -la ~/Elevate_Admin_Frontend/frontend/dist`

### API Connection Issues
- Verify backend is running: `curl http://172.234.201.117:5000/api/health`
- Check CORS settings on backend
- Verify `.env` file has correct API URL: `cat .env`

### 404 Errors on Routes
- Ensure nginx config has `try_files $uri $uri/ /index.html;`
- Check that `dist/index.html` exists

## File Structure

After setup, your directory structure should look like:

```
~/Elevate_Admin_Frontend/
├── frontend/
│   ├── dist/              # Built files (served by nginx)
│   ├── src/               # Source code
│   ├── .env               # Environment variables
│   ├── package.json
│   └── Dockerfile
```

## Next Steps

Once the frontend is set up and accessible:
1. Test login functionality
2. Verify API connections
3. Test all admin features
4. Set up SSL/HTTPS if needed

