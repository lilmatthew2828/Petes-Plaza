// New - Matthew Kp
const API_BASE = "http://127.0.0.1:8000";

export async function getSellerPage(sellerId) {
  const response = await fetch(`${API_BASE}/api/sellers/${sellerId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch seller page");
  }

  return response.json();
}

export async function getSellerTransactions(sellerId) {
  const response = await fetch(`${API_BASE}/api/sellers/${sellerId}/transactions`);

  if (!response.ok) {
    throw new Error("Failed to fetch seller transactions");
  }

  return response.json();
}