import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './BulkFileUpload.css';

const BulkFileUpload = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileStatus, setFileStatus] = useState({});
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Initialize file status
    const status = {};
    files.forEach(file => {
      status[file.name] = {
        status: 'pending',
        progress: 0,
        error: null
      };
    });
    setFileStatus(status);
  };

  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Please log in to upload files');
      setUploading(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileName = file.name;
      
      try {
        // Update status to uploading
        setFileStatus(prev => ({
          ...prev,
          [fileName]: { ...prev[fileName], status: 'uploading', progress: 0 }
        }));

        const formData = new FormData();
        formData.append('audio', file); // Backend expects 'audio' field

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setFileStatus(prev => ({
            ...prev,
            [fileName]: { 
              ...prev[fileName], 
              progress: Math.min(prev[fileName].progress + 10, 90) 
            }
          }));
        }, 200);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/music/upload`,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setFileStatus(prev => ({
                ...prev,
                [fileName]: { ...prev[fileName], progress }
              }));
            }
          }
        );

        clearInterval(progressInterval);
        
        if (response.data.success) {
          setFileStatus(prev => ({
            ...prev,
            [fileName]: { 
              status: 'success', 
              progress: 100, 
              error: null,
              fileUrl: response.data.fileUrl 
            }
          }));
          successCount++;
          toast.success(`✅ ${fileName} uploaded successfully`);
        } else {
          throw new Error(response.data.message || 'Upload failed');
        }
      } catch (error) {
        setFileStatus(prev => ({
          ...prev,
          [fileName]: { 
            status: 'error', 
            progress: 0, 
            error: error.response?.data?.message || error.message 
          }
        }));
        errorCount++;
        toast.error(`❌ ${fileName}: ${error.response?.data?.message || error.message}`);
      }
    }

    setUploading(false);
    
    // Show summary
    if (successCount > 0) {
      toast.success(`🎉 ${successCount} files uploaded successfully!`);
    }
    if (errorCount > 0) {
      toast.error(`⚠️ ${errorCount} files failed to upload`);
    }

    // Call callback to refresh music list
    if (onUploadComplete && successCount > 0) {
      onUploadComplete();
    }
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setFileStatus({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'uploading': return '🔄';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'uploading': return '#007bff';
      default: return '#6c757d';
    }
  };

  return (
    <div className="bulk-upload-container">
      <div className="bulk-upload-header">
        <h3>🚀 Bulk File Upload</h3>
        <p>Upload multiple audio/image files to fix missing files on production server</p>
      </div>

      <div className="file-selector">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".mp3,.wav,.m4a,.aac,.flac,.jpeg,.jpg,.png,.gif"
          onChange={handleFileSelect}
          disabled={uploading}
          className="file-input"
        />
        <label htmlFor="file-input" className="file-input-label">
          📁 Select Files (Audio & Images)
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="upload-section">
          <div className="upload-controls">
            <button 
              onClick={handleBulkUpload}
              disabled={uploading}
              className="upload-btn"
            >
              {uploading ? '🔄 Uploading...' : `📤 Upload ${selectedFiles.length} Files`}
            </button>
            <button 
              onClick={clearFiles}
              disabled={uploading}
              className="clear-btn"
            >
              🗑️ Clear
            </button>
          </div>

          <div className="file-list">
            <h4>Selected Files ({selectedFiles.length})</h4>
            <div className="file-items">
              {selectedFiles.map((file, index) => {
                const status = fileStatus[file.name] || { status: 'pending', progress: 0 };
                return (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <span className="file-icon">
                        {file.type.startsWith('audio/') ? '🎵' : '🖼️'}
                      </span>
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    
                    <div className="file-status">
                      <span 
                        className="status-icon"
                        style={{ color: getStatusColor(status.status) }}
                      >
                        {getStatusIcon(status.status)}
                      </span>
                      <span className="status-text">
                        {status.status === 'uploading' ? 'Uploading...' :
                         status.status === 'success' ? 'Success' :
                         status.status === 'error' ? 'Error' : 'Pending'}
                      </span>
                    </div>

                    {status.status === 'uploading' && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${status.progress}%` }}
                        ></div>
                      </div>
                    )}

                    {status.error && (
                      <div className="error-message">
                        {status.error}
                      </div>
                    )}

                    {status.fileUrl && (
                      <div className="success-info">
                        URL: {status.fileUrl}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="upload-tips">
        <h4>💡 Upload Tips:</h4>
        <ul>
          <li>Supported audio formats: MP3, WAV, M4A, AAC, FLAC</li>
          <li>Supported image formats: JPEG, PNG, GIF</li>
          <li>Files will be uploaded to production server</li>
          <li>Large files may take longer to upload</li>
          <li>Check file status for upload progress</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkFileUpload;
