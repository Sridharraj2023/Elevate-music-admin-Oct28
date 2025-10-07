import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toast';
import '../admin.css';

function AddMusic() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [duration, setDuration] = useState(0);
  const [displayDuration, setDisplayDuration] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileSize, setFileSize] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategory(res.data[0]._id);
          if (res.data[0].types.length > 0) {
            setCategoryType(res.data[0].types[0]._id);
          } else {
            setCategoryType('');
          }
        }
      } catch (err) {
        console.error('Fetch categories error:', err);
        showToast.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validMimeTypes = ['audio/mpeg', 'audio/wav'];
    const validExtensions = ['.mp3', '.wav'];
    const fileExtension = selectedFile.name.slice(((selectedFile.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    
    if (!validMimeTypes.includes(selectedFile.type) && !validExtensions.includes('.' + fileExtension)) {
      showToast.error('Only MP3 and WAV files are allowed');
      setFile(null);
      setDuration(0);
      setDisplayDuration('');
      setFileSize('');
      e.target.value = '';
      return;
    }

    // Show file size
    const sizeFormatted = formatFileSize(selectedFile.size);
    setFileSize(sizeFormatted);
    
    // Warn for very large files
    const fileSizeInMB = selectedFile.size / (1024 * 1024);
    if (fileSizeInMB > 500) {
      showToast.warning(`Large file detected (${sizeFormatted}). Upload may take several minutes. Please be patient.`);
    }

    setFile(selectedFile);

    const audio = new Audio(URL.createObjectURL(selectedFile));
    audio.onloadedmetadata = () => {
      const durationInSeconds = Math.round(audio.duration);
      setDuration(durationInSeconds);
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      setDisplayDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    audio.onerror = () => {
      showToast.error('Could not read audio file');
      setFile(null);
      setDuration(0);
      setDisplayDuration('');
      setFileSize('');
      e.target.value = '';
    };
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    const selectedCategory = categories.find(cat => cat._id === newCategory);
    if (selectedCategory && selectedCategory.types.length > 0) {
      setCategoryType(selectedCategory.types[0]._id);
    } else {
      setCategoryType('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    if (!title.trim()) {
      showToast.error('Title is required');
      hasError = true;
    }
    if (!artist.trim()) {
      showToast.error('Artist is required');
      hasError = true;
    }
    if (!category) {
      showToast.error('Category is required');
      hasError = true;
    }
    if (!categoryType) {
      const selectedCategory = categories.find(cat => cat._id === category);
      if (selectedCategory && selectedCategory.types.length > 0) {
        showToast.error('Category type is required');
        hasError = true;
      } else {
        showToast.error('Selected category has no types available');
        hasError = true;
      }
    }
    if (!file) {
      showToast.error('Audio file is required');
      hasError = true;
    }
    if (!thumbnail) {
      showToast.error('Thumbnail is required');
      hasError = true;
    }
    if (!releaseDate) {
      showToast.error('Release date is required');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('category', category);
    formData.append('categoryType', categoryType);
    formData.append('file', file);
    formData.append('thumbnail', thumbnail);
    formData.append('duration', duration.toString());
    formData.append('releaseDate', releaseDate);

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      // Debug logging for production troubleshooting
      console.log('API URL:', apiUrl);
      console.log('File size:', file.size, 'bytes');
      console.log('Starting upload...');
      
      if (!apiUrl) {
        throw new Error('API URL is not configured. Please check environment variables.');
      }
      
      const res = await axios.post(`${apiUrl}/music/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept':'application/json'
        },
        withCredentials: true,
        timeout: 0, // No timeout for large files
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      setIsUploading(false);
      showToast.success('Music added successfully!');
      setTitle('');
      setArtist('');
      setFile(null);
      setThumbnail(null);
      setDuration(0);
      setDisplayDuration('');
      setFileSize('');
      setUploadProgress(0);
      setReleaseDate(new Date().toISOString().split('T')[0]);
      if (categories.length > 0) {
        setCategory(categories[0]._id);
        setCategoryType(categories[0].types.length > 0 ? categories[0].types[0]._id : '');
      }

      setTimeout(() => {
        navigate(`/admin/view-music?newMusicId=${res.data._id}`);
      }, 1000);
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Enhanced error logging for debugging
      console.error('Upload error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // User-friendly error messages
      let errorMessage = 'Failed to add music';
      
      if (err.message === 'API URL is not configured. Please check environment variables.') {
        errorMessage = 'Configuration error. Please contact administrator.';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout. Please try a smaller file or check your connection.';
      } else if (err.response?.status === 413) {
        errorMessage = 'File is too large. Server cannot process files of this size.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      showToast.error(errorMessage);
    }
  };

  const selectedCategory = categories.find(cat => cat._id === category) || { types: [] };

  return (
    <div className="card">
      <h2 className="card-title">Add Music</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title:</label>
          <input
            className="form-control"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter music title"
            disabled={isUploading}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Artist:</label>
          <input
            className="form-control"
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Enter artist name"
            disabled={isUploading}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category:</label>
          <select
            className="form-control"
            value={category}
            onChange={handleCategoryChange}
            disabled={isUploading}
            required
          >
            {categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Category Type:</label>
          <select
            className="form-control"
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value)}
            disabled={selectedCategory.types.length === 0 || isUploading}
            required
          >
            {selectedCategory.types.length === 0 ? (
              <option value="">No types available</option>
            ) : (
              selectedCategory.types.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Audio File (MP3 or WAV):</label>
          <input
            className="form-control"
            type="file"
            accept="audio/mpeg,audio/wav"
            onChange={handleFileChange}
            disabled={isUploading}
            required
          />
          {fileSize && (
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              File size: {fileSize}
            </small>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Thumbnail:</label>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            disabled={isUploading}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Duration:</label>
          <input
            className="form-control"
            type="text"
            value={displayDuration}
            readOnly
          />
        </div>

        <div className="form-group">
          <label className="form-label">Release Date:</label>
          <input
            className="form-control"
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            disabled={isUploading}
            required
          />
        </div>

        {isUploading && (
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Upload Progress:</label>
            <div style={{
              width: '100%',
              backgroundColor: '#e0e0e0',
              borderRadius: '10px',
              overflow: 'hidden',
              height: '30px',
              position: 'relative'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                backgroundColor: uploadProgress === 100 ? '#4CAF50' : '#2196F3',
                height: '100%',
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}>
                  {uploadProgress}%
                </span>
              </div>
            </div>
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              {uploadProgress < 100 ? 'Uploading... Please do not close this page.' : 'Processing...'}
            </small>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isUploading}
          style={{ opacity: isUploading ? 0.6 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}
        >
          {isUploading ? 'Uploading...' : 'Add Music'}
        </button>
      </form>
    </div>
  );
}

export default AddMusic;