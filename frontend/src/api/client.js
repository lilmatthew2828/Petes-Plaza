// Jania Southall 
// frontend runs through Vite dev server; use proxy prefix
const API_URL = import.meta.env.VITE_API_URL || "/api";
// During local testing, use the full URL. 
// Switch this back to "/api" before you deploy to AWS!

export async function apiCall(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    credentials = "omit", // Switched to 'omit' since we are using Bearer tokens now, bypassing cookie CORS issues!
    ...rest
  } = options;

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

  // 1. GRAB THE TOKEN BEFORE THE REQUEST
  const token = localStorage.getItem('token');
  const authHeader = token ? { "Authorization": `Bearer ${token}` } : {};

  // 2. BUNDLE EVERYTHING INTO THE CONFIG
  const config = {
    method,
    credentials,
    ...rest,
    headers: {
      ...(body !== undefined && method !== "GET" && method !== "HEAD"
        ? { "Content-Type": "application/json" }
        : {}),
      ...authHeader, // Inject the token here!
      ...headers,    // Keep any custom headers passed into the function
    },
  };

  if (body !== undefined && method !== "GET" && method !== "HEAD") {
    config.body = JSON.stringify(body);
  }

  // 3. SEND THE REQUEST WITH THE TOKEN
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