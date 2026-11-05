
import { API_BASE, saveSession } from "./api.js";

const yearElement = document.getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// Display form messages safely
function showMessage(element, message, type) {
    if (!element) return;

    element.textContent = message;
    element.style.color = type === "success" ? "#218838" : "#c73535";
}

// Send authentication request to backend
async function submitAuthRequest(endpoint, payload) {
    let response;

    try {
        response = await fetch(`${API_BASE}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
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
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
    }

    return data;
}

// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message = document.getElementById("registerMessage");
        const button = document.getElementById("registerButton");

        if (password !== confirmPassword) {
            showMessage(message, "Passwords do not match.", "error");
            return;
        }

        if (new TextEncoder().encode(password).length > 72) {
            showMessage(
                message,
                "Password is too long. Use at most 72 UTF-8 bytes.",
                "error"
            );
            return;
        }

        button.disabled = true;
        button.textContent = "Creating account...";
        showMessage(message, "", "success");

        try {
            const data = await submitAuthRequest("/auth/register", {
                name,
                email,
                password
            });

            if (!data.token || !data.user) {
                throw new Error("The server did not return a valid login session.");
            }

            saveSession(data.token, data.user);

            showMessage(
                message,
                "Account created successfully! Redirecting...",
                "success"
            );

            setTimeout(() => {
                window.location.href = "index.html";
            }, 800);

        } catch (error) {
            showMessage(message, error.message, "error");

            button.disabled = false;
            button.textContent = "Create Account";
        }
    });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const message = document.getElementById("loginMessage");
        const button = document.getElementById("loginButton");

        button.disabled = true;
        button.textContent = "Signing in...";
        showMessage(message, "", "success");

        try {
            const data = await submitAuthRequest("/auth/login", {
                email,
                password
            });

            if (!data.token || !data.user) {
                throw new Error("The server did not return a valid login session.");
            }

            saveSession(data.token, data.user);

            showMessage(
                message,
                "Login successful! Redirecting...",
                "success"
            );

            setTimeout(() => {
                window.location.href = "index.html";
            }, 800);

        } catch (error) {
            showMessage(message, error.message, "error");

            button.disabled = false;
            button.textContent = "Login";
        }
    });
}
