// src/pages/SellerPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../api/client';
import '../styles/HomePage.css'; // Reusing your existing card styles

const PLACEHOLDER_IMAGE = '/assets/images/placeholder.png';

export default function SellerPage() {
  const { sellerId } = useParams(); // Grabs the seller's email from the URL
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerListings = async () => {
      try {
        setLoading(true);
        // Fetch all listings
        const data = await apiCall('/listings');
        
        // Filter to only show active listings by this specific seller
        const sellerListings = data.filter(
          (item) => item.seller_email === sellerId && item.status === 'active'
        );
        setListings(sellerListings);
      } catch (err) {
        setError(err.message || 'Failed to load seller profile');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerListings();
  }, [sellerId]);

  if (loading) return <div style={{ padding: '60px' }}>Loading seller profile...</div>;
  if (error) return <div style={{ padding: '60px', color: 'red' }}>{error}</div>;

  return (
    <div className="homepage" style={{ padding: '20px' }}>
      <div className="page-container">
        
        <button 
          onClick={() => navigate(-1)}
          style={{
            marginBottom: '20px',
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            cursor: 'pointer',
            background: '#f5f5f5'
          }}
        >
          ← Back
        </button>

        <div className="page-header" style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '36px' }}>Seller Profile</h1>
          <p style={{ color: '#666', fontSize: '18px' }}>Listings by: <strong>{sellerId}</strong></p>
        </div>

        {listings.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <h3>No Active Listings</h3>
            <p>This seller does not currently have any items for sale.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {listings.map(listing => (
              <div key={listing.id} className="card">
                <img 
                  src={listing.image_url || PLACEHOLDER_IMAGE} 
                  alt={listing.title} 
                  onError={e => e.target.src = PLACEHOLDER_IMAGE} 
                />
                <h3>{listing.title}</h3>
                <p>${Number(listing.price).toFixed(2)} • {listing.category}</p>
                <div className="card-actions">
                  <Link to={`/listings/${listing.id}`}>
                    <button className="pill">View Listing</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}