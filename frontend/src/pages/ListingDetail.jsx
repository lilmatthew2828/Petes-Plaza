import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getListing } from "../api/listings";
import { createOffer } from "../api/offers";
import { useAuth } from "../context/AuthContext";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerMessage, setOfferMessage] = useState("");

  useEffect(() => {
    const loadListing = async () => {
      try {
        setError("");
        const data = await getListing(id);
        setListing(data);
      } catch (e) {
        setError(e?.message || "Failed to load listing");
      }
    };

    loadListing();
  }, [id]);

  const handleExpressInterest = async () => {
    if (!user) {
      setError("Please log in to express interest");
      return;
    }

    try {
      setOfferLoading(true);
      setError("");
      await createOffer(parseInt(id));
      setOfferMessage("Interest expressed successfully! The seller will be notified.");
    } catch (e) {
      setError(e?.message || "Failed to express interest");
    } finally {
      setOfferLoading(false);
    }
  };

  if (error && !listing) {
    return <h2 style={{ padding: "40px", color: "crimson" }}>{error}</h2>;
  }

  if (!listing) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  const title = listing.title ?? listing.listing_title ?? "Untitled listing";
  const description = listing.description ?? listing.listing_description ?? "";
  const image = listing.image_url ?? listing.image_key ?? "";
  const sellerId = listing.seller_email ?? null;
  const sellerName = listing.seller_name ?? "Seller";
  const isOwnListing = user && user.email === sellerId;

  return (
    <div style={{ padding: "60px", maxWidth: "900px", margin: "0 auto" }}>
      <button
        onClick={() => window.history.back()}
        style={{
          marginBottom: "20px",
          padding: "8px 14px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          cursor: "pointer",
          background: "#f5f5f5"
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: "42px", marginBottom: "25px" }}>
        {title}
      </h1>

      {error && (
        <div style={{ 
          padding: "12px", 
          background: "#fee", 
          color: "#c00", 
          borderRadius: "6px", 
          marginBottom: "20px" 
        }}>
          {error}
        </div>
      )}

      {offerMessage && (
        <div style={{ 
          padding: "12px", 
          background: "#efe", 
          color: "#080", 
          borderRadius: "6px", 
          marginBottom: "20px" 
        }}>
          {offerMessage}
        </div>
      )}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "25px",
          borderRadius: "10px",
          background: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        {image && (
          <img
            src={image}
            alt={title}
            style={{
              width: "300px",
              borderRadius: "10px",
              marginBottom: "20px"
            }}
          />
        )}

        <p><strong>Category:</strong> {listing.category}</p>
        <p><strong>Description:</strong> {description}</p>
        <p><strong>Price:</strong> ${listing.price}</p>

        {sellerId && (
          <p style={{ marginTop: "12px" }}>
            <strong>Seller:</strong>{" "}
            <Link to={`/seller/${sellerId}`}>{sellerName}</Link>
          </p>
        )}

        <div style={{ marginTop: "18px", display: "flex", gap: "12px" }}>
          {!isOwnListing && user && listing.status === 'active' && (
            <button
              onClick={handleExpressInterest}
              disabled={offerLoading || !!offerMessage}
              style={{
                padding: "12px 24px",
                borderRadius: "6px",
                border: "none",
                background: offerMessage ? "#28a745" : "#007bff",
                color: "white",
                cursor: offerLoading || offerMessage ? "not-allowed" : "pointer",
                fontWeight: "bold",
                opacity: offerLoading || offerMessage ? 0.7 : 1
              }}
            >
              {offerLoading ? "Sending..." : offerMessage ? "Interest Sent!" : "I'm Interested"}
            </button>
          )}

          {sellerId && (
            <Link to={`/seller/${sellerId}`}>
              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                View Seller Page
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}