// EMMANUELLA OBIDIKE
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MySoldListings() {
  const navigate = useNavigate();

  // STATE
  const [soldListings, setSoldListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCH SOLD ITEMS
  useEffect(() => {
    const fetchSoldListings = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/listings/my-sold", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch sold items");
        }

        const data = await res.json();
        setSoldListings(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldListings();
  }, []);

  return (
    <div style={{ padding: "60px", maxWidth: "900px", margin: "0 auto" }}>
      
      {/* BACK BUTTON */}
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

      <h1>My Sold Items</h1>

      {/* STATES */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {soldListings.length === 0 && !loading && (
        <p>You have no sold items yet.</p>
      )}

 {/* LIST */}
      <div>
        {soldListings.map((item) => (
          <div 
            key={item.id} 
            style={{ 
              marginBottom: "20px", 
              padding: "15px", 
              border: "1px solid #ddd", 
              borderRadius: "8px",
              backgroundColor: "#f9f9f9"
            }}
          >
            <h3>{item.title}</h3>
            <p><strong>Price:</strong> ${item.price}</p>
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Status:</strong> {item.status}</p>
            <p><strong>Sold to:</strong> {item.buyer_email}</p>
            <p><strong>Sold on:</strong> {new Date(item.sold_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}