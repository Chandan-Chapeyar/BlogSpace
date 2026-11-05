
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

// GET comments for a blog post
const getComments = async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid post ID.",
    });
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found.",
    });
  }

  const comments = await Comment.find({ post: postId })
    .populate("author", "name")
    .sort({ createdAt: 1 });

  return res.status(200).json({
    success: true,
    count: comments.length,
    comments,
  });
};

// CREATE a comment
const createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body || {};

  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid post ID.",
    });
  }

  if (typeof content !== "string") {
    return res.status(400).json({
      success: false,
      message: "Comment content is required.",
    });
  }

  const cleanContent = content.trim();

  if (cleanContent.length < 1 || cleanContent.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Comment must contain 1 to 2000 characters.",
    });
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found.",
    });
  }

  const comment = await Comment.create({
    content: cleanContent,
    post: post._id,
    author: req.user._id,
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate("author", "name");

  return res.status(201).json({
    success: true,
    message: "Comment added successfully.",
    comment: populatedComment,
  });
};

// UPDATE your own comment
const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body || {};

  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid comment ID.",
    });
  }

  if (typeof content !== "string") {
    return res.status(400).json({
      success: false,
      message: "Comment content is required.",
    });
  }

  const cleanContent = content.trim();

  if (cleanContent.length < 1 || cleanContent.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Comment must contain 1 to 2000 characters.",
    });
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found.",
    });
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can only edit your own comments.",
    });
  }

  comment.content = cleanContent;
  await comment.save();

  const updatedComment = await Comment.findById(commentId)
    .populate("author", "name");

  return res.status(200).json({
    success: true,
    message: "Comment updated successfully.",
    comment: updatedComment,
  });
};

// DELETE your own comment
const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid comment ID.",
    });
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found.",
    });
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own comments.",
    });
  }

  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json({
    success: true,
    message: "Comment deleted successfully.",
  });
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};
