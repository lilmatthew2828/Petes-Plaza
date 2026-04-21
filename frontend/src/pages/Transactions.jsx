// Daye Karibi-Whyte - React component for admin transactions page navigation
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/admin.css';

const API_URL = import.meta.env.VITE_API_URL

// Normalize API_URL to avoid double /api/api
function apiUrl(path) {
  let url = API_URL;
  if (url.endsWith("/")) url = url.slice(0, -1);
  if (path.startsWith("/")) return url + path;
  return url + "/" + path;
}

if (!API_URL) console.warn("VITE_API_URL is not defined!");

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      const url = apiUrl('/admin/transactions');
      console.log("[Transactions] Fetching from:", url);
      try {
        const res = await fetch(url);
        console.log("[Transactions] Response status:", res.status, res.ok);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("[Transactions] Response error:", errorText);
          throw new Error(`Failed to fetch transactions: ${res.status} ${errorText}`);
        }
        const data = await res.json();
        console.log("[Transactions] Data received:", data);
        setTransactions(data);
      } catch (err) {
        console.error("[Transactions] Catch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Sidebar toggle handlers
  const handleSidebarToggle = () => setSidebarOpen(open => !open);
  const handleSidebarMouseEnter = () => setSidebarOpen(true);
  const handleSidebarMouseLeave = () => setSidebarOpen(false);

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error) return <div className="error">Error: {error}</div>;

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
        <AdminSidebar active="transactions" open={sidebarOpen} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32px 40px', marginLeft: 60 }}>
        <h2 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#1e293b', fontFamily: 'Inter, sans-serif', letterSpacing: '-1px', marginBottom: 32 }}>Transactions</h2>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 48, marginBottom: 24 }}>
            <span style={{ fontSize: 48, color: '#2563eb', display: 'block', marginBottom: 16 }}>💳</span>
            <h3 style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.4rem', marginBottom: 8 }}>No transactions yet</h3>
            <p style={{ color: '#64748b', fontSize: 16 }}>When users make purchases, they will appear here.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Listing ID</th>
                  <th>Buyer Email</th>
                  <th>Seller Email</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.transaction_id}>
                    <td>{tx.transaction_id}</td>
                    <td>{tx.listing_id}</td>
                    <td>{tx.buyer_email}</td>
                    <td>{tx.seller_email}</td>
                    <td>{new Date(tx.transaction_timestamp).toLocaleDateString()} {new Date(tx.transaction_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600 }}
                        onClick={() => navigate(`/listings/${tx.listing_id}`)}
                      >
                        View Listing
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}