import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../styles/admin.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ total_users: 0, total_listings: 0, active_listings: 0, pending_review: 0 });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sidebar toggle handlers
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  const handleSidebarMouseEnter = () => setSidebarOpen(true);
  const handleSidebarMouseLeave = () => setSidebarOpen(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const metricsRes = await fetch('/api/admin/metrics');
        const listingsRes = await fetch('/api/admin/listings');
        const userGrowthRes = await fetch('/api/admin/user_growth');
        if (!metricsRes.ok || !listingsRes.ok) {
          throw new Error('Failed to fetch admin data');
        }
        const metricsData = await metricsRes.json();
        const listingsData = await listingsRes.json();
        let userGrowthData = [];
        if (userGrowthRes.ok) {
          userGrowthData = await userGrowthRes.json();
        }
        setUserGrowth(userGrowthData);
        // Calculate pending_review from listings with status 'pending' or similar
        const pending_review = Array.isArray(listingsData)
          ? listingsData.filter(l => l.status === 'pending' || l.status === 'review').length
          : 0;
        setMetrics({
          total_users: metricsData.total_users,
          total_listings: metricsData.total_listings,
          active_listings: metricsData.active_listings,
          pending_review,
        });
        setListings(listingsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format user growth data for chart (earliest date on left)
  const reversedGrowth = [...userGrowth].sort((a, b) => new Date(a.date) - new Date(b.date));
  const userGrowthChartData = {
    labels: reversedGrowth.map(d => d.date.slice(5)),
    datasets: [
      {
        label: 'New Users',
        data: reversedGrowth.map(d => d.count),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        fill: true,
        tension: 0, 
      },
    ],
  };
  const salesData = {
    labels: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'],
    datasets: [
      {
        label: 'Sales',
        data: [100, 150, 180, 160, 200, 239, 320],
        backgroundColor: '#fbbf24',
        borderColor: '#fbbf24',
        fill: false,
      },
    ],
  };

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-dashboard-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#e7ecf4', position: 'relative' }}>
      {/* Sidebar toggle icon */}
      <div
        style={{ position: 'absolute', top: 24, left: 24, zIndex: 110 }}
        onClick={handleSidebarToggle}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <div className="sidebar-toggle" style={{ cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <span style={{ fontSize: 28, fontWeight: 700 }}>☰</span>
        </div>
      </div>
      <div
        style={{ position: 'absolute', left: 0, top: 0, height: '100%', zIndex: 100 }}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <AdminSidebar active="dashboard" open={sidebarOpen} />
      </div>
      <div className="admin-main" style={{ flex: 1, padding: '32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#1e293b', fontFamily: 'Inter, sans-serif', letterSpacing: '-1px', marginLeft: 60 }}>Admin Dashboard</h2>
          <div style={{ borderRadius: '50%', background: '#f3f4f6', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24, color: '#888' }}>👤</span>
          </div>
        </div>
        {/* Back to Homepage button at bottom right */}
        <div style={{ position: 'fixed', bottom: 32, right: 48, zIndex: 50 }}>
          <button style={{ padding: '12px 24px', fontWeight: 700, fontSize: 16, borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(37,99,235,0.12)', cursor: 'pointer' }} onClick={() => window.location.href = '/homepage'}>
            Back to Homepage
          </button>
        </div>
        <div className="metrics" style={{ marginBottom: 32 }}>
          <div className="card">
            <h3>Total Users</h3>
            <span style={{ fontSize: 32, fontWeight: 700 }}>{metrics.total_users}</span>
          </div>
          <div className="card">
            <h3>Pending Review <span style={{ color: '#fbbf24', fontSize: 12, marginLeft: 4 }}>•</span></h3>
            <span style={{ fontSize: 32, fontWeight: 700 }}>{metrics.pending_review}</span>
          </div>
          <div className="card">
            <h3>Active Listings</h3>
            <span style={{ fontSize: 32, fontWeight: 700 }}>{metrics.active_listings}</span>
            <span style={{ display: 'block', marginTop: 8, color: '#2563eb', fontSize: 14, cursor: 'pointer' }}>View All &gt;</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h4 style={{ marginBottom: 16, fontWeight: 700, fontSize: '1.2rem', color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>User Growth (Last 30 Days)</h4>
            <Line data={userGrowthChartData} options={{ plugins: { legend: { display: false } } }} height={120} />
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h4 style={{ marginBottom: 16, fontWeight: 700, fontSize: '1.2rem', color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>Daily Sales</h4>
            <Bar data={salesData} options={{ plugins: { legend: { display: false } } }} height={120} />
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h4 style={{ marginBottom: 16, fontWeight: 700, fontFamily: 'Inter, sans-serif', fontSize: '1.2rem', color: '#1e293b' }}>Listings</h4>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Price</th>
                <th>Listing Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing, idx) => (
                <tr key={idx}>
                  <td>{listing.title}</td>
                  <td>{listing.email || listing.seller_email || ''}</td>
                  <td>{listing.category || listing.description || ''}</td>
                  <td>${listing.price}</td>
                  <td style={{ color: listing.status === 'pending' ? '#fbbf24' : listing.status === 'active' ? '#10b981' : listing.status === 'sold' ? '#2724c9' : '#6b7280', fontFamily: 'Inter, sans-serif'}}>{listing.status}</td>
                  <td>
                    {listing.status === 'pending' || listing.status === 'review' ? (
                      <>
                        <button style={{ marginRight: 6 }} onClick={() => handleModerate(listing.id, 'approve')}>Accept</button>
                        <button style={{ marginRight: 6 }} onClick={() => handleModerate(listing.id, 'deny')}>Deny</button>
                      </>
                    ) : null}
                    {listing.status === 'active' ? (
                      <button style={{ marginRight: 6 }} onClick={() => handleDelete(listing.id)}>Delete</button>
                    ) : null}
                    <button style={{ marginRight: 6 }} onClick={() => handleModerate(listing.id, 'archive')}>Archive</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}