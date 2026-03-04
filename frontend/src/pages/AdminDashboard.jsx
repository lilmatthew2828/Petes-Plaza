
/* 
All the different html elements definitions
div - A container element that can be used to group other elements together. It is often used for layout purposes.
h1, h2, h3, h4 - Heading elements that are used to define the hierarchy of content on a page. h1 is the most important heading, while h4 is the least important.
p - A paragraph element that is used to define a block of text.
table, thead, tbody, tr, th, td - Elements used to create tables. table is the container for the entire table, thead defines the header section, tbody defines the body section, tr defines a table row, th defines a header cell, and td defines a standard cell.
button - An interactive element that can be clicked to perform an action.
span - An inline container element that can be used to group text or other inline elements together.

*/
import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Line, Bar } from 'react-chartjs-2'; // Import chart components from react-chartjs-2 wrapper for Chart.js, This allows us to easily use Chart.js in React.
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
} from 'chart.js'; // Import the necessary Chart.js components, This is required for Chart.js v4 tree shaking which is a graph optimization technique.
import '../styles/admin.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend); // Register necessary Chart.js components

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ total_users: 0, total_listings: 0, active_listings: 0, pending_review: 0 });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [message, setMessage] = useState(''); // for alerts/notifications
  const showMessage = (text) => {
    setMessage(text);                // show the message
    setTimeout(() => setMessage(''), 7000);  // clear after 7 seconds
  };

  // Sidebar toggle handlers
  const handleSidebarToggle = () => setSidebarOpen((open) => !open); // Toggle sidebar open state when the toggle icon is clicked
  const handleSidebarMouseEnter = () => setSidebarOpen(true); // Open sidebar when mouse enters the toggle area
  const handleSidebarMouseLeave = () => setSidebarOpen(false); // Close sidebar when mouse leaves the toggle area
  const handleModerate = async (listingId, action) => {
    try {
      const res = await fetch(
        `/api/admin/listings/${listingId}/moderate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }
      )

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Moderation failed')
      }

      const updated = await res.json()

      setListings(prev =>
        prev.map(l =>
          l.id === listingId ? { ...l, status: updated.status } : l
        ) // Update the listing status in the local state to reflect the change without needing to refetch the entire list
      )

      if (action === "approve") {
        showMessage("Listing successfully approved. It is now active.")
      } else if (action === "deny") {
        showMessage("Listing successfully denied. It will not be displayed on the home page.")
      } else if (action === "mark_sold") {
        showMessage("Listing successfully marked as sold.")
      } else if (action === "archive") { 
        showMessage("Listing successfully archived. It will be removed from the homepage but still visible in the admin panel.")
      }

    } catch (err) {
      alert(err.message)
    }
  };

  const handleDelete = async (listingId) => {
    try {
      const res = await fetch(
        `/api/admin/listings/${listingId}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Delete failed')
      }

      setListings(prev => prev.filter(l => l.id !== listingId))

      showMessage("Listing successfully deleted.")

    } catch (err) {
      alert(err.message)
    }
  };
  const handleViewDetails = (listingId) => {
    // For simplicity, we'll just alert the listing ID. In a real implementation, this would open a modal with the listing details fetched from the backend.
    alert(`View details for listing ID: ${listingId}`);
  };

  useEffect(() => { // Fetch admin metrics and listings data from backend API when component mounts
    const fetchData = async () => {
      try {
        setLoading(true);
        const metricsRes = await fetch('/api/admin/metrics'); // This endpoint should return an object like { total_users: number, total_listings: number, active_listings: number } for the top metrics cards
        const listingsRes = await fetch('/api/admin/listings'); // This endpoint should return a list of all listings with their status for the admin table. This routes to the same endpoint as the homepage. The difference is that the homepage only shows active listings, while this endpoint returns all listings for moderation purposes.
        const userGrowthRes = await fetch('/api/admin/user_growth'); // This endpoint should return an array of { date: 'YYYY-MM-DD', count: number } for user signups over the last 30 days
        if (!metricsRes.ok || !listingsRes.ok) {
          throw new Error('Failed to fetch admin data');
        }
        const metricsData = await metricsRes.json();
        const listingsData = await listingsRes.json();
        let userGrowthData = [];
        if (userGrowthRes.ok) {
          userGrowthData = await userGrowthRes.json();
        }
        //The user growth graph should have the plot points of the last 30 days of user signups. even if the value of a day is 0
        setUserGrowth(userGrowthData);
        const fetchActiveUsers = async () => {
          const res = await fetch('/api/admin/active_users');
          if (!res.ok) return;
          const data = await res.json();
          setActiveUsers(data);
        };
        fetchActiveUsers();
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

  // Fills last 30 days with 0 if no user signups on that day to ensure the user growth chart always shows 30 days of data
  const fillLast30Days = (data) => {
    const result = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const dayStr = day.toISOString().slice(0, 10);
      const match = data.find(d => d.date === dayStr);
      result.push({ date: dayStr, count: match ? Number(match.count) : 0 });
    }
    return result;
  };
  // Fill missing days for user growth
  const filledUserGrowth = fillLast30Days(userGrowth);
  // Format user growth data for chart (earliest date on left)
  const reversedGrowth = [...filledUserGrowth].sort((a, b) => new Date(a.date) - new Date(b.date));
  const userGrowthChartData = {
    labels: reversedGrowth.map(d => d.date.slice(5)),
    datasets: [
      {
        label: 'New Users',
        data: reversedGrowth.map(d => d.count),  // now guaranteed numeric
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        fill: true,
        tension: 0.4,  // smooth curve
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
  const userGrowthChartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#555', font: { size: 12 } },
      },
      y: {
        grid: { color: '#eee' },
        ticks: {
          color: '#555',
          font: { size: 12 },
          beginAtZero: true,  // start Y-axis at 0
          stepSize: 1,        // optional: force nice increments
        },
        suggestedMin: 0,      // ensures chart doesn’t go negative
        suggestedMax: Math.max(...reversedGrowth.map(d => d.count)) + 5, // add some padding
      },
    },
  };
  const filledActiveUsers = fillLast30Days(activeUsers);
  const reversedActive = [...filledActiveUsers].sort((a, b) => new Date(a.date) - new Date(b.date));


  const activeUsersChartData = {
    labels: reversedActive.map(d => d.date.slice(5)),
    datasets: [
      {
        label: 'Active Users',
        data: reversedActive.map(d => d.count),
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
  const activeUsersChartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#555', font: { size: 12 } },
      },
      y: {
        grid: { color: '#eee' },
        ticks: {
          color: '#555',
          font: { size: 12 },
          beginAtZero: true,
        },
        suggestedMin: 0,
        suggestedMax: Math.max(...reversedActive.map(d => d.count)) + 5,
      },
    },
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
            <div
              style={{
                flex: 1,
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                minHeight: 250,   // fixed minimum height
                maxHeight: 300,   // optional maximum height
              }}
            >
              <Line
                data={userGrowthChartData}
                options={{
                  ...userGrowthChartOptions,
                  responsive: true,
                  maintainAspectRatio: false, // safe now because parent has fixed height
                }}
              />
            </div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h4 style={{ marginBottom: 16, fontWeight: 700, fontSize: '1.2rem', color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
              Daily Active Users (Last 30 Days)
            </h4>
            <div
              style={{
                flex: 1,
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                minHeight: 250,
                maxHeight: 300,
              }}
            >
              <Line
                data={activeUsersChartData}
                options={{
                  ...activeUsersChartOptions,
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </div>
        {message && (
          <div style={{ marginBottom: 16, color: '#2563eb', fontWeight: 600 }}>
            {message}
          </div>
        )}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h4 style={{ marginBottom: 16, fontWeight: 700, fontFamily: 'Inter, sans-serif', fontSize: '1.2rem', color: '#1e293b' }}>Listings</h4>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Listing Date</th>
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
                  {/* Format created_at date to MM/DD/YYYY format for display in the table. Also make sure its in EST time instead of whatever timezone its in.*/}
                  <td>{new Date(listing.created_at).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</td>
                  <td>{listing.email || listing.seller_email || ''}</td> {/* Show email if available, fallback to seller_email for older listings, otherwise empty string */}
                  <td>{listing.category || ''}</td> {/* Show category if available*/}
                  <td>${parseFloat(listing.price).toFixed(2)}</td> {/* Format price with dollar sign  and have two leading zeros after the decimal point if not already present*/}
                  <td style={{ color: listing.status === 'pending' ? '#fbbf24' : listing.status === 'active' ? '#10b981' : listing.status === 'sold' ? '#2724c9' : listing.status === 'deleted' ? '#8f0e0e' : listing.status === 'denied' ? '#c54e23' : '#000000', fontFamily: 'Inter, sans-serif' }}>{listing.status}</td>
                  <td>
                    {listing.status === 'pending' || listing.status === 'review' ? (
                      <>
                        <button style={{ marginRight: 6, backgroundColor: '#38b169', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }} onClick={() => handleModerate(listing.id, 'approve')}>Accept</button> {/* Approve Button should be green and more prominent than the archive button since accepting a listing is a more positive action than archiving. Archive button is going to be yellow. */}
                        <button style={{ marginRight: 6, backgroundColor: '#f56565', color: '#1e293b', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }} onClick={() => handleModerate(listing.id, 'deny')}>Deny</button> {/* Deny Button should be a simple text button since denying a listing is a softer action than deleting. Delete button is going to be red and more prominent than the deny button since deleting is a more severe action than denying. */}
                      </>
                    ) : null}
                    {listing.status === 'active' ? (
                      <><><button style={{ marginRight: 6, backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }} onClick={() => handleDelete(listing.id)}>Delete</button>
                        <button style={{
                          marginRight: 6,
                          backgroundColor: '#f1f5f9', // Light gray 
                          color: '#475569',           // Dark slate text
                          border: '1px solid #cbd5e1',
                          borderRadius: 4,
                          padding: '6px 12px',
                          cursor: 'pointer'
                        }} onClick={() => handleModerate(listing.id, 'archive')}>
                          Archive</button></>
                        <button style={{ marginRight: 6, backgroundColor: '#38a169', color: '#1e293b', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }} onClick={() => handleModerate(listing.id, 'mark_sold')}>Mark Sold</button></>) : null} {/* Delete Button should be red and more prominent than the archive button since archiving is a softer action than deleting. Archive button is going to be yellow. */}
                    {/*There should be another button that allows you to view the full listing details in a modal or separate page. This is important for the admin to be able to see the full listing information, description, and image before making a decision to approve or deny. The button can be a simple "View Full Lisiting" button that opens a modal with the listing details.*/}
                    {listing.status == 'denied' ? (
                      <button style={{ marginRight: 6, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }} onClick={() => handleModerate(listing.id, 'approve')}>Reactivate</button>
                    ) : null}
                    <button style={{ marginRight: 6, backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }} onClick={() => handleViewDetails(listing.id)}>View Full Listing</button>
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
