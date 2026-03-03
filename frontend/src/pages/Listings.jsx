import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
export default function Listings() {
  const [listings, setListings] = useState([]);
  const [listing_title, setListingTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [listing_description, setListingDescription] = useState("");

  // Get listing
  useEffect(() => {
    fetch("http://localhost:8000/api/listings")
      .then((res) => res.json())
      .then((data) => setListings(data.sort((a, b) => b.id - a.id)))
      .catch((err) => console.error("Error loading listings:", err));
  }, []);

  //Create listing
  const createListing = async () => {

    if (!listing_title || !price || !category || !listing_description) {
      alert("All fields are required.");
      return;
    }

    if (Number(price) < 0) {
      alert("Price must be 0 or higher.");
      return;
    }

    
    try {
      const response = await fetch("http://localhost:8000/api/listings/new",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listing_title,
            user_id: 1, // keep fixed for now
            category,
            listing_description,
            price: Number(price),
          }),
        }
      );

      const newListing = await response.json();
      setListings((prev) => [...prev, newListing]);

      // Clear inputs so user can enter a new listing
      setListingTitle("");
      setPrice("");
      setCategory("");
      setListingDescription("");
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  };

 
  return (
    <div style={{ padding: "60px", maxWidth: "900px", margin: "0 auto" }}>

      <Link to="/homepage" style={{ fontSize: "18px", display: "inline-block", marginBottom: "20px" }}>
      ← Back to Home
      </Link>

      <h1 style={{ fontSize: "42px", marginBottom: "25px" }}>
        Pete's Plaza Listings Details
      </h1>

      {/* FORM */}
      <div style={{ marginBottom: "30px" }}>
        <input
          placeholder="Listing title"
          value={listing_title}
          onChange={(e) => setListingTitle(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "250px" }}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "120px" }}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "150px" }}
        />

        <input
          placeholder="Description"
          value={listing_description}
          onChange={(e) => setListingDescription(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "250px" }}
        />

        <button
          onClick={createListing}
          style={{
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          Create Listing
        </button>
      </div>

      {/* LISTINGS DISPLAY */}
      <h2 style={{ fontSize: "30px", marginBottom: "15px" }}>
        All Listings
      </h2>

      {listings.map((listing) => (
        <div
          key={listing.id}
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            marginBottom: "15px",
            borderRadius: "10px",
          }}
        >
          <Link to={`/listings/${listing.id}`}>
          <h3>{listing.listing_title}</h3>
          </Link>
          <p><strong>Category:</strong> {listing.category}</p>
          <p>{listing.listing_description}</p>
          <p><strong>${listing.price}</strong></p>
        </div>
      ))}
    </div>
  );
}