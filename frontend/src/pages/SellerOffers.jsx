// Jania Southall 
import { useParams, useNavigate } from 'react-router-dom';
import { getSellerOffers, respondToOffer, completeOffer } from '../api/offers';
import { useAuth } from '../context/AuthContext';

export default function SellerOffers() {
  const { sellerEmail } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user || (user.email !== sellerEmail && !user.is_admin)) {
      navigate('/');
      return;
    }

    const fetchOffers = async () => {
      try {
        setLoading(true);
        const data = await getSellerOffers(sellerEmail);
        setOffers(data.offers || []);
      } catch (err) {
        setError(err.message || 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [sellerEmail, user, navigate]);

  const handleRespond = async (offerId) => {
    if (!responseMessage.trim()) {
      alert('Please enter a pickup location/message');
      return;
    }

    try {
      setActionLoading(true);
      await respondToOffer(offerId, responseMessage);
      
      // Update offers list
      setOffers(prev => prev.map(offer => 
        offer.offer_id === offerId 
          ? { ...offer, status: 'accepted', seller_message: responseMessage }
          : offer
      ));
      
      setRespondingTo(null);
      setResponseMessage('');
    } catch (err) {
      alert(err.message || 'Failed to respond to offer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (offerId) => {
    if (!confirm('Mark this transaction as completed? This will create a transaction record and mark the listing as sold.')) {
      return;
    }

    try {
      setActionLoading(true);
      await completeOffer(offerId);
      
      // Update offers list
      setOffers(prev => prev.map(offer => 
        offer.offer_id === offerId 
          ? { ...offer, status: 'completed' }
          : offer
      ));
    } catch (err) {
      alert(err.message || 'Failed to complete transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'accepted': return '#28a745';
      case 'completed': return '#6c757d';
      default: return '#007bff';
    }
  };

  if (loading) return <div style={{ padding: '60px' }}>Loading offers...</div>;
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
        Offers Received
      </h1>

      {offers.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3>No offers yet</h3>
          <p>When buyers express interest in your listings, they will appear here.</p>
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
                    {offer.listing_title}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                    <strong>Price:</strong> ${offer.listing_price}
                  </p>
                  <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                    <strong>Buyer:</strong> {offer.buyer_name} ({offer.buyer_email})
                  </p>
                  <p style={{ margin: '0', color: '#666' }}>
                    <strong>Date:</strong> {new Date(offer.created_at).toLocaleDateString()}
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

              {offer.seller_message && (
                <div style={{
                  background: '#e7f3ff',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '15px'
                }}>
                  <strong>Your Response:</strong> {offer.seller_message}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {offer.status === 'pending' && (
                  <>
                    {respondingTo === offer.offer_id ? (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
                        <input
                          type="text"
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          placeholder="Enter pickup location or instructions..."
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        />
                        <button
                          onClick={() => handleRespond(offer.offer_id)}
                          disabled={actionLoading}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#28a745',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          Send
                        </button>
                        <button
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseMessage('');
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            background: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingTo(offer.offer_id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '4px',
                          border: 'none',
                          background: '#007bff',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Respond with Pickup Info
                      </button>
                    )}
                  </>
                )}

                {offer.status === 'accepted' && (
                  <button
                    onClick={() => handleComplete(offer.offer_id)}
                    disabled={actionLoading}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: 'none',
                      background: '#28a745',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Mark as Completed
                  </button>
                )}

                {offer.status === 'completed' && (
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                    ✓ Transaction Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}