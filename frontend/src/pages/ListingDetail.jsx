import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8001/api/listings/${id}`)
      .then((res) => res.json())
      .then((data) => setListing(data));
  }, [id]);

  if (!listing) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  return (
    <div style={{ padding: "60px", maxWidth: "900px", margin: "0 auto" }}>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
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
        {listing.listing_title}
      </h1>

      <div
        style={{
          border: "1px solid #ddd",
          padding: "25px",
          borderRadius: "10px",
          background: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        {listing.image_key && (
        <img
          src={listing.image_key}
          alt={listing.listing_title}
          style={{
            width: "300px",
            borderRadius: "10px",
            marginBottom: "20px"
          }}
        />
      )}

      <p><strong>Category:</strong> {listing.category}</p>
      <p><strong>Description:</strong> {listing.listing_description}</p>
      <p><strong>Price:</strong> ${listing.price}</p>
      </div>

    </div>
  );
}