const API_BASE = "/api/proxy";
const NOTIFICATIONS_BASE = "/api/notifications-proxy";

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleAuthError(response: Response): Promise<Response> {
    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        throw new Error("Unauthorized");
    }
    return response;
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
    });
    return handleAuthError(response);
}

// API (NestJS) endpoints
export const api = {
    get: (path: string) => apiFetch(`${API_BASE}/${path}`),
    post: (path: string, body: unknown) => apiFetch(`${API_BASE}/${path}`, { method: "POST", body: JSON.stringify(body) }),
    patch: (path: string, body: unknown) => apiFetch(`${API_BASE}/${path}`, { method: "PATCH", body: JSON.stringify(body) }),
    put: (path: string, body: unknown) => apiFetch(`${API_BASE}/${path}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (path: string) => apiFetch(`${API_BASE}/${path}`, { method: "DELETE" }),
};

// Notifications service (Go) endpoints
export const notificationsApi = {
    get: (path: string) => apiFetch(`${NOTIFICATIONS_BASE}/${path}`),
    post: (path: string, body: unknown) => apiFetch(`${NOTIFICATIONS_BASE}/${path}`, { method: "POST", body: JSON.stringify(body) }),
    patch: (path: string, body: unknown) => apiFetch(`${NOTIFICATIONS_BASE}/${path}`, { method: "PATCH", body: JSON.stringify(body) }),
    put: (path: string, body: unknown) => apiFetch(`${NOTIFICATIONS_BASE}/${path}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (path: string) => apiFetch(`${NOTIFICATIONS_BASE}/${path}`, { method: "DELETE" }),
};

// Legacy export for backward compatibility during migration
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
    });
    return handleAuthError(response);
}

export { getAuthHeaders };
