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

export async function fetchWishlist(username) {
  // Use a template literal to inject the username into the path
  return apiCall(`/wishlist/${username}`, { method: "GET" });
}

export async function addToWishlist(username, listingId) {
  // Matches: POST /api/wishlist/add
  return apiCall("/wishlist/add", { 
    method: "POST",
    body: JSON.stringify({ username, listingId })
  });
}

export async function removeFromWishlist(username, listingId) {
  // Matches: POST /api/wishlist/remove
  return apiCall("/wishlist/remove", { 
    method: "POST",
    body: JSON.stringify({ username, listingId })
  });
}