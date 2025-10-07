# Deploy to Netlify - Step by Step Guide

## 🚀 Quick Deploy Checklist

Follow these steps **IN ORDER** to fix the progress bar issue on Netlify:

### Step 1: Rebuild the Project Locally

```bash
cd "D:\Elevate admin front-end\frontend"
npm run build
```

This will:
- ✅ Create a fresh `dist` folder
- ✅ Copy the updated `_redirects` file (without API proxy)
- ✅ Bundle all the updated code with better error handling

### Step 2: Set Environment Variable in Netlify

1. Go to https://app.netlify.com
2. Click on your admin frontend site
3. Go to **Site settings** → **Environment variables**
4. Click **"Add a variable"**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://elevate-backend-s28.onrender.com`
   - **Scope**: Production (or All scopes)
5. Click **"Save"**

### Step 3: Deploy to Netlify

#### Option A: Drag & Drop (Fastest)

1. In Netlify dashboard, go to **Deploys** tab
2. Drag and drop the entire `dist` folder to the deploy area
3. Wait for deployment to complete

#### Option B: Git Push (Recommended for continuous deployment)

```bash
git add .
git commit -m "Fix: Remove Netlify API proxy for large file uploads"
git push origin main
```

Netlify will automatically deploy if connected to your repository.

### Step 4: Clear Cache and Rebuild

1. In Netlify dashboard, go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for the new deployment to finish

### Step 5: Verify the Deployment

1. Open your Netlify site in a browser
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Type and run:
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
5. Should show: `https://elevate-backend-s28.onrender.com`
   - ✅ If it shows the URL, configuration is correct
   - ❌ If it shows `undefined`, environment variable is not set

### Step 6: Test Upload

1. Log in to admin panel
2. Go to **"Add Music"**
3. Select a large audio file (100MB+ recommended for testing)
4. Fill in all required fields
5. Click **"Add Music"**
6. **Watch for**:
   - Progress bar appears ✅
   - Percentage updates (0%, 10%, 20%... 100%) ✅
   - "Uploading... Please do not close this page." message ✅
   - No timeout errors ✅

### Step 7: Check Network Requests (Important!)

1. With DevTools open, go to **Network** tab
2. Try uploading a file
3. Look for the request to `/music/create`
4. Click on it and check the **Request URL**:
   - ✅ **Correct**: `https://elevate-backend-s28.onrender.com/music/create`
   - ❌ **Wrong**: `https://your-site.netlify.app/api/music/create`

If the request goes to `/api/music/create`, the old `_redirects` is still cached.

---

## 📋 What Was Changed

### Files Updated:

1. ✅ `public/_redirects` - Removed API proxy
2. ✅ `dist/_redirects` - Updated for immediate testing  
3. ✅ `netlify.toml` - Created with proper configuration
4. ✅ `src/admin/pages/AddMusic.jsx` - Added better error handling & logging

### Key Changes:

**Before:**
```
Browser → Netlify (30s timeout) → Backend
```

**After:**
```
Browser → Backend (Direct, unlimited time)
```

---

## 🔧 Troubleshooting

### Issue: Progress bar still not showing

**Check 1 - Environment Variable**
```javascript
// In browser console on your Netlify site:
console.log(import.meta.env.VITE_API_URL)
```
- Should output the backend URL
- If `undefined`, environment variable not set correctly

**Solution:**
- Go to Netlify → Site settings → Environment variables
- Add `VITE_API_URL` with your backend URL
- Trigger rebuild: Deploys → Clear cache and deploy site

---

### Issue: CORS Error in Console

**Error message:**
```
Access to XMLHttpRequest at 'https://elevate-backend-s28.onrender.com/music/create' 
from origin 'https://your-site.netlify.app' has been blocked by CORS policy
```

**Solution:** Update backend CORS configuration

```javascript
// In your backend server (e.g., server.js)
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'https://your-site.netlify.app',  // ADD YOUR NETLIFY URL
    'https://your-custom-domain.com'  // If you have a custom domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Then redeploy your backend.

---

### Issue: Upload fails at specific percentage

**Symptoms:**
- Progress bar reaches 50% or 80% then fails
- "Network Error" message appears

**Possible Causes:**
1. Backend timeout (most common)
2. Backend memory limit
3. Backend file size limit

**Solution:** Check backend configuration

See `LARGE_FILE_UPLOAD_SETUP.md` for detailed backend setup.

Quick fixes for backend:

```javascript
// Increase timeout
const server = app.listen(PORT);
server.timeout = 1800000; // 30 minutes

// Increase body parser limit
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ limit: '1gb', extended: true }));

// Increase multer file size
const upload = multer({
  storage: /* your storage config */,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB
  }
});
```

---

### Issue: Upload completes but no file on server

**Check:**
1. Backend logs for errors
2. File permissions on server
3. Disk space on server
4. Environment variables on backend

---

### Issue: Request goes to /api/music/create instead of direct backend

**Cause:** Old `_redirects` file is cached

**Solution:**
1. Delete the `dist` folder completely
2. Run `npm run build` again
3. Redeploy to Netlify
4. Clear Netlify cache: Trigger deploy → Clear cache and deploy site
5. Clear browser cache (Ctrl+Shift+Delete)

---

## 📊 Success Indicators

After successful deployment, you should see:

✅ Environment variable shows correct backend URL in console
✅ Network requests go directly to backend (not through Netlify)
✅ Progress bar appears and updates during upload
✅ Large files (500MB+) upload successfully
✅ No timeout errors
✅ Console shows upload progress logs: "Upload progress: X%"

---

## 🎯 Performance Tips

### For 700MB+ Files:

1. **Stable Connection**: Use wired connection, not WiFi
2. **Don't Close Page**: Keep browser tab open during upload
3. **Backend Performance**: Consider upgrading backend hosting
4. **Cloud Storage**: For production, consider S3/Cloudinary for very large files

### Expected Upload Times:

Depends on your connection speed:
- **Fast (100 Mbps)**: 700MB ≈ 1-2 minutes
- **Medium (50 Mbps)**: 700MB ≈ 2-5 minutes  
- **Slow (10 Mbps)**: 700MB ≈ 10-15 minutes

Progress bar will show real-time percentage during upload.

---

## 📝 Testing Different File Sizes

Test with progressively larger files:

1. ✅ Small file (10MB) - Should upload instantly
2. ✅ Medium file (100MB) - Should see progress bar
3. ✅ Large file (500MB) - Should see warning message
4. ✅ Very large file (700MB+) - Full test with progress tracking

---

## 🆘 Still Having Issues?

### Debug Mode

Add this to check detailed logs:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Upload a file
4. Look for these logs:
   - `API URL: https://elevate-backend-s28.onrender.com` ✅
   - `File size: XXXXX bytes` ✅
   - `Starting upload...` ✅
   - `Upload progress: X%` (multiple times) ✅

If any of these logs are missing, there's a configuration issue.

### Contact Support

If issues persist after following all steps:

1. Take screenshot of browser console errors
2. Check Netlify deployment logs for errors
3. Check backend server logs
4. Verify backend is running and accessible
5. Test backend directly with Postman/Insomnia

---

## 🎉 Final Checklist

Before marking as complete:

- [ ] Rebuilt project locally (`npm run build`)
- [ ] Set `VITE_API_URL` in Netlify environment variables
- [ ] Deployed to Netlify (drag & drop or git push)
- [ ] Cleared cache and rebuilt on Netlify
- [ ] Verified environment variable in browser console
- [ ] Checked Network tab shows direct backend requests
- [ ] Tested upload with large file (100MB+)
- [ ] Progress bar visible and updating
- [ ] No timeout or CORS errors
- [ ] File successfully uploaded and saved

---

**You're all set! The progress bar should now work perfectly on Netlify! 🚀**

