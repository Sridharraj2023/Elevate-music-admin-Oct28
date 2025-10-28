import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../utils/toast";
import "../admin.css";

function ManageSubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    monthlyCost: "",
    annualCost: "",
    adSupported: "No",
    audioFileType: "",
    offlineDownloads: "",
    binauralTracks: "",
    soundscapeTracks: "",
    dynamicAudioFeatures: "No",
    customTrackRequests: "No",
    description: "",
    features: "",
    isDefault: false,
    stripeMonthlyPriceId: "",
    stripeYearlyPriceId: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://elevate-backend-s28.onrender.com";
      const response = await fetch(
        `${apiUrl}/subscription-plans/admin/subscription-plans`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscription plans");
      }

      const data = await response.json();
      setPlans(data.data || []);
    } catch (err) {
      showToast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Edit plan
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://elevate-backend-s28.onrender.com";
      const url = editingPlan
        ? `${apiUrl}/subscription-plans/admin/subscription-plans/${editingPlan._id}`
        : `${apiUrl}/subscription-plans/admin/subscription-plans`;

      const method = editingPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          features: formData.features.split("\n").filter((f) => f.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription plan");
      }

      await fetchPlans();
      resetForm();
      showToast.success(
        editingPlan
          ? "Subscription plan updated successfully!"
          : "Subscription plan created successfully!",
      );
    } catch (err) {
      showToast.error("Error: " + err.message);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      monthlyCost: plan.monthlyCost.toString(),
      annualCost: plan.annualCost.toString(),
      adSupported: plan.adSupported,
      audioFileType: plan.audioFileType,
      offlineDownloads: plan.offlineDownloads,
      binauralTracks: plan.binauralTracks,
      soundscapeTracks: plan.soundscapeTracks,
      dynamicAudioFeatures: plan.dynamicAudioFeatures,
      customTrackRequests: plan.customTrackRequests,
      description: plan.description || "",
      features: plan.features ? plan.features.join("\n") : "",
      isDefault: plan.isDefault,
      stripeMonthlyPriceId: plan.stripeMonthlyPriceId || "",
      stripeYearlyPriceId: plan.stripeYearlyPriceId || "",
    });
    setShowCreateForm(true);
  };

  const handleDeactivate = async (planId) => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate this subscription plan?",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://elevate-backend-s28.onrender.com";
      const response = await fetch(
        `${apiUrl}/subscription-plans/admin/subscription-plans/${planId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to deactivate subscription plan");
      }

      await fetchPlans();
      showToast.success("Subscription plan deactivated successfully!");
    } catch (err) {
      showToast.error("Error: " + err.message);
    }
  };

  const handleActivate = async (planId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://elevate-backend-s28.onrender.com";
      const response = await fetch(
        `${apiUrl}/subscription-plans/admin/subscription-plans/${planId}/activate`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to activate subscription plan");
      }

      await fetchPlans();
      showToast.success("Subscription plan activated successfully!");
    } catch (err) {
      showToast.error("Error: " + err.message);
    }
  };

  const handleSetDefault = async (planId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://elevate-backend-s28.onrender.com";
      const response = await fetch(
        `${apiUrl}/subscription-plans/admin/subscription-plans/${planId}/set-default`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to set default subscription plan");
      }

      await fetchPlans();
      showToast.success("Default subscription plan updated successfully!");
    } catch (err) {
      showToast.error("Error: " + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      monthlyCost: "",
      annualCost: "",
      adSupported: "No",
      audioFileType: "",
      offlineDownloads: "",
      binauralTracks: "",
      soundscapeTracks: "",
      dynamicAudioFeatures: "No",
      customTrackRequests: "No",
      description: "",
      features: "",
      isDefault: false,
      stripeMonthlyPriceId: "",
      stripeYearlyPriceId: "",
    });
    setEditingPlan(null);
    setShowCreateForm(false);
  };

  if (loading) {
    return <div className="loading">Loading subscription plans...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Manage Subscription Plans</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Create New Plan
        </button>
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingPlan
                  ? "Edit Subscription Plan"
                  : "Create New Subscription Plan"}
              </h3>
              <button className="close-btn" onClick={resetForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Plan Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Monthly Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="monthlyCost"
                    value={formData.monthlyCost}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Annual Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="annualCost"
                    value={formData.annualCost}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-section-title">
                <h4>
                  Stripe Price IDs (Optional - Auto-generated if left empty)
                </h4>
                <small>
                  If you already created prices in Stripe, enter them here.
                  Otherwise, they will be created automatically.
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stripe Monthly Price ID</label>
                  <input
                    type="text"
                    name="stripeMonthlyPriceId"
                    value={formData.stripeMonthlyPriceId || ""}
                    onChange={handleInputChange}
                    placeholder="price_xxxxx (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Stripe Yearly Price ID</label>
                  <input
                    type="text"
                    name="stripeYearlyPriceId"
                    value={formData.stripeYearlyPriceId || ""}
                    onChange={handleInputChange}
                    placeholder="price_xxxxx (optional)"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ad Supported *</label>
                <select
                  name="adSupported"
                  value={formData.adSupported}
                  onChange={handleInputChange}
                  required
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div className="form-group">
                <label>Audio File Type *</label>
                <input
                  type="text"
                  name="audioFileType"
                  value={formData.audioFileType}
                  onChange={handleInputChange}
                  placeholder="e.g., 320 kbps MP3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Offline Downloads *</label>
                <input
                  type="text"
                  name="offlineDownloads"
                  value={formData.offlineDownloads}
                  onChange={handleInputChange}
                  placeholder="e.g., 0, 10, Unlimited"
                  required
                />
              </div>

              <div className="form-group">
                <label>Binaural Tracks *</label>
                <input
                  type="text"
                  name="binauralTracks"
                  value={formData.binauralTracks}
                  onChange={handleInputChange}
                  placeholder="e.g., 3 Every, All, None"
                  required
                />
              </div>

              <div className="form-group">
                <label>Soundscape Tracks *</label>
                <input
                  type="text"
                  name="soundscapeTracks"
                  value={formData.soundscapeTracks}
                  onChange={handleInputChange}
                  placeholder="e.g., All, Limited, None"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dynamic Audio Features *</label>
                  <select
                    name="dynamicAudioFeatures"
                    value={formData.dynamicAudioFeatures}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Custom Track Requests *</label>
                  <select
                    name="customTrackRequests"
                    value={formData.customTrackRequests}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Features (one per line)</label>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter each feature on a new line"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                  />
                  Set as Default Plan
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`plan-card ${!plan.isActive ? "inactive" : ""}`}
          >
            <div className="plan-header">
              <h3>{plan.title}</h3>
              <div className="plan-badges">
                {plan.isDefault && (
                  <span className="badge badge-primary">Default</span>
                )}
                {!plan.isActive && (
                  <span className="badge badge-secondary">Inactive</span>
                )}
              </div>
            </div>

            <div className="plan-pricing">
              <div className="price">${plan.monthlyCost.toFixed(2)}/month</div>
              <div className="price-annual">
                ${plan.annualCost.toFixed(2)}/year
              </div>
            </div>

            <div className="plan-features">
              <div className="feature">
                <strong>Audio:</strong> {plan.audioFileType}
              </div>
              <div className="feature">
                <strong>Downloads:</strong> {plan.offlineDownloads}
              </div>
              <div className="feature">
                <strong>Binaural:</strong> {plan.binauralTracks}
              </div>
              <div className="feature">
                <strong>Soundscape:</strong> {plan.soundscapeTracks}
              </div>
              <div className="feature">
                <strong>Ads:</strong> {plan.adSupported}
              </div>
            </div>

            <div className="plan-stripe-info">
              <div className="stripe-price-id">
                <strong>Monthly Price ID:</strong>
                <code>
                  {plan.stripeMonthlyPriceId || plan.stripePriceId || "Not set"}
                </code>
              </div>
              <div className="stripe-price-id">
                <strong>Yearly Price ID:</strong>
                <code>{plan.stripeYearlyPriceId || "Not set"}</code>
              </div>
            </div>

            <div className="plan-actions">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleEdit(plan)}
              >
                Edit
              </button>

              {plan.isActive ? (
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => handleDeactivate(plan._id)}
                >
                  Deactivate
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleActivate(plan._id)}
                >
                  Activate
                </button>
              )}

              {!plan.isDefault && (
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => handleSetDefault(plan._id)}
                >
                  Set Default
                </button>
              )}
            </div>

            <div className="plan-meta">
              <small>
                Created: {new Date(plan.createdAt).toLocaleDateString()}
              </small>
              {plan.effectiveDate && (
                <small>
                  Effective: {new Date(plan.effectiveDate).toLocaleDateString()}
                </small>
              )}
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="empty-state">
          <p>
            No subscription plans found. Create your first plan to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default ManageSubscriptionPlans;
