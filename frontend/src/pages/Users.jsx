import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/admin/users");

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError("Could not load users.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (email) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/admin/suspend/${email}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to suspend user");
      }

      alert("User suspended successfully");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to suspend user");
    }
  };

  const handleViewListings = (email) => {
    alert(`View listings for ${email} coming next`);
  };

  return (
    <div className="admin-dashboard-root">
      <AdminSidebar active="users" open={sidebarOpen} />

      <div className="admin-dashboard-main">
        <div className="admin-dashboard-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <h1>Users</h1>
        </div>

        <div className="admin-card">
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>School</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.email}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.school}</td>
                    <td>
                      <button
                        className="admin-action-btn"
                        onClick={() => handleViewListings(user.email)}
                      >
                        View Listings
                      </button>

                      <button
                        className="admin-action-btn suspend"
                        onClick={() => handleSuspendUser(user.email)}
                      >
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}