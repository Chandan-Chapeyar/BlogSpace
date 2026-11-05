
const express = require("express");

const router = express.Router();

const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");

// Anyone can view comments
router.get("/posts/:postId/comments", getComments);

// Login required to add a comment
router.post("/posts/:postId/comments", protect, createComment);

// Login required to edit or delete your own comment
router.put("/comments/:commentId", protect, updateComment);
router.delete("/comments/:commentId", protect, deleteComment);

module.exports = router;
