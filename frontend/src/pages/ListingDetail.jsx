import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";


export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/listings/${id}`)
      .then((res) => res.json())
      .then((data) => setListing(data));
  }, [id]);

  if (!listing) {
    return <h2>Loading...</h2>;
  }

  return (
  <div style={{ padding: "60px", maxWidth: "900px", margin: "0 auto" }}>
    <h1 style={{ fontSize: "42px", marginBottom: "25px" }}>
      {listing.listing_title}
    </h1>

    <div
      style={{
        border: "1px solid #ddd",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px",
        background: "white",
      }}
    >
      <p><strong>Category:</strong> {listing.category}</p>
      <p><strong>Description:</strong> {listing.listing_description}</p>
      <p><strong>Price:</strong> ${listing.price}</p>
    </div>

    <Link
      to="/listings"
      style={{
        fontSize: "18px",
        textDecoration: "none",
        color: "blue",
      }}
    >
      ← Back to Listings
    </Link>
  </div>
);

}