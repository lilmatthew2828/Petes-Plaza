const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("VITE_API_URL is not defined");
}

//Emmanuella Obidike
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { uploadImage } from "../api/upload";
export default function Listings() {
  const [listings, setListings] = useState([]);
  const [listing_title, setListingTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [listing_description, setListingDescription] = useState("");
  const [image_key, setImageKey] = useState("");
  const [preview, setPreview] = useState(""); // For the image preview
  const [loading, setLoading] = useState(false); // shows “Uploading…” while the image is being sent to S3
  const [error, setError] = useState(""); // For error handling when creating a listing
  const [formError, setFormError] = useState(""); // For form validation errors




  // Get listing
  useEffect(() => {
  fetch(`${API_URL}/api/listings`, {
    credentials: "include"  
  })  // Emmanuella Obidike - Added credentials for cookie-based authentication
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

  
  const createListing = async () => {
  setError("");
  setFormError("");

  if (!listing_title || !price || !category || !listing_description) {
    setFormError("All fields are required.");
    return;
  }

  if (isNaN(price)) {
    setFormError("Price must be a number.");
    return;
  }

  if (Number(price) < 0) {
    setFormError("Price must be 0 or higher.");
    return;
  }

  try {
    setLoading(true);

    let uploadedKey = null;

    if (image_key) {
      const res = await uploadImage(image_key);
      console.log("UPLOAD RESPONSE:", res);
      uploadedKey = res?.image_key;

      if (!uploadedKey) {
        alert("Image upload failed");
        return;
      }
    }

    const response = await fetch(`${API_URL}/api/listings`, {
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
        image_key: uploadedKey,
      }),
    });

    const newListing = await response.json();
    setListings((prev) => [...prev, newListing]);

    setListingTitle("");
    setPrice("");
    setCategory("");
    setListingDescription("");
    setImageKey("");
    setPreview("");

  } catch (error) {
    console.error("Error creating listing:", error);
    setError("Something went wrong while creating the listing. Please try again.");
  } finally {
    setLoading(false);
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

      
      {error && (
      <p style={{ color: "crimson", fontWeight: "bold" }}>
        {error}
      </p>
    )}

    {formError && (
    <p style={{ color: "crimson", fontWeight: "bold" }}>
      {formError}
    </p>
  )}


      {loading && (
      <p style={{ color: "#1e3a8a", fontWeight: "bold" }}>
        Uploading image...
      </p>
    )}

    {preview && (
      <img
        src={preview}
        alt="Preview"
        style={{
          width: "200px",
          marginTop: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
      />
    )}


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
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setImageKey(file);

            // Create a preview URL for the selected image
            setPreview(URL.createObjectURL(file));
          }}
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
        disabled={loading}
        style={{
          padding: "12px 18px",
          backgroundColor: loading ? "#94a3b8" : "#1e3a8a",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}
      >
        {loading ? "Uploading..." : "Create Listing"}
      </button>
      </div>

      {/* LISTINGS DISPLAY */}
      <h2 style={{ fontSize: "30px", marginBottom: "15px" }}>
        All Listings
      </h2>

      {listings.map((listing) => {
      console.log("LISTING:", listing);
      const image = listing.image_key
        ? `https://petes-plaza-bucket.s3.amazonaws.com/${listing.image_key}`
        : "";

      return (
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

          {/*
          image removed from list page

          {image && (
            <img
              src={image}
              alt={listing.listing_title}
              style={{
                width: "200px",
                borderRadius: "8px",
                marginBottom: "10px"
              }}
            />
          )}
        */}
          
          <p><strong>Category:</strong> {listing.category}</p>
        </div>
      );
    })}
    </div>
  );
}