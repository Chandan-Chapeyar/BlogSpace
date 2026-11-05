
import {
    apiRequest,
    getToken,
    clearSession
} from "./api.js";

const postsContainer = document.getElementById("dashboardPosts");
const message = document.getElementById("dashboardMessage");
const welcomeMessage = document.getElementById("welcomeMessage");
const postCount = document.getElementById("postCount");

const yearElement = document.getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

if (!getToken()) {
    window.location.replace("login.html");
}

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className =
        type === "success"
            ? "message success-message"
            : "message error-message";
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function createPostCard(post) {
    const card = document.createElement("article");
    card.className = "post-card";

    const title = document.createElement("h3");
    title.textContent = post.title;

    const content = document.createElement("p");
    content.textContent =
        post.content.length > 130
            ? post.content.slice(0, 130) + "..."
            : post.content;

    const date = document.createElement("p");
    date.className = "post-meta";
    date.textContent = `Created on ${formatDate(post.createdAt)}`;

    const actions = document.createElement("div");
    actions.className = "post-card-actions";

    const viewLink = document.createElement("a");
    viewLink.href = `post.html?id=${encodeURIComponent(post._id)}`;
    viewLink.className = "btn btn-outline";
    viewLink.textContent = "View";

    const editLink = document.createElement("a");
    editLink.href = `edit-post.html?id=${encodeURIComponent(post._id)}`;
    editLink.className = "btn btn-primary";
    editLink.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-danger";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this blog post?"
        );

        if (!confirmed) return;

        deleteButton.disabled = true;

        try {
            await apiRequest(`/posts/${encodeURIComponent(post._id)}`, {
                method: "DELETE"
            });

            card.remove();

            const remaining = postsContainer.querySelectorAll(".post-card").length;
            postCount.textContent = `${remaining} posts`;

            showMessage("Blog post deleted successfully.", "success");

            if (remaining === 0) {
                const empty = document.createElement("p");
                empty.className = "empty-message";
                empty.textContent = "You haven't published any posts yet.";
                postsContainer.append(empty);
            }

        } catch (error) {
            showMessage(error.message);
            deleteButton.disabled = false;
        }
    });

    actions.append(viewLink, editLink, deleteButton);

    card.append(title, content, date, actions);

    return card;
}

async function loadDashboard() {
    try {
        const userData = await apiRequest("/auth/me");

        welcomeMessage.textContent =
            `Welcome back, ${userData.user.name}!`;

        const data = await apiRequest("/posts/mine?limit=20");

        postsContainer.replaceChildren();

        postCount.textContent = `${data.total} posts`;

        if (!data.posts || data.posts.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-message";
            empty.textContent = "You haven't published any posts yet. Create your first blog post!";
            postsContainer.append(empty);
            return;
        }

        data.posts.forEach(post => {
            postsContainer.append(createPostCard(post));
        });

    } catch (error) {
        if (
            error.message.toLowerCase().includes("token") ||
            error.message.toLowerCase().includes("authentication")
        ) {
            clearSession();
            window.location.replace("login.html");
            return;
        }

        showMessage(error.message);
        postsContainer.replaceChildren();
    }
}

if (getToken()) {
    loadDashboard();
}
