// const API_BASE = "http://127.0.0.1:8000"; // backend

// export async function fetchWishlist() {
//   const res = await fetch(`${API_BASE}/wishlist/`, {
//     method: "GET",
//     credentials: "include",
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`Wishlist fetch failed (${res.status}): ${text}`);
//   }
//   return res.json();
// }

// export async function addToWishlist(listingId) {
//   const res = await fetch(`${API_BASE}/wishlist/${listingId}`, {
//     method: "POST",
//     credentials: "include",
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`Add failed (${res.status}): ${text}`);
//   }
//   return res.json();
// }

// export async function removeFromWishlist(listingId) {
//   const res = await fetch(`${API_BASE}/wishlist/${listingId}`, {
//     method: "DELETE",
//     credentials: "include",
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`Remove failed (${res.status}): ${text}`);
//   }
//   return res.json();
// }
 //Matthew Kilpatrick
import { apiCall } from "./client";

export async function fetchWishlist() {
  return apiCall("/api/wishlist", { method: "GET" }); // -> /api/wishlist
}

export async function addToWishlist(listingId) {
  return apiCall(`/api/wishlist/${listingId}`, { method: "POST" }); // -> /api/wishlist/:id
}

export async function removeFromWishlist(listingId) {
  return apiCall(`/api/wishlist/${listingId}`, { method: "DELETE" }); // -> /api/wishlist/:id
}