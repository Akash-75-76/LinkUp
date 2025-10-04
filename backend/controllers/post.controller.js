import Post from "../models/posts.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comments.model.js";

export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "Running" });
};

// FIXED: Create post with proper error handling
export const createPost = async (req, res) => {
  const { token, body } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!body || body.trim() === '') {
      return res.status(400).json({ message: "Post content is required" });
    }

    const newPost = new Post({
      userId: user._id,
      body: body.trim(),
      media: req.file ? req.file.filename : null,
      fileType: req.file ? req.file.mimetype.split("/")[0] : null,
    });

    await newPost.save();
    
    // Populate user data for frontend
    await newPost.populate('userId', 'name username profilePicture');
    
    return res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (err) {
    console.error("Create post error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// FIXED: Get all posts with proper population
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ active: true })
      .populate("userId", "name username profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "name username profilePicture"
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Get all posts error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({
      userId: user._id,
      active: true,
    })
      .populate("userId", "name username profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "name username profilePicture"
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Get user posts error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// FIXED: Delete post with proper validation
export const deletePost = async (req, res) => {
  const { token, postId } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: postId, userId: user._id });
    if (!post) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }

    // Soft delete
    post.active = false;
    post.updatedAt = new Date();
    await post.save();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// FIXED: Comment post with proper population
export const commentPost = async (req, res) => {
  const { token, postId, comment } = req.body;

  try {
    const user = await User.findOne({ token }).select("_id name username profilePicture");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Verify post exists
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create comment
    const newComment = new Comment({
      userId: user._id,
      postId: postId,
      body: comment.trim()
    });

    await newComment.save();

    // Add comment reference to post and populate properly
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: newComment._id }
      },
      { 
        new: true 
      }
    )
    .populate("userId", "name username profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "userId",
        select: "name username profilePicture"
      }
    });

    // Populate the new comment for response
    await newComment.populate('userId', 'name username profilePicture');

    return res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
      post: updatedPost,
    });
  } catch (error) {
    console.error("Comment error:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

// FIXED: Get comments with proper error handling
export const get_comment_by_postId = async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.find({ postId: postId })
      .populate("userId", "name username profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// FIXED: Delete comment with proper validation
export const delete_comment_of_user = async (req, res) => {
  const { token, postId, commentId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.findOne({ 
      _id: commentId, 
      postId: postId 
    });
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user owns the comment or is post owner
    const post = await Post.findById(postId);
    if (comment.userId.toString() !== user._id.toString() && 
        post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// FIXED: Like/Unlike post with proper validation
export const incrementLikes = async (req, res) => {
  const { token, postId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const userLiked = post.likes.includes(user._id);
    
    if (userLiked) {
      // Unlike
      post.likes.pull(user._id);
      await post.save();
      return res.status(200).json({ 
        message: "Post unliked successfully",
        liked: false,
        likeCount: post.likes.length
      });
    } else {
      // Like
      post.likes.push(user._id);
      await post.save();
      return res.status(200).json({ 
        message: "Post liked successfully",
        liked: true,
        likeCount: post.likes.length
      });
    }
  } catch (error) {
    console.error("Like post error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const cleanupDatabase = async (req, res) => {
  try {
    const result = await Post.updateMany(
      { "likes.0": { $type: "string" } },
      { $set: { likes: [] } }
    );
    
    console.log(`Cleaned ${result.modifiedCount} posts with corrupted likes`);
    return res.status(200).json({ 
      message: `Cleaned ${result.modifiedCount} posts with corrupted likes`,
      cleaned: result.modifiedCount 
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return res.status(500).json({ message: "Cleanup failed" });
  }
};