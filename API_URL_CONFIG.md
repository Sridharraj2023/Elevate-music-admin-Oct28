# API URL Configuration Guide

Since both frontend and backend are running on the same server (172.234.201.117), you need to configure the API URL correctly based on your deployment setup.

## Deployment Scenarios

### Scenario 1: Docker Compose (Recommended)

If you're using Docker Compose with both frontend and backend as services:

**Use service name:**
```env
VITE_API_URL=http://backend:5000
```

**Example docker-compose.yml:**
```yaml
services:
  backend:
    # ... backend config ...
    ports:
      - "5000:5000"
  
  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: http://backend:5000
    # ... frontend config ...
```

**Build command:**
```bash
docker build --build-arg VITE_API_URL=http://backend:5000 -t elevate-admin-frontend .
```

### Scenario 2: Backend on Same Host (Not in Docker)

If backend runs directly on the server (not containerized):

**Use localhost:**
```env
VITE_API_URL=http://localhost:5000
```

**Build command:**
```bash
docker build --build-arg VITE_API_URL=http://localhost:5000 -t elevate-admin-frontend .
```

**Note:** If frontend is in Docker and backend is on host, use `host.docker.internal` (Linux) or the server's IP.

### Scenario 3: Backend Exposed on Server IP

If backend is accessible via the server's public IP:

**Use server IP:**
```env
VITE_API_URL=http://172.234.201.117:5000
```

**Build command:**
```bash
docker build --build-arg VITE_API_URL=http://172.234.201.117:5000 -t elevate-admin-frontend .
```

### Scenario 4: Nginx Reverse Proxy

If you're using nginx as a reverse proxy for the backend:

**Use relative path or proxy:**
```env
VITE_API_URL=/api
```

Or if backend is proxied through nginx:
```env
VITE_API_URL=http://172.234.201.117/api
```

## How to Determine Your Setup

1. **Check if using Docker Compose:**
   ```bash
   ls ~/docker-compose.yml
   cat ~/docker-compose.yml
   ```
   If you see both frontend and backend services, use service names.

2. **Check backend port:**
   ```bash
   # Check if backend is running
   sudo netstat -tulpn | grep 5000
   # Or
   docker ps | grep backend
   ```

3. **Test backend connectivity:**
   ```bash
   # From server
   curl http://localhost:5000/api/health
   # Or
   curl http://172.234.201.117:5000/api/health
   ```

## Important Notes

1. **Build-time variable**: `VITE_API_URL` is embedded at build time. You must rebuild the Docker image if you change it.

2. **CORS**: Ensure your backend allows requests from the frontend origin.

3. **Network**: If using Docker, ensure both containers are on the same network (Docker Compose creates this automatically).

4. **Default**: The Dockerfile defaults to `http://backend:5000` assuming Docker Compose setup.

## Quick Reference

| Setup | API URL | Build Command |
|-------|---------|---------------|
| Docker Compose | `http://backend:5000` | `docker build --build-arg VITE_API_URL=http://backend:5000 .` |
| Same host, no Docker | `http://localhost:5000` | `docker build --build-arg VITE_API_URL=http://localhost:5000 .` |
| Server IP | `http://172.234.201.117:5000` | `docker build --build-arg VITE_API_URL=http://172.234.201.117:5000 .` |

## Verification

After building, verify the API URL is correct:

1. **Check built files:**
   ```bash
   docker run --rm elevate-admin-frontend cat /usr/share/nginx/html/index.html | grep -o 'VITE_API_URL[^"]*'
   ```

2. **Test from browser console:**
   ```javascript
   console.log(import.meta.env.VITE_API_URL);
   ```

