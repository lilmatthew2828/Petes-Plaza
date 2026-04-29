// Matthew Kilpatrick & Gemini Fix
import React, { useEffect, useState } from "react";
import { fetchWishlist, removeFromWishlist } from "../api/wishlist";
import { useAuth } from "../context/AuthContext";

export default function WishlistModal({ open, onClose }) {
  const { user } = useAuth();
  
  // State Definitions
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle"); // Fixed: added missing state
  const [error, setError] = useState("");      // Fixed: added missing state

  useEffect(() => {
    // 1. Only run if the modal is open AND we actually have a user
    if (!open || !user) {
      return;
    }

    const loadData = async () => {
      setStatus("loading");
      setError("");
      try {
        // 2. Call our production-proof fetch function
        const data = await fetchWishlist();

        // 3. FastAPI returns the array directly: [ {id: 1, ...}, {id: 2, ...} ]
        setItems(data || []);
        setStatus("idle");
      } catch (e) {
        console.error("Wishlist error:", e);
        setStatus("error");
        setError(e.message || "Failed to load wishlist");
      }
    };

    loadData();
  }, [open, user]);

  const handleRemove = async (id) => {
    try {
      // 4. Matches Python: DELETE /api/wishlist/{listing_id}
      await removeFromWishlist(id);
      
      // Update UI immediately after successful deletion
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  if (!open) return null;

  return (
    <div
      style={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={styles.modal}>
        <button style={styles.close} onClick={onClose}>
          ×
        </button>

        <h2 style={{ marginTop: 0 }}>My Wishlist</h2>

        {status === "loading" && <p>Loading treasure...</p>}
        {status === "error" && <p style={{ color: "crimson" }}>{error}</p>}

        {status !== "loading" && items.length === 0 && (
          <p>Your wishlist is empty.</p>
        )}

        <div style={{ display: "grid", gap: 10 }}>
          {items.map((it) => (
            <div key={it.id} style={styles.item}>
              <div>
                <div style={{ fontWeight: 700 }}>{it.title}</div>
                <div style={{ opacity: 0.8 }}>
                  ${it.price} {it.category ? `• ${it.category}` : ""}
                </div>
              </div>

              <button style={styles.remove} onClick={() => handleRemove(it.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Keeping your existing styles below
const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "white",
    borderRadius: 14,
    width: "min(560px, 92vw)",
    maxHeight: "80vh",
    overflow: "auto",
    padding: 18,
    position: "relative",
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
  },
  close: {
    position: "absolute",
    top: 10,
    right: 12,
    border: "none",
    background: "transparent",
    fontSize: 28,
    cursor: "pointer",
  },
  item: {
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 12,
    padding: 12,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    alignItems: "center",
  },
  remove: {
    border: "none",
    borderRadius: 999,
    padding: "8px 12px",
    cursor: "pointer",
    background: "#f0f0f0",
  },
};