const Comment = require("../models/Comment");
const mongoose = require("mongoose");
const Post = require("../models/Post");

// CREATE a new post
const createPost = async (req, res) => {
  const { title, content } = req.body || {};

  if (
    typeof title !== "string" ||
    typeof content !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Title and content are required.",
    });
  }

  const cleanTitle = title.trim();
  const cleanContent = content.trim();

  if (cleanTitle.length < 3 || cleanTitle.length > 120) {
    return res.status(400).json({
      success: false,
      message: "Title must contain 3 to 120 characters.",
    });
  }

  if (
    cleanContent.length < 1 ||
    cleanContent.length > 20000
  ) {
    return res.status(400).json({
      success: false,
      message: "Content must contain 1 to 20000 characters.",
    });
  }

  const post = await Post.create({
    title: cleanTitle,
    content: cleanContent,
    author: req.user._id,
  });

  const populatedPost = await Post.findById(post._id)
    .populate("author", "name");

  return res.status(201).json({
    success: true,
    message: "Blog post created successfully.",
    post: populatedPost,
  });
};

// READ all posts
const getAllPosts = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const requestedLimit = Number.parseInt(req.query.limit, 10) || 10;
  const limit = Math.min(20, Math.max(1, requestedLimit));

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find()
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Post.countDocuments(),
  ]);

  return res.status(200).json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    posts,
  });
};


const getMyPosts = async (req, res) => {
  const page = Math.max(
    1,
    Number.parseInt(req.query.page, 10) || 1
  );

  const requestedLimit = Number.parseInt(req.query.limit, 10) || 10;
  const limit = Math.min(20, Math.max(1, requestedLimit));
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ author: req.user._id })
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Post.countDocuments({ author: req.user._id }),
  ]);

  return res.status(200).json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    posts,
  });
};

// READ one post
const getPostById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid post ID.",
    });
  }

  const post = await Post.findById(id)
    .populate("author", "name");

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found.",
    });
  }

  return res.status(200).json({
    success: true,
    post,
  });
};

// UPDATE your own post
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body || {};

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid post ID.",
    });
  }

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found.",
    });
  }

  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can only edit your own posts.",
    });
  }

  if (title === undefined && content === undefined) {
    return res.status(400).json({
      success: false,
      message: "Provide a title or content to update.",
    });
  }

  if (title !== undefined) {
    if (typeof title !== "string") {
      return res.status(400).json({
        success: false,
        message: "Title must be text.",
      });
    }

    const cleanTitle = title.trim();

    if (cleanTitle.length < 3 || cleanTitle.length > 120) {
      return res.status(400).json({
        success: false,
        message: "Title must contain 3 to 120 characters.",
      });
    }

    post.title = cleanTitle;
  }

  if (content !== undefined) {
    if (typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Content must be text.",
      });
    }

    const cleanContent = content.trim();

    if (
      cleanContent.length < 1 ||
      cleanContent.length > 20000
    ) {
      return res.status(400).json({
        success: false,
        message: "Content must contain 1 to 20000 characters.",
      });
    }

    post.content = cleanContent;
  }

  await post.save();

  const updatedPost = await Post.findById(post._id)
    .populate("author", "name");

  return res.status(200).json({
    success: true,
    message: "Blog post updated successfully.",
    post: updatedPost,
  });
};

// DELETE your own post

const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid post ID.",
    });
  }

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found.",
    });
  }

  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own posts.",
    });
  }

  // Delete comments belonging to this post
  await Comment.deleteMany({ post: id });

  // Delete the blog post
  await Post.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Blog post and its comments deleted successfully.",
  });
};


module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
};
