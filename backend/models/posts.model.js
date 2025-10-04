import mongoose from "mongoose";
import Comment from "../models/comments.model.js"; 
const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  body: {  // ✅ Change from 'text' to 'body' for consistency
    type: String,
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  comments: [{  // ✅ Reference to standalone comments
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  media: {
    type: String,
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
  },
  fileType: {
    type: String,
    default: null,
  },
});

const Post = mongoose.model("Post", PostSchema);
export default Post;