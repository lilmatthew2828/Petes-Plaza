// Emmanuella Obidike - API functions for fetching seller page and transactions
import { apiCall } from "./client";

const SELLERS_BASE = "/api/sellers";

export async function getSellerPage(sellerId) {
  return apiCall(`${SELLERS_BASE}/${sellerId}`, {
    method: "GET",
  });
}

export async function getSellerTransactions(sellerId) {
  return apiCall(`${SELLERS_BASE}/${sellerId}/transactions`, {
    method: "GET",
  });
}



/*

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
  */