
import {
    apiRequest,
    getToken
} from "./api.js";

const articleContainer = document.getElementById("articleContainer");
const commentsContainer = document.getElementById("commentsContainer");
const commentFormContainer = document.getElementById("commentFormContainer");
const commentCount = document.getElementById("commentCount");
const commentsMessage = document.getElementById("commentsMessage");

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const yearElement = document.getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

let currentUser = null;
let currentPost = null;

function showMessage(text, success = false) {
    commentsMessage.textContent = text;
    commentsMessage.className = success
        ? "message success-message"
        : "message error-message";
}

function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("blogUser")) || null;
    } catch {
        return null;
    }
}

function getUserId(user) {
    return user?.id || user?._id || null;
}

// LOAD ARTICLE
async function loadArticle() {
    if (!postId) {
        articleContainer.textContent = "Article ID is missing.";
        return;
    }

    try {
        const data = await apiRequest(
            `/posts/${encodeURIComponent(postId)}`
        );

        currentPost = data.post;

        document.title = `${currentPost.title} | BlogSpace`;

        renderArticle(currentPost);

    } catch (error) {
        articleContainer.textContent = error.message;
    }
}

// DISPLAY ARTICLE
function renderArticle(post) {
    articleContainer.replaceChildren();

    const category = document.createElement("span");
    category.className = "eyebrow";
    category.textContent = "BLOG ARTICLE";

    const title = document.createElement("h1");
    title.className = "article-title";
    title.textContent = post.title;

    const metadata = document.createElement("p");
    metadata.className = "article-meta";

    const authorName = post.author?.name || "Unknown author";

    metadata.textContent =
        `Written by ${authorName} • ${formatDate(post.createdAt)}`;

    const content = document.createElement("div");
    content.className = "article-content";
    content.textContent = post.content;

    articleContainer.append(
        category,
        title,
        metadata,
        content
    );
}

// COMMENT FORM
function renderCommentForm() {
    commentFormContainer.replaceChildren();

    if (!getToken()) {
        const prompt = document.createElement("p");
        prompt.className = "login-prompt";
        prompt.textContent = "Please log in to join the discussion.";

        const loginLink = document.createElement("a");
        loginLink.href = "login.html";
        loginLink.textContent = "Login here";

        prompt.append(" ", loginLink);
        commentFormContainer.append(prompt);
        return;
    }

    const form = document.createElement("form");
    form.className = "comment-form";
    form.id = "commentForm";

    const label = document.createElement("label");
    label.htmlFor = "commentContent";
    label.textContent = "Write a comment";

    const textarea = document.createElement("textarea");
    textarea.id = "commentContent";
    textarea.placeholder = "Share your thoughts...";
    textarea.maxLength = 2000;
    textarea.required = true;

    const button = document.createElement("button");
    button.type = "submit";
    button.className = "btn btn-primary";
    button.textContent = "Post Comment";

    form.append(label, textarea, button);

    form.addEventListener("submit", submitComment);

    commentFormContainer.append(form);
}

// SUBMIT COMMENT
async function submitComment(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const textarea = form.querySelector("textarea");
    const button = form.querySelector("button");

    const content = textarea.value.trim();

    if (!content) {
        showMessage("Please write a comment.");
        return;
    }

    button.disabled = true;
    button.textContent = "Posting...";

    try {
        await apiRequest(
            `/posts/${encodeURIComponent(postId)}/comments`,
            {
                method: "POST",
                body: JSON.stringify({ content })
            }
        );

        form.reset();

        showMessage("Comment posted successfully!", true);

        await loadComments();

    } catch (error) {
        showMessage(error.message);

    } finally {
        button.disabled = false;
        button.textContent = "Post Comment";
    }
}

// CREATE COMMENT CARD
function createCommentCard(comment) {
    const card = document.createElement("article");
    card.className = "comment-card";

    const header = document.createElement("div");
    header.className = "comment-header";

    const author = document.createElement("strong");
    author.textContent = comment.author?.name || "Unknown user";

    const date = document.createElement("span");
    date.textContent = formatDate(comment.createdAt);

    header.append(author, date);

    const content = document.createElement("p");
    content.className = "comment-content";
    content.textContent = comment.content;

    card.append(header, content);

    const authorId = comment.author?._id || comment.author?.id;
    const loggedInUserId = getUserId(currentUser);

    const isOwner =
        loggedInUserId &&
        String(authorId) === String(loggedInUserId);

    if (isOwner) {
        const actions = document.createElement("div");
        actions.className = "comment-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "comment-action edit-comment";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editComment(comment, editButton);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "comment-action delete-comment";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteComment(comment._id, deleteButton);
        });

        actions.append(editButton, deleteButton);
        card.append(actions);
    }

    return card;
}

// LOAD COMMENTS
async function loadComments() {
    try {
        const data = await apiRequest(
            `/posts/${encodeURIComponent(postId)}/comments`
        );

        const comments = data.comments || [];

        commentsContainer.replaceChildren();

        commentCount.textContent =
            `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`;

        if (comments.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-message";
            empty.textContent = "No comments yet. Be the first to comment!";

            commentsContainer.append(empty);
            return;
        }

        comments.forEach(comment => {
            commentsContainer.append(createCommentCard(comment));
        });

    } catch (error) {
        commentsContainer.textContent = error.message;
    }
}

// EDIT COMMENT
async function editComment(comment, button) {
    const updatedContent = window.prompt(
        "Edit your comment:",
        comment.content
    );

    if (updatedContent === null) return;

    const content = updatedContent.trim();

    if (!content) {
        showMessage("Comment cannot be empty.");
        return;
    }

    if (content.length > 2000) {
        showMessage("Comment cannot exceed 2000 characters.");
        return;
    }

    button.disabled = true;

    try {
        await apiRequest(
            `/comments/${encodeURIComponent(comment._id)}`,
            {
                method: "PUT",
                body: JSON.stringify({ content })
            }
        );

        showMessage("Comment updated successfully!", true);

        await loadComments();

    } catch (error) {
        showMessage(error.message);
        button.disabled = false;
    }
}

// DELETE COMMENT
async function deleteComment(commentId, button) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    button.disabled = true;

    try {
        await apiRequest(
            `/comments/${encodeURIComponent(commentId)}`,
            {
                method: "DELETE"
            }
        );

        showMessage("Comment deleted successfully!", true);

        await loadComments();

    } catch (error) {
        showMessage(error.message);
        button.disabled = false;
    }
}

// INITIALIZE PAGE
async function initializePage() {
    if (!postId) {
        articleContainer.textContent = "Article ID is missing.";
        return;
    }

    currentUser = getStoredUser();

    renderCommentForm();

    await Promise.all([
        loadArticle(),
        loadComments()
    ]);
}

initializePage();
