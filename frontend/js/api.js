
export const API_BASE = "https://blogspace-sotd.onrender.com/api";

export function getToken() {
    return localStorage.getItem("blogToken");
}

export function saveSession(token, user) {
    localStorage.setItem("blogToken", token);
    localStorage.setItem("blogUser", JSON.stringify(user));
}

export function clearSession() {
    localStorage.removeItem("blogToken");
    localStorage.removeItem("blogUser");
}

export async function apiRequest(endpoint, options = {}) {
    const headers = {
        ...(options.headers || {})
    };

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const token = getToken();

    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
    } catch (error) {
        throw new Error(
            "Cannot connect to the server. Check whether the backend is running."
        );
    }

    let data;

    try {
        data = await response.json();
    } catch {
        data = {
            message: "The server returned an invalid response."
        };
    }

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}
