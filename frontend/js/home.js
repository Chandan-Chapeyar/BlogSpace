
import { apiRequest } from "./api.js";

const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const postsMessage = document.getElementById("postsMessage");

let allPosts = [];

const yearElement = document.getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
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

    const preview = post.content.length > 150
        ? post.content.substring(0, 150) + "..."
        : post.content;

    content.textContent = preview;

    const author = document.createElement("p");
    author.className = "post-meta";

    const authorName = post.author?.name || "Unknown author";

    author.textContent =
        `By ${authorName} • ${formatDate(post.createdAt)}`;

    const readMore = document.createElement("a");

    readMore.href = `post.html?id=${encodeURIComponent(post._id)}`;
    readMore.className = "read-more";
    readMore.textContent = "Read Article →";

    card.append(title, content, author, readMore);

    return card;
}

function displayPosts(posts) {
    postsContainer.replaceChildren();

    if (posts.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "No blog posts found.";

        postsContainer.append(emptyMessage);
        return;
    }

    posts.forEach(post => {
        postsContainer.append(createPostCard(post));
    });
}

async function loadPosts() {
    try {
        postsMessage.textContent = "";

        const data = await apiRequest("/posts?limit=20");

        allPosts = data.posts || [];

        displayPosts(allPosts);
    } catch (error) {
        postsContainer.replaceChildren();

        postsMessage.textContent = error.message;
        postsMessage.className = "message error-message";
    }
}

searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredPosts = allPosts.filter(post => {
        return (
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            (post.author?.name || "").toLowerCase().includes(searchTerm)
        );
    });

    displayPosts(filteredPosts);
});

loadPosts();
