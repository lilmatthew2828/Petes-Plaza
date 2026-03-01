import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/listings/${id}`)
      .then((res) => res.json())
      .then((data) => setListing(data));
  }, [id]);

  if (!listing) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>{listing.listing_title}</h1>
      <p>Category: {listing.category}</p>
      <p>Description: {listing.listing_description}</p>
      <p>Price: ${listing.price}</p>
    </div>
  );
}