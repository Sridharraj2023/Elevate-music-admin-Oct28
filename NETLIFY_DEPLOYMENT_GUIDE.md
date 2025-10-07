# Netlify Deployment Guide for Large File Uploads

## Problem

The progress bar works locally but not on Netlify because:
1. Netlify was proxying API requests through its servers (30-second timeout)
2. Large file uploads (700MB+) exceed Netlify's timeout limits
3. Environment variables might not be properly configured

## Solution Applied

### 1. ✅ Removed API Proxy from `_redirects`

**Before:**
```
/api/*  https://elevate-backend-s28.onrender.com/:splat  200
/*    /index.html   200
```

**After:**
```
/*    /index.html   200
```

This ensures that **all API calls go directly from the browser to your backend**, bypassing Netlify's proxy entirely.

### 2. ✅ Created `netlify.toml` Configuration

Added proper Netlify configuration for SPA routing and security headers.

## Required: Set Environment Variables in Netlify

You **MUST** configure the environment variable in Netlify dashboard:

### Step-by-Step:

1. **Log in to Netlify Dashboard**
   - Go to https://app.netlify.com

2. **Select Your Site**
   - Click on your deployed admin frontend site

3. **Go to Site Settings**
   - Click "Site settings" button

4. **Navigate to Environment Variables**
   - In the left sidebar, click "Environment variables"
   - Or go to: Site settings → Build & deploy → Environment

5. **Add Environment Variable**
   - Click "Add a variable" or "Add environment variable"
   - Key: `VITE_API_URL`
   - Value: `https://elevate-backend-s28.onrender.com`
   - Scope: Select "All scopes" or "Production"
   - Click "Save"

6. **Trigger Rebuild**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Clear cache and deploy site"

## How It Works Now

```
┌─────────────┐
│   Browser   │
│  (Netlify)  │
└──────┬──────┘
       │
       │ Direct HTTPS Request
       │ (No Netlify proxy)
       │ Supports large files
       │ Progress tracking works
       │
       ▼
┌─────────────────────┐
│   Backend API       │
│ (Render/Your Server)│
└─────────────────────┘
```

### Before (Not Working):
```
Browser → Netlify Proxy (30s timeout ❌) → Backend
```

### After (Working):
```
Browser → Backend (Direct, no timeout ✅)
```

## Verify Deployment

### 1. Check Environment Variable

After deployment, open browser console on your Netlify site:

```javascript
console.log(import.meta.env.VITE_API_URL);
```

Should output: `https://elevate-backend-s28.onrender.com`

If it shows `undefined`, the environment variable is not set correctly in Netlify.

### 2. Check Network Requests

1. Open DevTools (F12)
2. Go to "Network" tab
3. Try uploading a file
4. Look at the request URL - it should be:
   - ✅ `https://elevate-backend-s28.onrender.com/music/create`
   - ❌ NOT `https://your-netlify-site.netlify.app/api/music/create`

### 3. Test Progress Bar

1. Select a large file (100MB+)
2. Click "Add Music"
3. You should see:
   - Progress bar updating from 0% to 100%
   - "Uploading... Please do not close this page." message
   - File size displayed

## Common Issues & Solutions

### Issue 1: Progress Bar Still Not Showing

**Cause**: Environment variable not set in Netlify

**Solution**:
- Double-check `VITE_API_URL` is set in Netlify dashboard
- Clear cache and rebuild: Deploys → Trigger deploy → Clear cache and deploy site
- Verify in browser console: `console.log(import.meta.env.VITE_API_URL)`

### Issue 2: CORS Error

**Cause**: Backend not configured to accept requests from Netlify domain

**Solution**: Update backend CORS configuration to include your Netlify URL:

```javascript
// Backend server.js or equivalent
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-netlify-site.netlify.app',  // Add this
    'https://your-custom-domain.com'          // If you have one
  ],
  credentials: true
}));
```

### Issue 3: Upload Fails at 100%

**Cause**: Backend timeout or memory limit

**Solution**: See `LARGE_FILE_UPLOAD_SETUP.md` for backend configuration

### Issue 4: "Network Error" on Large Files

**Cause**: Backend server timeout

**Solution**: 
- Increase backend server timeout (see `LARGE_FILE_UPLOAD_SETUP.md`)
- If using Render.com free tier, consider upgrading for better performance
- Consider using cloud storage (S3, Cloudinary) for very large files

## Testing Checklist After Deployment

- [ ] Environment variable `VITE_API_URL` set in Netlify
- [ ] Site rebuilt after setting environment variable
- [ ] Can log in to admin panel
- [ ] Can navigate to "Add Music" page
- [ ] File size displays after selecting file
- [ ] Large file warning appears for 500MB+ files
- [ ] Progress bar visible and updates during upload
- [ ] Upload completes successfully
- [ ] Network tab shows direct requests to backend (not through Netlify)

## Performance Tips

### For Very Large Files (500MB+):

1. **Use Cloud Storage Direct Upload**
   - Generate pre-signed URLs from backend
   - Upload directly to S3/Cloudinary from browser
   - Backend just saves metadata

2. **Chunked Upload** (Advanced)
   - Break file into chunks
   - Upload chunks separately
   - Backend reassembles

3. **Upgrade Hosting**
   - Consider upgrading your backend hosting for better upload speeds
   - Free tiers often have bandwidth limitations

## File Structure

```
frontend/
├── public/
│   └── _redirects          ← Updated (removed API proxy)
├── netlify.toml            ← Created (new)
├── src/
│   └── admin/
│       └── pages/
│           └── AddMusic.jsx ← Already updated with progress bar
└── .env                    ← Local only (not in git)
```

## Environment Files

### `.env` (Local Development)
```env
VITE_API_URL=http://localhost:5000
```

### Netlify (Production)
Set in Netlify Dashboard → Site Settings → Environment Variables:
```
VITE_API_URL=https://elevate-backend-s28.onrender.com
```

## Summary

✅ **Removed** Netlify API proxy to avoid 30-second timeout
✅ **Created** netlify.toml for proper configuration  
✅ **Direct uploads** from browser to backend
✅ **Progress tracking** now works in production
⚠️ **Action Required**: Set `VITE_API_URL` in Netlify dashboard

## Support

If issues persist:
1. Check browser console for errors
2. Check Netlify deploy logs
3. Verify backend is accepting requests from Netlify domain (CORS)
4. Test with smaller files first (10-50MB) to isolate issues

