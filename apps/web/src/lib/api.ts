// Centralized API base URL and fetch helper
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Build full URL from a relative path, preserving absolute URLs if provided
export function apiUrl(path: string) {
  if (!path) return API_BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  // Enforce presence of auth token for all requests
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    const err = new TypeError('No auth token found');
    console.error('[apiFetch] No auth token found in localStorage');
    throw err;
  }
  const url = typeof input === "string" ? input : String(input);
  const finalUrl = apiUrl(url);
  // Lightweight diagnostic for debugging network issues
  console.debug(`[apiFetch] ${init?.method ?? 'GET'} ${finalUrl}`);
  if (init?.headers) {
    // Log only a high-level hint to avoid leaking sensitive tokens in logs
    console.debug(`[apiFetch] Headers provided for ${finalUrl}`);
  }
  try {
    return fetch(finalUrl, init);
  } catch (err) {
    // Re-log with URL for easier troubleshooting
    console.error(`[apiFetch] Network error when calling ${finalUrl}:`, err);
    throw err;
  }
}

// Create a small API client bound to a specific base URL
function createApiClient(baseUrl: string) {
  const withBase = (path: string) => {
    const url = path.startsWith("/") ? path : `/${path}`;
    // Avoid duplicating slashes if baseUrl already ends with '/'
    if (baseUrl.endsWith("/") && url.startsWith("/")) {
      return baseUrl.slice(0, -1) + url;
    }
    return baseUrl + url;
  };

  return {
    get: (path: string) => apiFetch(withBase(path), { method: "GET", headers: withAuthHeaders() }),
    post: (path: string, body?: any) => apiFetch(withBase(path), { method: "POST", headers: withAuthHeaders(), body: JSON.stringify(body) }),
    patch: (path: string, body?: any) => apiFetch(withBase(path), { method: "PATCH", headers: withAuthHeaders(), body: JSON.stringify(body) }),
    delete: (path: string) => apiFetch(withBase(path), { method: "DELETE", headers: withAuthHeaders() }),
  };
}

// Simple API clients for inventory and notification services
export const inventoryApi = createApiClient("http://localhost:3001");
export const notifyApi = createApiClient("http://localhost:3002");

// Simple API broker that mirrors common HTTP methods and attaches auth headers when present
function withAuthHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const base: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    base["Authorization"] = `Bearer ${token}`;
  }
  return { ...base, ...(extraHeaders || {}) };
}

export const api = {
  get: (path: string) => apiFetch(path, { method: "GET", headers: withAuthHeaders() }),
  post: (path: string, body?: any) => apiFetch(path, { method: "POST", headers: withAuthHeaders(), body: JSON.stringify(body) }),
  patch: (path: string, body?: any) => apiFetch(path, { method: "PATCH", headers: withAuthHeaders(), body: JSON.stringify(body) }),
  delete: (path: string) => apiFetch(path, { method: "DELETE", headers: withAuthHeaders() }),
};
