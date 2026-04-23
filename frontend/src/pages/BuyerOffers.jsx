import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getBuyerOffers } from '../api/offers';
import { useAuth } from '../context/AuthContext';

export default function BuyerOffers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchOffers = async () => {
      try {
        setLoading(true);
        const data = await getBuyerOffers(user.email);
        setOffers(data.offers || []);
      } catch (err) {
        setError(err.message || 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [user, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'accepted': return '#28a745';
      case 'completed': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getStatusMessage = (offer) => {
    switch (offer.status) {
      case 'pending':
        return 'Waiting for seller response...';
      case 'accepted':
        return `Pickup Information: ${offer.seller_message}`;
      case 'completed':
        return 'Transaction completed!';
      default:
        return '';
    }
  };

  if (loading) return <div style={{ padding: '60px' }}>Loading your offers...</div>;
  if (error) return <div style={{ padding: '60px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '60px', maxWidth: '1000px', margin: '0 auto' }}>
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

      <h1 style={{ fontSize: '36px', marginBottom: '30px' }}>
        Offers Sent (My Interests)
      </h1>

      {offers.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3>No offers yet</h3>
          <p>When you express interest in listings, they will appear here.</p>
          <Link to="/homepage">
            <button style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              background: '#007bff',
              color: 'white',
              cursor: 'pointer',
              marginTop: '16px'
            }}>
              Browse Listings
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {offers.map(offer => (
            <div 
              key={offer.offer_id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '20px',
                background: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}>
                    <Link 
                      to={`/listings/${offer.listing_id}`}
                      style={{ textDecoration: 'none', color: '#007bff' }}
                    >
                      {offer.listing_title}
                    </Link>
                  </h3>
                  <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                    <strong>Price:</strong> ${offer.listing_price}
                  </p>
                  <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                    <strong>Seller:</strong> {offer.seller_email}
                  </p>
                  <p style={{ margin: '0', color: '#666' }}>
                    <strong>Offered on:</strong> {new Date(offer.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span 
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: getStatusColor(offer.status),
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {offer.status}
                </span>
              </div>

              <div style={{
                background: offer.status === 'accepted' ? '#d4edda' : '#e2e3e5',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '15px'
              }}>
                <strong>Status:</strong> {getStatusMessage(offer)}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to={`/listings/${offer.listing_id}`}>
                  <button style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #007bff',
                    background: 'white',
                    color: '#007bff',
                    cursor: 'pointer'
                  }}>
                    View Listing
                  </button>
                </Link>
                
                <Link to={`/seller/${offer.seller_email}`}>
                  <button style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #28a745',
                    background: 'white',
                    color: '#28a745',
                    cursor: 'pointer'
                  }}>
                    View Seller
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}