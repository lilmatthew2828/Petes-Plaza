// Matthew - React component for displaying a seller's page with their listings and transaction history (for admins)
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSellerPage, getSellerTransactions } from "../api/seller";
import { useAuth } from "../context/AuthContext";
import "./SellerPage.css";

export default function SellerPage() {
  const { sellerId } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;

  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSellerData() {
      try {
        setLoading(true);
        const data = await getSellerPage(sellerId);
        setSeller(data.seller);
        setListings(data.listings || []);
      } catch (err) {
        setError("Could not load seller page.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSellerData();
  }, [sellerId]);

  async function handleViewTransactions() {
    try {
      setTxLoading(true);
      const data = await getSellerTransactions(sellerId);
      setTransactions(data.transactions || data || []);
      setShowTransactions(true);
    } catch (err) {
      console.error(err);
      setError("Could not load transaction history.");
    } finally {
      setTxLoading(false);
    }
  }

  if (loading) {
    return <div className="seller-page"><p>Loading seller page...</p></div>;
  }

  if (error) {
    return <div className="seller-page"><p>{error}</p></div>;
  }

  return (
    <div className="seller-page">
      <div className="seller-header">
        <h1>{seller?.username || "Seller"}'s Store</h1>
        <p>Email: {seller?.email}</p>
      </div>

      <div className="seller-actions">
        <Link to="/listings" className="back-link">← Back to Listings</Link>

        {isAdmin && (
          <button className="admin-btn" onClick={handleViewTransactions}>
            {txLoading ? "Loading..." : "View Seller Transaction History"}
          </button>
        )}
      </div>

      <h2 className="section-title">Products on Sale</h2>

      {listings.length === 0 ? (
        <p>This seller has no active listings right now.</p>
      ) : (
        <div className="seller-grid">
          {listings.map((listing) => (
            <div className="seller-card" key={listing.id}>
              <img
                src={listing.image_url || "/listing_placeholder.png"}
                alt={listing.title}
                className="seller-image"
              />
              <h3>{listing.title}</h3>
              <p className="price">${listing.price}</p>
              <p>{listing.description}</p>
              <p className="category">{listing.category}</p>

              <Link to={`/listings/${listing.id}`} className="details-link">
                View Listing
              </Link>
            </div>
          ))}
        </div>
      )}

      {isAdmin && showTransactions && (
        <div className="transactions-section">
          <h2 className="section-title">Seller Transaction History</h2>

          {transactions.length === 0 ? (
            <p>No transaction history found.</p>
          ) : (
            <div className="transaction-table-wrapper">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Listing ID</th>
                    <th>Buyer ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.id}</td>
                      <td>{tx.listing_id}</td>
                      <td>{tx.buyer_email}</td>
                      <td>${tx.amount}</td>
                      <td>{tx.status}</td>
                      <td>
                        {tx.created_at
                          ? new Date(tx.created_at).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}