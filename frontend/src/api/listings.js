// Anthony Powell
import { apiCall } from "./client";

const LISTINGS_BASE = "/listings";

/**
 * Fetch one listing by ID.
 * Backend route (via apiCall base): GET /api/listings/{id}
 * @param {number|string} id
 * @returns {Promise<object>} Listing data
 */
export async function getListing(id) {
  return apiCall(`${LISTINGS_BASE}/${id}`, { method: "GET" });
}

/**
 * Partially update a listing by ID.
 * Backend route (via apiCall base): PATCH /api/listings/{id}
 * Ownership is enforced by backend (returns 403 if not owner).
 * @param {number|string} id
 * @param {object} payload fields to update (title, price, category, etc.)
 * @returns {Promise<object>} Updated listing
 */
export async function updateListing(id, payload) {
  return apiCall(`${LISTINGS_BASE}/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

/**
 * Delete a listing by ID.
 * Backend route (via apiCall base): DELETE /api/listings/{id}
 * Ownership is enforced by backend (returns 403 if not owner).
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export async function deleteListing(id) {
  await apiCall(`${LISTINGS_BASE}/${id}`, { method: "DELETE" });
}

