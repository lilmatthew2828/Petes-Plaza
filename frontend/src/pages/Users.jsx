const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) console.warn("VITE_API_URL is not defined!");
import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/admin.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emailSearch, setEmailSearch] = useState('');

  // Fetch all users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/users`);
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Sidebar toggle handlers
  const handleSidebarToggle = () => setSidebarOpen(open => !open);
  const handleSidebarMouseEnter = () => setSidebarOpen(true);
  const handleSidebarMouseLeave = () => setSidebarOpen(false);

  // Suspend user
  const suspendUser = async (email) => {
    if (!window.confirm(`Suspend user ${email}?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/suspend/${email}`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('Failed to suspend user');
      setUsers(prev => prev.map(u => u.email === email ? { ...u, is_suspended: true } : u));
      alert('User suspended');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Filter users by search
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(emailSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#e7ecf4', position: 'relative' }}>
      {/* Sidebar toggle icon */}
      <div
        style={{ position: 'absolute', top: 24, left: 24, zIndex: 110 }}
        onClick={handleSidebarToggle}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <div style={{
          cursor: 'pointer',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <span style={{ fontSize: 28, fontWeight: 700 }}>☰</span>
        </div>
      </div>

      {/* Sidebar */}
      <div
        style={{ position: 'absolute', left: 0, top: 0, height: '100%', zIndex: 100 }}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <AdminSidebar active="users" open={sidebarOpen} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32px 40px' }}>
        <h2 style={{ marginBottom: 24 }}>Users</h2>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search by email..."
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          style={{ marginBottom: 16, padding: 8, width: '300px', borderRadius: 6, border: '1px solid #ccc' }}
        />

        {/* Users table */}
        <table className="admin-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>{user.is_suspended ? 'Suspended' : 'Active'}</td>
                <td>
                  {!user.is_suspended && (
                    <button
                      className="btn btn-danger"
                      onClick={() => suspendUser(user.email)}
                      style={{ padding: '4px 8px', fontSize: 14 }}
                    >
                      Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}