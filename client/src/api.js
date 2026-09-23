// Backend base URL
const BASE_URL = "http://localhost:5000/api";

// Get the stored token after login
export function getToken() {
    return localStorage.getItem("token");
}

// Get the stored user after login
export function getStoredUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
}

// Save token + user after a successful login
export function saveSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

// Clear the session (used on logout or when the token expires)
export function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

// Decode a JWT's payload without any library (base64url -> JSON)
function decodeTokenPayload(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

// Check whether the stored token is missing or past its expiry time
export function isTokenExpired() {
    const token = getToken();
    if (!token) return true;

    const payload = decodeTokenPayload(token);
    if (!payload || !payload.exp) return false;

    return Date.now() >= payload.exp * 1000;
}

// Clear the session and send the user back to login with a flag
// so the login page can show a "session expired" message.
function forceLogout() {
    clearSession();
    if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
    }
}

/**
 * Shared API call helper used across the whole app.
 * Automatically attaches the Authorization header when signed in,
 * automatically parses JSON, and throws on a failed request
 * so callers can just use try/catch.
 *
 * @param {string} path - API path, e.g. "/materials" or "/auth/login"
 * @param {object} options - same shape as fetch options (method, body, headers...)
 */
export async function apiFetch(path, options = {}) {
    const token = getToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
        // Don't set Content-Type ourselves when sending FormData (file upload),
        // the browser will add the correct boundary automatically
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    // A 401 on a request that DID carry a token means the token is
    // invalid or expired -> force the user back to login. A 401 with
    // no token (e.g. a failed login attempt itself) is a normal error
    // and is left for the caller to handle.
    if (response.status === 401 && token) {
        forceLogout();
    }

    // Some endpoints (e.g. file download) don't return JSON, so parse safely
    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        data = await response.json().catch(() => null);
    }

    if (!response.ok) {
        const message =
            (data && data.message) ||
            `Request failed (status ${response.status})`;
        throw new Error(message);
    }

    return data;
}