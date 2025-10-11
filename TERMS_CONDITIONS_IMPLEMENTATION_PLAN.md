# Terms & Conditions Management - Implementation Plan

## 📋 Overview

Implement a complete Terms & Conditions management system where admins can:
- Create and edit Terms & Conditions
- View version history
- Set active/published version
- Preview before publishing
- Users can view current terms

---

## 🏗️ Architecture

### **Backend (Node.js/Express/MongoDB)**
- New model: `TermsAndConditions`
- New routes: Terms & Conditions CRUD operations
- Version control system
- Active/published flag

### **Frontend (React Admin)**
- New admin page: Manage Terms & Conditions
- Rich text editor for content
- Version history viewer
- Publish/unpublish functionality

---

## 📂 Implementation Steps

### **Phase 1: Backend Implementation** (30 minutes)

#### **Step 1.1: Create Database Model**

**File:** `D:\Elevate-Backend\backend\models\TermsAndConditions.js`

```javascript
import mongoose from 'mongoose';

const termsAndConditionsSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'Terms and Conditions'
    },
    content: {
      type: String,
      required: true
    },
    version: {
      type: String,
      required: true,
      unique: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date,
      default: null
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Ensure only one active version at a time
termsAndConditionsSchema.index({ isActive: 1 });

const TermsAndConditions = mongoose.model('TermsAndConditions', termsAndConditionsSchema);

export default TermsAndConditions;
```

**Features:**
- ✅ Version control
- ✅ Only one active version
- ✅ Track who published
- ✅ Effective date tracking

---

#### **Step 1.2: Create Controller**

**File:** `D:\Elevate-Backend\backend\controllers\termsController.js`

```javascript
import asyncHandler from 'express-async-handler';
import TermsAndConditions from '../models/TermsAndConditions.js';

// @desc    Get all terms versions (Admin only)
// @route   GET /api/terms/admin
// @access  Private/Admin
const getAllTermsVersions = asyncHandler(async (req, res) => {
  const terms = await TermsAndConditions.find()
    .populate('publishedBy', 'name email')
    .sort({ createdAt: -1 });
  res.json(terms);
});

// @desc    Get active/published terms
// @route   GET /api/terms/active
// @access  Public
const getActiveTerms = asyncHandler(async (req, res) => {
  const terms = await TermsAndConditions.findOne({ isActive: true });
  
  if (!terms) {
    res.status(404);
    throw new Error('No active terms found');
  }
  
  res.json(terms);
});

// @desc    Get specific terms version
// @route   GET /api/terms/:id
// @access  Private/Admin
const getTermsById = asyncHandler(async (req, res) => {
  const terms = await TermsAndConditions.findById(req.params.id)
    .populate('publishedBy', 'name email');
  
  if (!terms) {
    res.status(404);
    throw new Error('Terms version not found');
  }
  
  res.json(terms);
});

// @desc    Create new terms version
// @route   POST /api/terms/admin
// @access  Private/Admin
const createTerms = asyncHandler(async (req, res) => {
  const { title, content, version, effectiveDate } = req.body;
  
  // Check if version already exists
  const versionExists = await TermsAndConditions.findOne({ version });
  if (versionExists) {
    res.status(400);
    throw new Error('Version already exists');
  }
  
  const terms = await TermsAndConditions.create({
    title,
    content,
    version,
    publishedBy: req.user._id,
    effectiveDate: effectiveDate || Date.now(),
    isActive: false
  });
  
  res.status(201).json(terms);
});

// @desc    Update terms version
// @route   PUT /api/terms/admin/:id
// @access  Private/Admin
const updateTerms = asyncHandler(async (req, res) => {
  const terms = await TermsAndConditions.findById(req.params.id);
  
  if (!terms) {
    res.status(404);
    throw new Error('Terms version not found');
  }
  
  // Don't allow updating if it's active
  if (terms.isActive) {
    res.status(400);
    throw new Error('Cannot edit active terms. Create a new version instead.');
  }
  
  terms.title = req.body.title || terms.title;
  terms.content = req.body.content || terms.content;
  terms.version = req.body.version || terms.version;
  terms.effectiveDate = req.body.effectiveDate || terms.effectiveDate;
  
  const updatedTerms = await terms.save();
  res.json(updatedTerms);
});

// @desc    Publish/activate terms version
// @route   PUT /api/terms/admin/:id/publish
// @access  Private/Admin
const publishTerms = asyncHandler(async (req, res) => {
  const terms = await TermsAndConditions.findById(req.params.id);
  
  if (!terms) {
    res.status(404);
    throw new Error('Terms version not found');
  }
  
  // Deactivate all other versions
  await TermsAndConditions.updateMany(
    { isActive: true },
    { isActive: false }
  );
  
  // Activate this version
  terms.isActive = true;
  terms.publishedAt = Date.now();
  terms.publishedBy = req.user._id;
  
  const publishedTerms = await terms.save();
  res.json(publishedTerms);
});

// @desc    Unpublish terms version
// @route   PUT /api/terms/admin/:id/unpublish
// @access  Private/Admin
const unpublishTerms = asyncHandler(async (req, res) => {
  const terms = await TermsAndConditions.findById(req.params.id);
  
  if (!terms) {
    res.status(404);
    throw new Error('Terms version not found');
  }
  
  terms.isActive = false;
  const unpublishedTerms = await terms.save();
  res.json(unpublishedTerms);
});

// @desc    Delete terms version
// @route   DELETE /api/terms/admin/:id
// @access  Private/Admin
const deleteTerms = asyncHandler(async (req, res) => {
  const terms = await TermsAndConditions.findById(req.params.id);
  
  if (!terms) {
    res.status(404);
    throw new Error('Terms version not found');
  }
  
  // Don't allow deleting active version
  if (terms.isActive) {
    res.status(400);
    throw new Error('Cannot delete active terms version');
  }
  
  await TermsAndConditions.findByIdAndDelete(req.params.id);
  res.json({ message: 'Terms version deleted successfully' });
});

export {
  getAllTermsVersions,
  getActiveTerms,
  getTermsById,
  createTerms,
  updateTerms,
  publishTerms,
  unpublishTerms,
  deleteTerms
};
```

---

#### **Step 1.3: Create Routes**

**File:** `D:\Elevate-Backend\backend\routes\termsRoutes.js`

```javascript
import express from 'express';
import {
  getAllTermsVersions,
  getActiveTerms,
  getTermsById,
  createTerms,
  updateTerms,
  publishTerms,
  unpublishTerms,
  deleteTerms
} from '../controllers/termsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public route
router.get('/active', getActiveTerms);

// Admin routes
router.get('/admin', protect, adminOnly, getAllTermsVersions);
router.post('/admin', protect, adminOnly, createTerms);
router.get('/admin/:id', protect, adminOnly, getTermsById);
router.put('/admin/:id', protect, adminOnly, updateTerms);
router.put('/admin/:id/publish', protect, adminOnly, publishTerms);
router.put('/admin/:id/unpublish', protect, adminOnly, unpublishTerms);
router.delete('/admin/:id', protect, adminOnly, deleteTerms);

export default router;
```

---

#### **Step 1.4: Register Routes**

**File:** `D:\Elevate-Backend\backend\server.js`

Add import:
```javascript
import termsRoutes from './routes/termsRoutes.js';
```

Add route:
```javascript
app.use('/api/terms', termsRoutes);
```

---

### **Phase 2: Frontend Implementation** (45 minutes)

#### **Step 2.1: Create Admin Page**

**File:** `D:\Elevate admin front-end\frontend\src\admin\pages\ManageTermsConditions.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { showToast } from '../../utils/toast';
import '../admin.css';

function ManageTermsConditions() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTerms, setEditingTerms] = useState(null);
  const [showPreview, setShowPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: 'Terms and Conditions',
    content: '',
    version: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${apiUrl}/terms/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch terms');
      
      const data = await response.json();
      setTerms(data);
    } catch (err) {
      showToast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const url = editingTerms 
        ? `${apiUrl}/terms/admin/${editingTerms._id}`
        : `${apiUrl}/terms/admin`;
      
      const method = editingTerms ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save terms');
      }

      await fetchTerms();
      resetForm();
      showToast.success(editingTerms ? 'Terms updated!' : 'Terms created!');
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const handlePublish = async (id) => {
    if (!window.confirm('Publish this version as active?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${apiUrl}/terms/admin/${id}/publish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to publish');

      await fetchTerms();
      showToast.success('Terms published successfully!');
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const handleUnpublish = async (id) => {
    if (!window.confirm('Unpublish this version?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${apiUrl}/terms/admin/${id}/unpublish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to unpublish');

      await fetchTerms();
      showToast.success('Terms unpublished successfully!');
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const handleEdit = (termsItem) => {
    if (termsItem.isActive) {
      showToast.warning('Cannot edit active terms. Create a new version instead.');
      return;
    }
    
    setEditingTerms(termsItem);
    setFormData({
      title: termsItem.title,
      content: termsItem.content,
      version: termsItem.version,
      effectiveDate: new Date(termsItem.effectiveDate).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this terms version?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${apiUrl}/terms/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete');

      await fetchTerms();
      showToast.success('Terms deleted successfully!');
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: 'Terms and Conditions',
      content: '',
      version: '',
      effectiveDate: new Date().toISOString().split('T')[0]
    });
    setEditingTerms(null);
    setShowForm(false);
  };

  const generateNextVersion = () => {
    if (terms.length === 0) return '1.0';
    const versions = terms.map(t => parseFloat(t.version)).filter(v => !isNaN(v));
    const maxVersion = Math.max(...versions);
    return (maxVersion + 0.1).toFixed(1);
  };

  if (loading) {
    return <div className="loading">Loading terms...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Manage Terms & Conditions</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setFormData(prev => ({
              ...prev,
              version: generateNextVersion()
            }));
            setShowForm(true);
          }}
        >
          Create New Version
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>{editingTerms ? 'Edit Terms' : 'Create New Terms Version'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Version *</label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    placeholder="e.g., 1.0, 2.0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Effective Date *</label>
                  <input
                    type="date"
                    name="effectiveDate"
                    value={formData.effectiveDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Content * (Supports HTML)</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="20"
                  placeholder="Enter terms and conditions content here (HTML supported)"
                  required
                  style={{ fontFamily: 'monospace', fontSize: '14px' }}
                />
                <small>You can use HTML tags for formatting</small>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-info"
                  onClick={() => setShowPreview(formData)}
                >
                  Preview
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTerms ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Preview: {showPreview.title}</h3>
              <button className="close-btn" onClick={() => setShowPreview(null)}>×</button>
            </div>
            <div 
              className="terms-preview-content"
              dangerouslySetInnerHTML={{ __html: showPreview.content }}
              style={{
                padding: '20px',
                maxHeight: '600px',
                overflow: 'auto',
                background: 'white',
                borderRadius: '8px'
              }}
            />
            <div className="form-actions">
              <button 
                className="btn btn-primary" 
                onClick={() => setShowPreview(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms List */}
      <div className="terms-list">
        {terms.map(termsItem => (
          <div 
            key={termsItem._id} 
            className={`terms-card ${termsItem.isActive ? 'active' : ''}`}
          >
            <div className="terms-header">
              <div>
                <h3>{termsItem.title}</h3>
                <span className="terms-version">Version {termsItem.version}</span>
              </div>
              <div className="terms-badges">
                {termsItem.isActive && (
                  <span className="badge badge-success">Active</span>
                )}
              </div>
            </div>

            <div className="terms-meta">
              <div><strong>Effective Date:</strong> {new Date(termsItem.effectiveDate).toLocaleDateString()}</div>
              <div><strong>Created:</strong> {new Date(termsItem.createdAt).toLocaleDateString()}</div>
              {termsItem.publishedAt && (
                <div><strong>Published:</strong> {new Date(termsItem.publishedAt).toLocaleDateString()}</div>
              )}
              {termsItem.publishedBy && (
                <div><strong>Published By:</strong> {termsItem.publishedBy.name}</div>
              )}
            </div>

            <div className="terms-content-preview">
              <div 
                dangerouslySetInnerHTML={{ __html: termsItem.content.substring(0, 200) + '...' }}
              />
            </div>

            <div className="terms-actions">
              <button 
                className="btn btn-sm btn-info"
                onClick={() => setShowPreview(termsItem)}
              >
                Preview
              </button>

              {!termsItem.isActive && (
                <>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(termsItem)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handlePublish(termsItem._id)}
                  >
                    Publish
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(termsItem._id)}
                  >
                    Delete
                  </button>
                </>
              )}

              {termsItem.isActive && (
                <button 
                  className="btn btn-sm btn-warning"
                  onClick={() => handleUnpublish(termsItem._id)}
                >
                  Unpublish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {terms.length === 0 && (
        <div className="empty-state">
          <p>No terms versions found. Create your first version to get started.</p>
        </div>
      )}
    </div>
  );
}

export default ManageTermsConditions;
```

---

#### **Step 2.2: Add CSS Styles**

**File:** `D:\Elevate admin front-end\frontend\src\admin\admin.css`

Add at the end:
```css
/* Terms & Conditions Styles */
.terms-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.terms-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.terms-card.active {
  border-color: #28a745;
  background: #f8fff9;
}

.terms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.terms-header h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.terms-version {
  background: #6c757d;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.terms-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
}

.terms-content-preview {
  padding: 16px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 16px;
  max-height: 150px;
  overflow: hidden;
  position: relative;
}

.terms-content-preview::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(transparent, white);
}

.terms-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.terms-preview-content {
  line-height: 1.6;
}

.terms-preview-content h1,
.terms-preview-content h2,
.terms-preview-content h3 {
  margin-top: 24px;
  margin-bottom: 12px;
  color: #333;
}

.terms-preview-content p {
  margin-bottom: 12px;
}

.terms-preview-content ul,
.terms-preview-content ol {
  margin-bottom: 16px;
  padding-left: 24px;
}

.modal-content.large {
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
}
```

---

#### **Step 2.3: Update Routes**

**File:** `D:\Elevate admin front-end\frontend\src\App.jsx`

Add import:
```javascript
import ManageTermsConditions from './admin/pages/ManageTermsConditions.jsx';
```

Add route in admin section:
```javascript
<Route path="manage-terms" element={<ManageTermsConditions />} />
```

---

#### **Step 2.4: Update Dashboard**

**File:** `D:\Elevate admin front-end\frontend\src\admin\pages\Dashboard.jsx`

Add new section:
```jsx
{/* Terms & Conditions Section */}
<div className="manage-section">
  <h3>Manage Terms & Conditions</h3>
  <div className="dashboard-grid">
    <Link to="/admin/manage-terms" className="module-card">
      <h4 className="module-title">Terms & Conditions</h4>
      <p className="module-description">Create and manage terms & conditions versions.</p>
    </Link>
  </div>
</div>
```

---

### **Phase 3: User View (Optional)** (15 minutes)

#### **Step 3.1: Create User Terms Viewer**

**File:** `D:\Elevate admin front-end\frontend\src\components\ViewTerms.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { showToast } from '../utils/toast';

function ViewTerms() {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTerms();
  }, []);

  const fetchActiveTerms = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/terms/active`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setTerms(null);
          return;
        }
        throw new Error('Failed to fetch terms');
      }
      
      const data = await response.json();
      setTerms(data);
    } catch (err) {
      showToast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading terms...</div>;
  }

  if (!terms) {
    return (
      <div className="empty-state">
        <p>No terms and conditions available at this time.</p>
      </div>
    );
  }

  return (
    <div className="terms-viewer">
      <div className="terms-header">
        <h1>{terms.title}</h1>
        <div className="terms-info">
          <span>Version {terms.version}</span>
          <span>Effective Date: {new Date(terms.effectiveDate).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div 
        className="terms-content"
        dangerouslySetInnerHTML={{ __html: terms.content }}
      />
    </div>
  );
}

export default ViewTerms;
```

---

## ✅ Testing Checklist

### **Backend Tests:**
- [ ] Create new terms version
- [ ] Update terms version
- [ ] Publish terms version
- [ ] Unpublish terms version
- [ ] Delete terms version
- [ ] Get active terms (public)
- [ ] Get all versions (admin)
- [ ] Only one active version at a time

### **Frontend Tests:**
- [ ] Admin can create new version
- [ ] Admin can edit draft version
- [ ] Admin cannot edit published version
- [ ] Admin can publish version
- [ ] Admin can unpublish version
- [ ] Admin can delete draft version
- [ ] Admin cannot delete published version
- [ ] Preview works correctly
- [ ] HTML content renders properly
- [ ] Users can view active terms

---

## 🎯 Features Summary

### **Admin Features:**
✅ Create multiple versions
✅ Edit draft versions
✅ Preview before publishing
✅ Publish/unpublish versions
✅ Version control
✅ Track who published
✅ Delete draft versions
✅ HTML content support

### **Security:**
✅ Admin-only access to management
✅ Cannot edit active version
✅ Cannot delete active version
✅ Only one active version
✅ Authentication required

### **User Features:**
✅ View current active terms
✅ See version info
✅ Formatted HTML display

---

## 📚 API Endpoints Summary

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/terms/active` | Public | Get active terms |
| GET | `/api/terms/admin` | Admin | Get all versions |
| GET | `/api/terms/admin/:id` | Admin | Get specific version |
| POST | `/api/terms/admin` | Admin | Create new version |
| PUT | `/api/terms/admin/:id` | Admin | Update version |
| PUT | `/api/terms/admin/:id/publish` | Admin | Publish version |
| PUT | `/api/terms/admin/:id/unpublish` | Admin | Unpublish version |
| DELETE | `/api/terms/admin/:id` | Admin | Delete version |

---

## 🚀 Implementation Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Backend Model | 10 min | ⏳ Pending |
| 2 | Backend Controller | 15 min | ⏳ Pending |
| 3 | Backend Routes | 5 min | ⏳ Pending |
| 4 | Frontend Page | 30 min | ⏳ Pending |
| 5 | Frontend Routing | 5 min | ⏳ Pending |
| 6 | Testing | 15 min | ⏳ Pending |
| **Total** | | **1.5 hours** | |

---

## 📝 Notes

- HTML content is supported for rich formatting
- Version numbers can be any string (e.g., "1.0", "2.0", "2024.1")
- Only one version can be active at a time
- Published versions cannot be edited (must create new version)
- Published versions cannot be deleted

---

Ready to implement? Let me know, and I'll start with the backend!

