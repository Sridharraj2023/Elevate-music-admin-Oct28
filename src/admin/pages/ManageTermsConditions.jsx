import React, { useState, useEffect } from "react";
import { showToast } from "../../utils/toast";
import { sanitizeHtml } from "../../utils/sanitize";
import "../admin.css";

function ManageTermsConditions() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTerms, setEditingTerms] = useState(null);
  const [showPreview, setShowPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "Terms and Conditions",
    content: "",
    version: "",
    effectiveDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/terms/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch terms");

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const url = editingTerms
        ? `${apiUrl}/terms/admin/${editingTerms._id}`
        : `${apiUrl}/terms/admin`;

      const method = editingTerms ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save terms");
      }

      await fetchTerms();
      resetForm();
      showToast.success(editingTerms ? "Terms updated!" : "Terms created!");
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const handlePublish = async (id) => {
    if (
      !window.confirm(
        "Publish this version as active? This will replace the current active version.",
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/terms/admin/${id}/publish`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to publish");

      await fetchTerms();
      showToast.success("Terms published successfully!");
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const handleUnpublish = async (id) => {
    if (!window.confirm("Unpublish this version?")) return;

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/terms/admin/${id}/unpublish`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to unpublish");

      await fetchTerms();
      showToast.success("Terms unpublished successfully!");
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const handleEdit = (termsItem) => {
    if (termsItem.isActive) {
      showToast.warning(
        "Cannot edit active terms. Create a new version instead.",
      );
      return;
    }

    setEditingTerms(termsItem);
    setFormData({
      title: termsItem.title,
      content: termsItem.content,
      version: termsItem.version,
      effectiveDate: new Date(termsItem.effectiveDate)
        .toISOString()
        .split("T")[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this terms version? This cannot be undone."))
      return;

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/terms/admin/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete");

      await fetchTerms();
      showToast.success("Terms deleted successfully!");
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "Terms and Conditions",
      content: "",
      version: "",
      effectiveDate: new Date().toISOString().split("T")[0],
    });
    setEditingTerms(null);
    setShowForm(false);
  };

  const generateNextVersion = () => {
    if (terms.length === 0) return "1.0";
    const versions = terms
      .map((t) => parseFloat(t.version))
      .filter((v) => !isNaN(v));
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
            setFormData((prev) => ({
              ...prev,
              version: generateNextVersion(),
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
              <h3>
                {editingTerms ? "Edit Terms" : "Create New Terms Version"}
              </h3>
              <button className="close-btn" onClick={resetForm}>
                ×
              </button>
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
                  style={{ fontFamily: "monospace", fontSize: "14px" }}
                />
                <small>
                  You can use HTML tags for formatting (h1, h2, h3, p, ul, ol,
                  li, strong, em, etc.)
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
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
                  {editingTerms ? "Update" : "Create"}
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
              <button
                className="close-btn"
                onClick={() => setShowPreview(null)}
              >
                ×
              </button>
            </div>
            <div
              className="terms-preview-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(showPreview.content) }}
              style={{
                padding: "20px",
                maxHeight: "600px",
                overflow: "auto",
                background: "white",
                borderRadius: "8px",
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
        {terms.map((termsItem) => (
          <div
            key={termsItem._id}
            className={`terms-card ${termsItem.isActive ? "active" : ""}`}
          >
            <div className="terms-header">
              <div>
                <h3>{termsItem.title}</h3>
                <span className="terms-version">
                  Version {termsItem.version}
                </span>
              </div>
              <div className="terms-badges">
                {termsItem.isActive && (
                  <span className="badge badge-success">Active</span>
                )}
              </div>
            </div>

            <div className="terms-meta">
              <div>
                <strong>Effective Date:</strong>{" "}
                {new Date(termsItem.effectiveDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Created:</strong>{" "}
                {new Date(termsItem.createdAt).toLocaleDateString()}
              </div>
              {termsItem.publishedAt && (
                <div>
                  <strong>Published:</strong>{" "}
                  {new Date(termsItem.publishedAt).toLocaleDateString()}
                </div>
              )}
              {termsItem.publishedBy && (
                <div>
                  <strong>Published By:</strong> {termsItem.publishedBy.name}
                </div>
              )}
            </div>

            <div className="terms-content-preview">
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(termsItem.content.substring(0, 200) + "..."),
                }}
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
          <p>
            No terms versions found. Create your first version to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default ManageTermsConditions;
