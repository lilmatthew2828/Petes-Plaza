// frontend runs through Vite dev server; use proxy prefix
const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiCall(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    credentials = "include",
    ...rest
  } = options;

  // if endpoint already absolute return as-is
  // Avoid double /api prefix if endpoint already starts with /api
  let normalized;
  if (endpoint.startsWith("http")) {
    normalized = endpoint;
  } else if (API_URL === "/api" && endpoint.startsWith("/api")) {
    normalized = endpoint; // already proxied
  } else if (endpoint.startsWith("/")) {
    normalized = `${API_URL}${endpoint}`;
  } else {
    normalized = `${API_URL}/${endpoint}`;
  }

  const config = {
    method,
    credentials,
    ...rest,
    headers: {
      ...(body !== undefined && method !== "GET" && method !== "HEAD"
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
  };

  if (body !== undefined && method !== "GET" && method !== "HEAD") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(normalized, config);

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "detail" in data
        ? data.detail
        : `API error: ${response.status} ${response.statusText}`;

    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}