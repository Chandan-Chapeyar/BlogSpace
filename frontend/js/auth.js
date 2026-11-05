
import { clearSession, getToken } from "./api.js";

const navActions = document.getElementById("navActions");

function createNavLink(text, href, className = "") {
    const link = document.createElement("a");

    link.href = href;
    link.textContent = text;

    if (className) {
        link.className = className;
    }

    return link;
}

function updateNavigation() {
    if (!navActions) return;

    navActions.replaceChildren();

    if (getToken()) {
        navActions.append(
            createNavLink("Dashboard", "dashboard.html", "btn btn-outline"),
            createNavLink("Write Blog", "create-post.html", "btn btn-primary")
        );

        const logoutButton = document.createElement("button");

        logoutButton.type = "button";
        logoutButton.textContent = "Logout";
        logoutButton.className = "btn btn-outline";

        logoutButton.addEventListener("click", () => {
            clearSession();
            window.location.href = "index.html";
        });

        navActions.append(logoutButton);
    } else {
        navActions.append(
            createNavLink("Login", "login.html", "btn btn-outline"),
            createNavLink("Get Started", "register.html", "btn btn-primary")
        );
    }
}

document.addEventListener("DOMContentLoaded", updateNavigation);
