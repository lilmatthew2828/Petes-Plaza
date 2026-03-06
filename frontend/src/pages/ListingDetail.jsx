
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListing } from "../api/listings";

// Emmanuella Obidike - whole file

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");

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

  if (error) {
    return <h2 style={{ padding: "40px", color: "crimson" }}>{error}</h2>;
  }

  if (!listing) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  const title = listing.title ?? listing.listing_title ?? "Untitled listing";
  const description = listing.description ?? listing.listing_description ?? "";
  const image = listing.image_url ?? listing.image_key ?? "";

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
        {title}
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
      </div>

    </div>
  );
}