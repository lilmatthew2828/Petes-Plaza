// Anthony Powell
// Edit listing page:
// - Loads a listing by ID from URL params | Allows owner to edit fields | Sends PATCH request to backend

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getListing, updateListing, deleteListing } from "../api/listings";

export default function EditListing() {
  // listingId comes from route: /listings/:listingId/edit
  const { listingId } = useParams();
  const navigate = useNavigate();

  // Form state (matches backend schema field names)
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    pickup_location: "",
    seller_email: "",
    image_url: "",
    category: "Other",
  });

  // UI state
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Load listing once page mounts / listingId changes
  useEffect(() => {
    const loadListing = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getListing(listingId);
        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          price: data.price ?? "",
          pickup_location: data.pickup_location ?? "",
          seller_email: data.seller_email ?? "",
          image_url: data.image_url ?? "",
          category: data.category ?? "Other",
        });
      } catch (e) {
        setError(e?.message || "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [listingId]);

  // Generic input handler
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes to DB
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const parsedPrice = form.price === "" ? null : Number(form.price);
      if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
        throw new Error("Price must be a valid number greater than or equal to 0");
      }

      await updateListing(listingId, {
        title: form.title,
        description: form.description,
        pickup_location: form.pickup_location,
        image_url: form.image_url,
        category: form.category,
        // Convert price to number for backend validation
        price: parsedPrice,
      });

      // Return to home so updated card is visible
      navigate("/homepage", {
        state: {
          refreshListings: true,
          refreshedAt: Date.now(),
        },
      });
    } catch (e) {
      // Backend returns 403 message for non-owner
      setError(e?.message || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      await deleteListing(listingId);
      navigate("/homepage", {
        state: {
          refreshListings: true,
          refreshedAt: Date.now(),
        },
      });
    } catch (e) {
      setError(e?.message || "Failed to delete listing");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "24px auto", padding: 16 }}>
      <h2>Edit Listing</h2>

      {/* Error message */}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      {loading ? <p>Loading listing...</p> : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="Item title"
          required
          disabled={loading || saving}
        />

        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Description"
          rows={4}
          disabled={loading || saving}
        />

        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={onChange}
          placeholder="Price"
          required
          disabled={loading || saving}
        />

        <input
          name="pickup_location"
          value={form.pickup_location}
          onChange={onChange}
          placeholder="Pickup location"
          required
          disabled={loading || saving}
        />

        <input
          name="seller_email"
          type="email"
          value={form.seller_email}
          placeholder="Seller email"
          readOnly
          disabled
        />

        <input
          name="image_url"
          value={form.image_url}
          onChange={onChange}
          placeholder="Image URL"
          disabled={loading || saving}
        />

        <select
          name="category"
          value={form.category}
          onChange={onChange}
          required
          disabled={loading || saving}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">Select a category</option>
          <option value="T-Shirts">T-Shirts</option>
          <option value="Jeans">Jeans</option>
          <option value="Sweatshirts">Sweatshirts</option>
          <option value="Shoes">Shoes</option>
          <option value="Appliances">Appliances</option>
          <option value="Furniture">Furniture</option>
          <option value="Accessories">Accessories</option>
          <option value="Vehicles">Vehicles</option>
          <option value="Other">Other</option>
        </select>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={saving || loading || deleting}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={onDelete} disabled={saving || loading || deleting}>
            {deleting ? "Deleting..." : "Delete Listing"}
          </button>
          <button type="button" onClick={() => navigate("/homepage")} disabled={saving || deleting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}