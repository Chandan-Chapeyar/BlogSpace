
import { apiRequest, getToken } from "./api.js";

const form = document.getElementById("editPostForm");
const button = document.getElementById("updateButton");
const message = document.getElementById("editPostMessage");

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

let canEdit = false;

function showMessage(text, success = false) {
    message.textContent = text;
    message.style.color = success ? "#218838" : "#c73535";
}

async function loadPost() {
    if (!getToken()) {
        window.location.replace("login.html");
        return;
    }

    if (!postId) {
        showMessage("Post ID is missing.");
        return;
    }

    try {
        const [postData, userData] = await Promise.all([
            apiRequest(`/posts/${encodeURIComponent(postId)}`),
            apiRequest("/auth/me")
        ]);

        const post = postData.post;

        const authorId =
            post.author?._id || post.author?.id;

        if (String(authorId) !== String(userData.user.id)) {
            showMessage("You are not authorized to edit this post.");
            form.hidden = true;
            return;
        }

        document.getElementById("title").value = post.title;
        document.getElementById("content").value = post.content;

        canEdit = true;

    } catch (error) {
        showMessage(error.message);
        form.hidden = true;
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!canEdit) return;

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

    button.disabled = true;
    button.textContent = "Saving...";

    try {
        const data = await apiRequest(
            `/posts/${encodeURIComponent(postId)}`,
            {
                method: "PUT",
                body: JSON.stringify({ title, content })
            }
        );

        showMessage(data.message, true);

        window.location.href =
            `post.html?id=${encodeURIComponent(postId)}`;

    } catch (error) {
        showMessage(error.message);

        button.disabled = false;
        button.textContent = "Save Changes";
    }
});

loadPost();
