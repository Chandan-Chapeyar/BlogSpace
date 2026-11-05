
const express = require("express");

const router = express.Router();

const {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");

// View all posts
router.get("/", getAllPosts);

// Create a post (login required)
router.post("/", protect, createPost);

// Get current user's posts
router.get("/mine", protect, getMyPosts);

// View one post
router.get("/:id", getPostById);

// Update a post (owner only)
router.put("/:id", protect, updatePost);

// Delete a post (owner only)
router.delete("/:id", protect, deletePost);

module.exports = router;
