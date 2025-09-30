import Post from "../models/posts.model.js";
import User from "../models/user.model.js";

export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "Running" });
};

export const createPost = async (req, res) => {
  const { token, body } = req.body; // Get body from request body

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new post with proper data
    const newPost = new Post({
      userId: user._id,
      body: body, // Use the body from req.body
      media: req.file ? req.file.filename : null, // Use null instead of empty string
      fileType: req.file ? req.file.mimetype.split("/")[0] : null, // Use null instead of empty string
    });

    await newPost.save();
    return res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Additional post functions you might need:
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ active: true })
      .populate("userId", "name username profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
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
    }).sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  const { token, postId } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: postId, userId: user._id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Soft delete by setting active to false
    post.active = false;
    post.updatedAt = new Date();
    await post.save();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const commentPost = async (req, res) => {
  const { token, postId, comment } = req.body;

  try {
    const user = await User.findOne({ token }).select("_id name username");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: postId, active: true });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ✅ Fix: Use correct variable names and structure
    const newComment = {
      userId: user._id,
      text: comment, // ✅ Use 'text' instead of 'comment'
      createdAt: new Date(),
    };

    // ✅ Initialize comments array if it doesn't exist
    if (!post.comments) {
      post.comments = [];
    }

    post.comments.push(newComment);
    await post.save();

    // Populate the comment with user info for response
    const populatedPost = await Post.findById(post._id).populate(
      "comments.userId",
      "name username profilePicture"
    );

    return res.status(201).json({
      message: "Comment added successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const get_comment_by_postId = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate(
      "comments.userId",
      "name username profilePicture"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json(post.comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const delete_comment_of_user = async (req, res) => {
  const { token, postId, commentId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    comment.remove();
    await post.save();
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

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
    
    // ✅ Make it toggle functionality
    const userLiked = post.likes.includes(user._id);
    
    if (userLiked) {
      // Unlike - remove user from likes
      post.likes.pull(user._id);
      await post.save();
      return res.status(200).json({ 
        message: "Post unliked successfully",
        liked: false,
        likeCount: post.likes.length
      });
    } else {
      // Like - add user to likes
      post.likes.push(user._id);
      await post.save();
      return res.status(200).json({ 
        message: "Post liked successfully",
        liked: true,
        likeCount: post.likes.length
      });
    }
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};