// Jania Southall - PurchaseHistory component to display user's past purchases.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPurchaseHistory } from '../api/purchaseHistory';
import './PurchaseHistory.css';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('PurchaseHistory component mounted');
    fetchPurchaseHistory();
  }, []);


const handleContactSeller = (item) => {
  const subject = encodeURIComponent(`Question about: ${item.title}`);
  const body = encodeURIComponent(
    `Hi ${item.seller_name},\n\n` +
    `I purchased "${item.title}" from you on ${new Date(item.purchased_at).toLocaleDateString()}.\n\n` +
    `I wanted to reach out about:\n` +
    `[Please describe your question or concern here]\n\n` +
    `Transaction ID: ${item.id}\n\n` +
    `Thanks!`
  );
  
  // Open email client
  window.location.href = `mailto:${item.seller_email}?subject=${subject}&body=${body}`;
};


  const fetchPurchaseHistory = async () => {
    try {
      console.log('Starting fetchPurchaseHistory...');
      setLoading(true);
      const response = await getPurchaseHistory();
      console.log('Purchase history response:', response);
      
      // Handle different response structures
      const data = response?.data || response || [];
      setPurchases(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Purchase history error:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load purchase history');
      setPurchases([]); 
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return <div className="loading">Loading purchase history...</div>;
  }

  if (error) {
    return (
      <div className="purchase-history">
        <div className="purchase-history-header">
          <h1>Purchase History</h1>
          <p>View all your past purchases</p>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="purchase-history">
      <div className="purchase-history-header">
        <h1>Purchase History</h1>
        <p>View all your past purchases</p>
      </div>

      {!purchases || purchases.length === 0 ? (
        <div className="no-purchases">
          <h3>No purchases yet</h3>
          <p>Start shopping to see your purchase history here!</p>
        </div>
      ) : (
        <div className="purchases-list">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="purchase-item">
              <div className="purchase-image">
                {purchase.image_url ? (
                  <img 
                    src={purchase.image_url || '/assets/images/placeholder.png'} 
                    alt={purchase.title}
                    onError={e => e.target.src = '/assets/images/placeholder.png'}
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              
              <div className="purchase-details">
                <h3 className="purchase-title">{purchase.title || 'Unknown Item'}</h3>
                <p className="purchase-description">{purchase.description || 'No description available'}</p>
                <div className="purchase-info">
                  <span className="price">{formatPrice(purchase.price || 0)}</span>
                  <span className="seller">Sold by: {purchase.seller_name || 'Unknown seller'}</span>
                </div>
                <div className="purchase-date">
                  Purchased on {formatDate(purchase.purchased_at)}
                </div>
              </div>

              <div className="purchase-item-actions">
                <Link to={`/listings/${purchase.listing_id}`}>
                  <button className="pill">View Item</button>
                </Link>
                
                <button 
                  className="pill contact-seller-btn" 
                  onClick={() => handleContactSeller(purchase)}
                >
                  Contact Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;