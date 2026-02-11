import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/admin.css'

// Mock data - will replace with actual API calls
const MOCK_METRICS = {
  totalUsers: 42,
  totalListings: 127
}

const MOCK_LISTINGS = [
  { id: 1, title: 'Graphic T-Shirt', price: 12.99, status: 'active', seller_id: 5 },
  { id: 2, title: 'Blue Jeans', price: 29.99, status: 'active', seller_id: 8 },
  { id: 3, title: 'Running Shoes', price: 45.00, status: 'sold', seller_id: 3 },
]

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(MOCK_METRICS)
  const [listings, setListings] = useState(MOCK_LISTINGS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // TODO: Replace with actual API calls
    // const fetchData = async () => {
    //   try {
    //     const metricsRes = await fetch('/api/admin/metrics')
    //     const listingsRes = await fetch('/api/admin/listings')
    //     setMetrics(await metricsRes.json())
    //     setListings(await listingsRes.json())
    //   } catch (err) {
    //     setError(err.message)
    //   } finally {
    //     setLoading(false)
    //   }
    // }
    // fetchData()
  }, [])

  const handleMarkSold = (listingId) => {
    setListings(listings.map(l => 
      l.id === listingId ? { ...l, status: 'sold' } : l
    ))
    // TODO: Call API to update status on backend
    alert(`Marked listing ${listingId} as sold`)
  }

  const handleDelete = (listingId) => {
    setListings(listings.filter(l => l.id !== listingId))
    // TODO: Call API to delete on backend
    alert(`Deleted listing ${listingId}`)
  }

  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="page">
      <header className="topbar">
        <div className="top-center">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="site-header">
              <img src="/assets/images/icon.png" alt="Pete's Plaza Logo" className="header-image" onError={(e) => e.target.style.display = 'none'} />
              <div className="create-title site-title">
                Pete's Plaza
              </div>
            </div>
          </Link>
        </div>
      </header>

      <section className="metrics">
        <div className="card">
          <h3>Total Users</h3>
          <span id="total-users">{metrics.totalUsers}</span>
        </div>
        <div className="card">
          <h3>Total Listings</h3>
          <span id="total-listings">{metrics.totalListings}</span>
        </div>
      </section>

      <section className="listings-table">
        <h2>All Listings</h2>
        {loading && <p>Loading...</p>}
        {!loading && (
          <table id="listings">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Price</th>
                <th>Status</th>
                <th>Seller</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr key={listing.id}>
                  <td>{listing.id}</td>
                  <td>{listing.title}</td>
                  <td>${listing.price.toFixed(2)}</td>
                  <td>{listing.status}</td>
                  <td>{listing.seller_id}</td>
                  <td>
                    <button onClick={() => handleMarkSold(listing.id)}>Mark Sold</button>
                    <button onClick={() => handleDelete(listing.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
