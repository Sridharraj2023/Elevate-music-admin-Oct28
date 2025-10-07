# Large File Upload Setup Guide

## Frontend Changes (✅ COMPLETED)

The frontend has been updated to support large audio file uploads (700MB+) with the following improvements:

### 1. Upload Progress Bar
- Real-time progress tracking showing percentage (0-100%)
- Visual progress bar with color coding (blue for uploading, green for complete)
- Status messages to guide users during upload

### 2. File Size Display
- Shows the selected file size in a human-readable format (MB, GB, etc.)
- Automatically displays when a file is selected

### 3. Large File Warnings
- Warns users when files over 500MB are selected
- Informs them that upload may take several minutes

### 4. Improved Upload Handling
- Removed timeout restrictions for large files (`timeout: 0`)
- Progress tracking using `onUploadProgress` callback
- Disabled form inputs during upload to prevent accidental changes
- Clear visual feedback with button state changes

### 5. Better User Experience
- All form fields disabled during upload
- Submit button shows "Uploading..." state
- Progress percentage displayed prominently
- Warning to not close the page during upload

## Backend Requirements (⚠️ ACTION NEEDED)

To fully support large file uploads (700MB+), the backend must be configured properly:

### 1. Express Body Parser Limits

Update your Express server configuration to increase file size limits:

\`\`\`javascript
const express = require('express');
const app = express();

// Increase payload size limits
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ limit: '1gb', extended: true }));
\`\`\`

### 2. Multer Configuration (if using Multer)

If using Multer for file uploads, increase the file size limit:

\`\`\`javascript
const multer = require('multer');

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/music/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB limit
  }
});
\`\`\`

### 3. Server Timeout Settings

Increase server timeout for long-running uploads:

\`\`\`javascript
const server = app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

// Increase timeout to 30 minutes for large uploads
server.timeout = 1800000; // 30 minutes in milliseconds
server.keepAliveTimeout = 1800000;
server.headersTimeout = 1800000;
\`\`\`

### 4. Nginx Configuration (if using Nginx as reverse proxy)

Add these directives to your Nginx configuration:

\`\`\`nginx
server {
    # ... other configuration ...
    
    # Increase max body size to 1GB
    client_max_body_size 1024M;
    
    # Increase timeout for large uploads
    client_body_timeout 1800s;
    proxy_read_timeout 1800s;
    proxy_connect_timeout 1800s;
    proxy_send_timeout 1800s;
}
\`\`\`

### 5. Cloud Storage Considerations

For production environments, consider using cloud storage services:

#### AWS S3
- Generate pre-signed URLs for direct uploads
- Bypasses server file size limits
- Better performance for large files

#### Cloudinary
- Supports large audio files
- Provides automatic optimization
- Built-in CDN delivery

Example with AWS S3:

\`\`\`javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Generate pre-signed URL for direct upload
const getSignedUploadUrl = (fileName, fileType) => {
  const params = {
    Bucket: 'your-bucket-name',
    Key: \`music/\${fileName}\`,
    Expires: 3600, // 1 hour
    ContentType: fileType
  };
  
  return s3.getSignedUrl('putObject', params);
};
\`\`\`

### 6. Server Infrastructure

For files over 700MB, consider:
- **Memory**: Ensure server has adequate RAM (at least 4GB recommended)
- **Disk Space**: Ensure sufficient storage for uploaded files
- **Network**: Stable, high-bandwidth connection
- **Hosting**: Use platforms that support long-running requests (avoid serverless functions with timeout limits)

## Environment Variables

Create a `.env` file in the frontend directory:

\`\`\`bash
cp .env.example .env
\`\`\`

Then edit the `.env` file with your API URL:
- For production: Use your deployed backend URL
- For local development: Use `http://localhost:5000`

## Testing Large File Uploads

1. Select a file over 500MB
2. Fill in all required fields
3. Click "Add Music"
4. Monitor the progress bar (should show 0-100%)
5. Wait for completion (don't close the page)
6. Verify file uploaded successfully on the server

## Troubleshooting

### Upload fails at specific percentage
- **Cause**: Server timeout or memory limit
- **Solution**: Increase server timeout and memory allocation

### Upload stuck at 100%
- **Cause**: Server processing the file after upload
- **Solution**: This is normal for large files; backend is saving to storage

### Network error during upload
- **Cause**: Unstable internet connection
- **Solution**: Use a stable, wired connection for very large files

### 413 Payload Too Large error
- **Cause**: Server file size limit not configured
- **Solution**: Apply backend configuration changes listed above

### 502 Bad Gateway or 504 Gateway Timeout
- **Cause**: Reverse proxy (Nginx/Apache) timeout
- **Solution**: Configure reverse proxy timeout settings

## Next Steps

1. ✅ Frontend is ready for large file uploads
2. ⚠️ Configure backend file size limits (see section 2)
3. ⚠️ Configure server timeouts (see section 3)
4. ⚠️ If using Nginx, update configuration (see section 4)
5. ⚠️ Consider cloud storage for production (see section 5)
6. Test with actual 700MB+ files

## Notes

- The frontend now has **no timeout limit** for uploads
- Progress tracking works for files of any size
- Users are warned about long upload times for large files
- All form controls are disabled during upload to prevent errors

