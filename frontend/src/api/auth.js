// Jania Southall - API client functions for authentication-related operations 
// (register, login, logout, and get current user). 
// These functions call the corresponding backend API endpoints.
import { apiCall } from "./client";

/**
 * Register a new user
 */
export async function register(payload) {
  return apiCall("/auth/register", {
    method: "POST",
    body: payload,
  });
}

/**
 * Login with email or username
 */
export async function login(payload) {
  return apiCall("/auth/login", {
    method: "POST",
    body: payload,
  });
}

/**
 * Logout and revoke session
 */
export async function logout() {
  return apiCall("/auth/logout", {
    method: "POST",
  });
}

/**
 * Get current authenticated user
 */
export async function getMe() {
  return apiCall("/auth/me", {
    method: "GET",
  });
}