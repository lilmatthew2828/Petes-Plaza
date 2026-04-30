// New - Matthew Kp
const API_BASE = import.meta.env.VITE_API_URL || ""; // Use VITE_API_URL from .env or default to empty string

export async function getSellerPage(sellerId) {
  const response = await fetch(`${API_BASE}/sellers/${sellerId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch seller page");
  }

  return response.json();
}

export async function getSellerTransactions(sellerId) {
  const response = await fetch(`${API_BASE}/sellers/${sellerId}/transactions`);

  if (!response.ok) {
    throw new Error("Failed to fetch seller transactions");
  }

  return response.json();
}