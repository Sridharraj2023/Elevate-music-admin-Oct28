import React, { useState, useEffect } from "react";
import { showToast } from "../../utils/toast";
import { sanitizeHtml } from "../../utils/sanitize";
import "../admin.css";

function ManageDisclaimer() {
  const [disclaimers, setDisclaimers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDisclaimer, setEditingDisclaimer] = useState(null);
  const [showPreview, setShowPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "Disclaimer",
    content: "",
    version: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    documentType: "disclaimer",
  });

  useEffect(() => {
    fetchDisclaimers();
  }, []);

  const fetchDisclaimers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/terms/admin/disclaimer`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch disclaimers");

      const data = await response.json();
      setDisclaimers(data);
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

      const url = editingDisclaimer
        ? `${apiUrl}/terms/admin/${editingDisclaimer._id}`
        : `${apiUrl}/terms/admin`;

      const method = editingDisclaimer ? "PUT" : "POST";

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
        throw new Error(error.message || "Failed to save disclaimer");
      }

      await fetchDisclaimers();
      resetForm();
      showToast.success(
        editingDisclaimer ? "Disclaimer updated!" : "Disclaimer created!",
      );
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const handlePublish = async (id) => {
    if (
      !window.confirm(
        "Publish this version as active? This will replace the current active disclaimer.",
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

      await fetchDisclaimers();
      showToast.success("Disclaimer published successfully!");
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

      await fetchDisclaimers();
      showToast.success("Disclaimer unpublished successfully!");
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const handleEdit = (disclaimerItem) => {
    if (disclaimerItem.isActive) {
      showToast.warning(
        "Cannot edit active disclaimer. Create a new version instead.",
      );
      return;
    }

    setEditingDisclaimer(disclaimerItem);
    setFormData({
      title: disclaimerItem.title,
      content: disclaimerItem.content,
      version: disclaimerItem.version,
      effectiveDate: new Date(disclaimerItem.effectiveDate)
        .toISOString()
        .split("T")[0],
      documentType: "disclaimer",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Delete this disclaimer version? This cannot be undone.")
    )
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

      await fetchDisclaimers();
      showToast.success("Disclaimer deleted successfully!");
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "Disclaimer",
      content: "",
      version: "",
      effectiveDate: new Date().toISOString().split("T")[0],
      documentType: "disclaimer",
    });
    setEditingDisclaimer(null);
    setShowForm(false);
  };

  const generateNextVersion = () => {
    if (disclaimers.length === 0) return "1.0";
    const versions = disclaimers
      .map((d) => parseFloat(d.version))
      .filter((v) => !isNaN(v));
    const maxVersion = Math.max(...versions);
    return (maxVersion + 0.1).toFixed(1);
  };

  const getDefaultDisclaimerContent = () => {
    return `<h1>DISCLAIMER</h1>
<p><strong>Last Updated: ${new Date().getFullYear()}</strong></p>

<h2>PLEASE READ THIS DISCLAIMER CAREFULLY BEFORE USING THE ELEVATE APPLICATION</h2>

<h3>1. GENERAL INFORMATION</h3>
<p>The Elevate application ("App") provides binaural beats and audio content for personal wellness, relaxation, focus, and meditation purposes. This disclaimer governs your use of the App.</p>

<h3>2. NOT MEDICAL ADVICE</h3>
<p>The content provided through this App is for informational and entertainment purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment.</p>

<p><strong>ALWAYS SEEK THE ADVICE OF YOUR PHYSICIAN OR OTHER QUALIFIED HEALTH PROVIDER</strong> with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have accessed through this App.</p>

<h3>3. NO MEDICAL CLAIMS</h3>
<p>We make no claims that the audio content, binaural beats, or other features of this App will cure, treat, or prevent any medical condition. The App is not intended for therapeutic purposes and should not be used as a replacement for professional medical treatment.</p>

<h3>4. INDIVIDUAL RESULTS MAY VARY</h3>
<p>Individual experiences with binaural beats and audio content may vary significantly. What works for one person may not work for another. We cannot guarantee specific results from using this App.</p>

<h3>5. USE AT YOUR OWN RISK</h3>
<p>You acknowledge and agree that your use of this App is at your own risk. We shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of the App.</p>

<h3>6. CONSULTATION RECOMMENDED</h3>
<p>If you have any medical conditions, are pregnant, have a pacemaker, or are under the age of 18, please consult with a healthcare professional before using this App.</p>

<h3>7. LIMITATION OF LIABILITY</h3>
<p>To the maximum extent permitted by law, we disclaim all warranties and shall not be liable for any damages arising from your use of this App.</p>

<h3>8. ACCEPTANCE OF TERMS</h3>
<p>By using this App, you acknowledge that you have read, understood, and agree to be bound by this disclaimer.</p>

<p><em>For questions about this disclaimer, please contact us at support@elevateintune.com</em></p>`;
  };

  if (loading) {
    return <div className="loading">Loading disclaimers...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Manage Disclaimer</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              version: generateNextVersion(),
              content: getDefaultDisclaimerContent(),
            }));
            setShowForm(true);
          }}
        >
          Create New Disclaimer
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>
                {editingDisclaimer
                  ? "Edit Disclaimer"
                  : "Create New Disclaimer"}
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
                  placeholder="Enter disclaimer content here (HTML supported)"
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
                  {editingDisclaimer ? "Update" : "Create"}
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

      {/* Disclaimer List */}
      <div className="terms-list">
        {disclaimers.map((disclaimerItem) => (
          <div
            key={disclaimerItem._id}
            className={`terms-card ${disclaimerItem.isActive ? "active" : ""}`}
          >
            <div className="terms-header">
              <div>
                <h3>{disclaimerItem.title}</h3>
                <span className="terms-version">
                  Version {disclaimerItem.version}
                </span>
              </div>
              <div className="terms-badges">
                {disclaimerItem.isActive && (
                  <span className="badge badge-success">Active</span>
                )}
              </div>
            </div>

            <div className="terms-meta">
              <div>
                <strong>Effective Date:</strong>{" "}
                {new Date(disclaimerItem.effectiveDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Created:</strong>{" "}
                {new Date(disclaimerItem.createdAt).toLocaleDateString()}
              </div>
              {disclaimerItem.publishedAt && (
                <div>
                  <strong>Published:</strong>{" "}
                  {new Date(disclaimerItem.publishedAt).toLocaleDateString()}
                </div>
              )}
              {disclaimerItem.publishedBy && (
                <div>
                  <strong>Published By:</strong>{" "}
                  {disclaimerItem.publishedBy.name}
                </div>
              )}
            </div>

            <div className="terms-content-preview">
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(disclaimerItem.content.substring(0, 200) + "..."),
                }}
              />
            </div>

            <div className="terms-actions">
              <button
                className="btn btn-sm btn-info"
                onClick={() => setShowPreview(disclaimerItem)}
              >
                Preview
              </button>

              {!disclaimerItem.isActive && (
                <>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(disclaimerItem)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handlePublish(disclaimerItem._id)}
                  >
                    Publish
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(disclaimerItem._id)}
                  >
                    Delete
                  </button>
                </>
              )}

              {disclaimerItem.isActive && (
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => handleUnpublish(disclaimerItem._id)}
                >
                  Unpublish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {disclaimers.length === 0 && (
        <div className="empty-state">
          <p>
            No disclaimer versions found. Create your first disclaimer to get
            started.
          </p>
        </div>
      )}
    </div>
  );
}

export default ManageDisclaimer;
