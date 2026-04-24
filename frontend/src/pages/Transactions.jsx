// Daye Karibi-Whyte - React component for admin transactions page navigation
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) console.warn("VITE_API_URL is not defined!");
import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/admin.css';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/transactions`);
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
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
      <div style={{ flex: 1, padding: '32px 40px' }}>
        <h2 style={{ marginBottom: 24 }}>Transactions</h2>
        <table className="admin-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Listing ID</th>
              <th>Buyer Email</th>
              <th>Seller Email</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.transaction_id}>
                <td>{tx.transaction_id}</td>
                <td>{tx.listing_id}</td>
                <td>{tx.buyer_email}</td>
                <td>{tx.seller_email}</td>
                <td>{new Date(tx.transaction_timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}