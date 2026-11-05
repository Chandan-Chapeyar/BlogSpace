
import { apiRequest, getToken } from "./api.js";

const form = document.getElementById("createPostForm");
const button = document.getElementById("publishButton");
const message = document.getElementById("createPostMessage");

if (!getToken()) {
    window.location.replace("login.html");
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

    if (title.length < 3 || content.length < 1) {
        message.textContent = "Please provide a valid title and content.";
        return;
    }

    button.disabled = true;
    button.textContent = "Publishing...";

    message.textContent = "";

    try {
        const data = await apiRequest("/posts", {
            method: "POST",
            body: JSON.stringify({ title, content })
        });

        message.style.color = "#218838";
        message.textContent = data.message;

        window.location.href = "dashboard.html";

    } catch (error) {
        message.style.color = "#c73535";
        message.textContent = error.message;

        button.disabled = false;
        button.textContent = "Publish Blog";
    }
});
