import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/admin.css'

const PLACEHOLDER_IMAGE = '/assets/images/listing_placeholder.png'

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ total_users: 0, total_listings: 0, active_listings: 0 }) // Metrics for dashboard summary
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const metricsRes = await fetch('/api/admin/metrics')
        const listingsRes = await fetch('/api/admin/listings')

        if (!metricsRes.ok || !listingsRes.ok) {
          throw new Error('Failed to fetch admin data')
        }

        const metricsData = await metricsRes.json()
        const listingsData = await listingsRes.json()

        setMetrics(metricsData)
        setListings(listingsData)

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleMarkSold = async (listingId) => {
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'sold' })
      })

      if (!res.ok) throw new Error('Failed to update listing')

      setListings(prev =>
        prev.map(l =>
          l.id === listingId ? { ...l, status: 'sold' } : l
        )
      )
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete listing')

      setListings(prev => prev.filter(l => l.id !== listingId))
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="page"><p>Loading...</p></div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="page">
      <header className="topbar">
        <div className="top-center">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="site-header">
              <img
                src="/assets/images/icon.png"
                alt="Pete's Plaza Logo"
                className="header-image"
                onError={(e) => e.target.src = PLACEHOLDER_IMAGE}
              />
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
          <span>{metrics.total_users}</span>
        </div>
        <div className="card">
          <h3>Total Listings</h3>
          <span>{metrics.total_listings}</span>
        </div>
        <div className="card">
          <h3>Active Listings</h3>
          <span>{metrics.active_listings}</span>
        </div>
      </section>

      <section className="listings-table">
        <h2>All Listings</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Price</th>
              <th>Status</th>
              <th>User ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map(listing => (
              <tr key={listing.id}>
                <td>{listing.id}</td>
                <td>{listing.title}</td>
                <td>${Number(listing.price).toFixed(2)}</td>
                <td>{listing.status}</td>
                <td>{listing.seller_id}</td>
                <td>
                  {listing.status !== 'sold' && (
                    <button onClick={() => handleMarkSold(listing.id)}>
                      Mark Sold
                    </button>
                  )}
                  <button onClick={() => handleDelete(listing.id)}>
                    Delete
                  </button>
                 { /*Future: Add Edit button here to open a modal for editing listing details -->*/}
                  <button onClick={() => alert(`Viewing full details for listing ID: ${listing.id}`)}>View Full Listing</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}