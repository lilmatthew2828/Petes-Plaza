 //Matthew Kilpatrick
import React, { useEffect, useState } from "react";
import { fetchWishlist, removeFromWishlist } from "../api/wishlist";

// Add useAuth to your imports
import { useAuth } from "../context/AuthContext"; 

export default function WishlistModal({ open, onClose }) {
  const { user } = useAuth(); // Get the logged in user
  const [items, setItems] = useState([]);
  // ... other state

  useEffect(() => {
    if (!open || !user?.username) return; // Don't fetch if no user

    (async () => {
      setStatus("loading");
      try {
        // Pass the username here!
        const data = await fetchWishlist(user.username);
        // Your backend returns { ok: true, items: [...] }, so use data.items
        setItems(data.items || []); 
        setStatus("idle");
      } catch (e) {
        setStatus("error");
        setError(e.message || "Failed to load wishlist");
      }
    })();
  }, [open, user]);

  const handleRemove = async (id) => {
    try {
      // Pass both username and id
      await removeFromWishlist(user.username, id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

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

        {status === "loading" && <p>Loading...</p>}
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
  },
};