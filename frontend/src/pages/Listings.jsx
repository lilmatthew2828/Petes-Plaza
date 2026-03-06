import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
export default function Listings() {
  const [listings, setListings] = useState([]);
  const [listing_title, setListingTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [listing_description, setListingDescription] = useState("");
  const [image_key, setImageKey] = useState("");
// Emmanuella Obidike - whole file

  // Get listing
  useEffect(() => {
  fetch("http://localhost:8000/api/listings")
    .then((res) => {
      if (!res.ok) {
        throw new Error("Server response not OK");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Listings received:", data);
      setListings(data.sort((a, b) => b.id - a.id));
    })
    .catch((err) => {
      console.error("Error loading listings:", err);
    });
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
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listing_title,
            category,
            listing_description,
            price: Number(price),
            image_key
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
      setImageKey("");
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
        CREATE A LISTING
      </h1>

      {/* FORM */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "40px",
          alignItems: "center",
        }}
      >
        <input
          placeholder="Listing title"
          value={listing_title}
          onChange={(e) => setListingTitle(e.target.value)}
          style={{
            padding: "12px",
            width: "220px",
            border: "2px solid #1e3a8a",
            borderRadius: "6px",
          }}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{
            padding: "12px",
            width: "120px",
            border: "2px solid #1e3a8a",
            borderRadius: "6px",
          }}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "12px",
            width: "160px",
            border: "2px solid #1e3a8a",
            borderRadius: "6px",
          }}
        />

        <input
          placeholder="Description"
          value={listing_description}
          onChange={(e) => setListingDescription(e.target.value)}
          style={{
            padding: "12px",
            width: "260px",
            border: "2px solid #1e3a8a",
            borderRadius: "6px",
          }}
        />

        <input
          placeholder="Image URL"
          value={image_key}
          onChange={(e) => setImageKey(e.target.value)}
          style={{ 
            padding: "10px", 
            border: "2px solid #1e3a8a",
            borderRadius: "6px",
            marginBottom: "10px",
            width: "100%" 
          }}
        />

        <button
          onClick={createListing}
          style={{
            padding: "12px 18px",
            backgroundColor: "#1e3a8a",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
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
        </div>
      ))}
    </div>
  );
}