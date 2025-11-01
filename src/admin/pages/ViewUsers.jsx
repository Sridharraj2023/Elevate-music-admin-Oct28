import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast";
import "../admin.css";

function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [sortOption, setSortOption] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        );
        setUsers(response.data);
      } catch (err) {
        showToast.error(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search and suggestions
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search

    if (query.length >= 2) {
      const lowerQuery = query.toLowerCase();
      const suggestionSet = new Set();

      // Collect suggestions from email and role
      users.forEach((user) => {
        if (user.email.toLowerCase().includes(lowerQuery)) {
          suggestionSet.add(`Email: ${user.email}`);
        }
        if (user.role.toLowerCase().includes(lowerQuery)) {
          suggestionSet.add(`Role: ${user.role}`);
        }
      });

      // Limit to 10 suggestions
      const suggestionArray = Array.from(suggestionSet).slice(0, 10);
      setSuggestions(suggestionArray);
      setShowSuggestions(true);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const query = suggestion.split(": ")[1];
    setSearchQuery(query);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    setCurrentPage(1);
    searchInputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [suggestions, highlightedIndex, showSuggestions]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users based on search query and status
  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch =
        user.email.toLowerCase().includes(lowerQuery) ||
        user.role.toLowerCase().includes(lowerQuery) ||
        (user.name && user.name.toLowerCase().includes(lowerQuery));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active" && user.subscriptionStatus !== "Active")
        return false;
      if (statusFilter === "expired" && user.subscriptionStatus !== "Expired")
        return false;
      if (
        statusFilter === "inactive" &&
        user.subscriptionStatus !== "No Subscription"
      )
        return false;
      if (
        statusFilter === "expiring" &&
        (user.subscriptionStatus !== "Active" || user.daysRemaining > 7)
      )
        return false;
      if (statusFilter === "canceled" && user.subscriptionStatus !== "Canceled")
        return false;
    }

    return true;
  });

  // Sort users based on sortOption
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortOption) {
      case "alphabetical-asc":
        return a.email.localeCompare(b.email);
      case "alphabetical-desc":
        return b.email.localeCompare(a.email);
      case "newest":
        return (
          new Date(b.createdAt || b.updatedAt) -
          new Date(a.createdAt || a.updatedAt)
        );
      case "oldest":
        return (
          new Date(a.createdAt || a.updatedAt) -
          new Date(b.createdAt || b.updatedAt)
        );
      default:
        return 0;
    }
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSort = (type) => {
    let newSortOption;
    switch (type) {
      case "name":
        newSortOption =
          sortOption === "alphabetical-asc"
            ? "alphabetical-desc"
            : "alphabetical-asc";
        break;
      case "email":
        newSortOption =
          sortOption === "alphabetical-asc"
            ? "alphabetical-desc"
            : "alphabetical-asc";
        break;
      case "newest":
        newSortOption = sortOption === "newest" ? "oldest" : "newest";
        break;
      default:
        newSortOption = "newest";
    }
    setSortOption(newSortOption);
    setCurrentPage(1);
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUsers(users.filter((user) => user._id !== userId));
      showToast.success("User deleted successfully");
      if (currentUsers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusBadge = (status, daysRemaining) => {
    if (status === "Active") {
      if (daysRemaining <= 7) {
        return (
          <span className="badge badge-warning">
            Expiring ({daysRemaining}d)
          </span>
        );
      }
      return (
        <span className="badge badge-success">Active ({daysRemaining}d)</span>
      );
    } else if (status === "Expired") {
      return <span className="badge badge-danger">Expired</span>;
    } else if (status === "Canceled") {
      return <span className="badge badge-warning">Canceled</span>;
    } else {
      return <span className="badge badge-secondary">No Subscription</span>;
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const exportToCSV = () => {
    const csvData = sortedUsers.map((user) => ({
      Name: user.name || "N/A",
      Email: user.email,
      Status: user.subscriptionStatus,
      "Payment Date": formatDate(user.subscription?.paymentDate),
      "Expiry Date": formatDate(user.expiryDate),
      "Days Remaining": user.daysRemaining,
      "Auto-Debit": user.autoDebit ? "Yes" : "No",
      Created: formatDate(user.createdAt),
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    showToast.success("Users exported to CSV successfully");
  };

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter((u) => u.subscriptionStatus === "Active").length,
    expired: users.filter((u) => u.subscriptionStatus === "Expired").length,
    expiring: users.filter(
      (u) => u.subscriptionStatus === "Active" && u.daysRemaining <= 7,
    ).length,
  };

  return (
    <div className="card">
      <h2 className="card-title">Manage Users</h2>

      {/* Statistics Dashboard */}
      <div className="stats-container">
        <div className="stat-card total">
          <h3>{stats.total}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card active">
          <h3>{stats.active}</h3>
          <p>Active Subscriptions</p>
        </div>
        <div className="stat-card expired">
          <h3>{stats.expired}</h3>
          <p>Expired</p>
        </div>
        <div className="stat-card expiring">
          <h3>{stats.expiring}</h3>
          <p>Expiring Soon (≤7 days)</p>
        </div>
      </div>

      {/* Search, Filter, Sort, Export */}
      <div
        className="search-sort-container"
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "20px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          className="search-container"
          style={{ position: "relative", flex: "1", minWidth: "250px" }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email or role..."
            value={searchQuery}
            onChange={handleSearchChange}
            ref={searchInputRef}
            aria-label="Search users"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-list" ref={suggestionsRef}>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`suggestion-item ${index === highlightedIndex ? "highlighted" : ""}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="filter-container">
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="canceled">Canceled</option>
            <option value="inactive">No Subscription</option>
          </select>
        </div>

        <div className="sort-container">
          <select
            className="form-control"
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Sort users"
          >
            <option value="alphabetical-asc">Alphabetical (A-Z)</option>
            <option value="alphabetical-desc">Alphabetical (Z-A)</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <button className="btn btn-export" onClick={exportToCSV}>
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : sortedUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table enhanced-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort("name")}>
                    Name {sortOption === "alphabetical-asc" && "↑"}{" "}
                    {sortOption === "alphabetical-desc" && "↓"}
                  </th>
                  <th className="sortable" onClick={() => handleSort("email")}>
                    Email {sortOption === "alphabetical-asc" && "↑"}{" "}
                    {sortOption === "alphabetical-desc" && "↓"}
                  </th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th className="conditional-column">Expiry Date</th>
                  <th className="conditional-column">Days Left</th>
                  <th>Auto-Debit</th>
                  <th className="sortable" onClick={() => handleSort("newest")}>
                    Created {sortOption === "newest" && "↓"}{" "}
                    {sortOption === "oldest" && "↑"}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className={!user.isActive ? "inactive-user" : ""}
                  >
                    <td>{user.name || "N/A"}</td>
                    <td>{user.email}</td>
                    <td>
                      {getStatusBadge(
                        user.subscriptionStatus,
                        user.daysRemaining,
                      )}
                    </td>
                    <td>{formatDate(user.subscription?.paymentDate)}</td>
                    <td className="conditional-column">
                      {user.subscriptionStatus === "No Subscription"
                        ? ""
                        : formatDate(user.expiryDate)}
                    </td>
                    <td className="conditional-column">
                      {user.subscriptionStatus === "No Subscription"
                        ? ""
                        : user.daysRemaining > 0
                          ? `${user.daysRemaining} days`
                          : "N/A"}
                    </td>
                    <td>
                      {user.autoDebit ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-secondary">No</span>
                      )}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-info action-btn"
                          onClick={() => viewUserDetails(user)}
                          title="View user details"
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-danger action-btn"
                          onClick={() => handleDelete(user._id)}
                          title="Delete user"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="pagination"
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`btn ${currentPage === index + 1 ? "btn-primary" : "btn-secondary"}`}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="btn btn-secondary"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details: {selectedUser.name || selectedUser.email}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="user-details">
              <div className="detail-section">
                <h4>Personal Information</h4>
                <p>
                  <strong>Name:</strong> {selectedUser.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Role:</strong> {selectedUser.role}
                </p>
                <p>
                  <strong>User ID:</strong> {selectedUser._id}
                </p>
                <p>
                  <strong>Created:</strong> {formatDate(selectedUser.createdAt)}
                </p>
              </div>

              <div className="detail-section">
                <h4>Subscription Details</h4>
                <p>
                  <strong>Status:</strong>{" "}
                  {getStatusBadge(
                    selectedUser.subscriptionStatus,
                    selectedUser.daysRemaining,
                  )}
                </p>
                <p>
                  <strong>Subscription ID:</strong>{" "}
                  {selectedUser.subscription?.id || "N/A"}
                </p>
                <p>
                  <strong>Stripe Customer ID:</strong>{" "}
                  {selectedUser.stripeCustomerId || "N/A"}
                </p>
                <p>
                  <strong>Payment Date:</strong>{" "}
                  {formatDate(selectedUser.subscription?.paymentDate)}
                </p>
                <p>
                  <strong>Expiry Date:</strong>{" "}
                  {formatDate(selectedUser.expiryDate)}
                </p>
                <p>
                  <strong>Validity:</strong>{" "}
                  {selectedUser.subscription?.validityDays || 0} days
                </p>
                <p>
                  <strong>Days Remaining:</strong>{" "}
                  {selectedUser.daysRemaining > 0
                    ? `${selectedUser.daysRemaining} days`
                    : "N/A"}
                </p>
                <p>
                  <strong>Interval:</strong>{" "}
                  {selectedUser.subscription?.interval || "N/A"}
                </p>
                <p>
                  <strong>Auto-Debit:</strong>{" "}
                  {selectedUser.autoDebit ? "Enabled" : "Disabled"}
                </p>
                <p>
                  <strong>Cancel at Period End:</strong>{" "}
                  {selectedUser.subscription?.cancelAtPeriodEnd ? "Yes" : "No"}
                </p>
              </div>

              <div className="detail-section">
                <h4>Notification Preferences</h4>
                <p>
                  <strong>Email Reminders:</strong>{" "}
                  {selectedUser.notificationPreferences?.emailReminders
                    ? "Enabled"
                    : "Disabled"}
                </p>
                <p>
                  <strong>Push Notifications:</strong>{" "}
                  {selectedUser.notificationPreferences?.pushNotifications
                    ? "Enabled"
                    : "Disabled"}
                </p>
                <p>
                  <strong>Preferred Time:</strong>{" "}
                  {selectedUser.notificationPreferences?.preferredTime || "N/A"}
                </p>
                <p>
                  <strong>Timezone:</strong>{" "}
                  {selectedUser.notificationPreferences?.timezone || "N/A"}
                </p>
                <p>
                  <strong>Last Reminder Sent:</strong>{" "}
                  {formatDate(
                    selectedUser.notificationPreferences?.lastReminderSent,
                  )}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewUsers;
