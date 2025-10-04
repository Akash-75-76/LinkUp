import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPosts,
  likePost,
  addComment,
  deleteComment,
} from "@/config/redux/action/postAction";
import styles from "./PostFeed.module.css";

// ✅ Get base URL from your axios config or use environment variable
const API_BASE_URL = "http://localhost:5000";
// Add this constant at the top of your component
const DEFAULT_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0wIDg1QzAgNzAuNjQgMTEuNjQgNTkgMjYgNTlINzRDODguMzYgNTkgMTAwIDcwLjY0IDEwMCA4NVYxMDBIMFY4NVoiIGZpbGw9IiM5QjlCOUIiLz4KPC9zdmc+";
const PostFeed = () => {
  const dispatch = useDispatch();
  const { posts, isLoading } = useSelector((state) => state.posts);
  const { user, loggedIn } = useSelector((state) => state.auth);
  const [commentText, setCommentText] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [hasFetchedPosts, setHasFetchedPosts] = useState(false);

  useEffect(() => {
    if (loggedIn && !hasFetchedPosts) {
      dispatch(getAllPosts());
      setHasFetchedPosts(true);
    }
  }, [dispatch, loggedIn, hasFetchedPosts]);

  // Add debug logging to check post data
  useEffect(() => {
    if (posts.length > 0) {
      console.log("Posts data:", posts);
      posts.forEach((post, index) => {
        console.log(`Post ${index}:`, {
          id: post._id,
          body: post.body,
          media: post.media,
          fileType: post.fileType,
          hasMedia: !!post.media,
        });
      });
    }
  }, [posts]);

  const handleLike = (postId) => {
    if (!user?.token || !user?._id) return; // ✅ Check for user ID too

    dispatch(
      likePost({
        token: user.token,
        postId,
        userId: user._id, // ✅ Pass user ID to action
      })
    );
  };

  const handleAddComment = (postId) => {
    if (!user?.token || !commentText[postId]?.trim()) return;
    dispatch(
      addComment({
        token: user.token,
        postId,
        comment: commentText[postId],
      })
    );
    setCommentText((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleDeleteComment = (postId, commentId) => {
    if (!user?.token) return;
    dispatch(deleteComment({ token: user.token, postId, commentId }));
  };

  const startEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditCommentText(comment.text);
  };

  const cancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  const saveEditComment = (postId, commentId) => {
    console.log("Edit comment:", postId, commentId, editCommentText);
    setEditingComment(null);
    setEditCommentText("");
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading posts...</div>;
  }

  return (
    <div className={styles.postFeed}>
      <h2>Your Feed</h2>

      {posts.length === 0 ? (
        <div className={styles.noPosts}>
          <p>No posts yet. Be the first to post!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post._id} className={styles.postCard}>
            {/* Post Header */}
            <div className={styles.postHeader}>
              <div className={styles.userInfo}>
                <img
                  src={
                    post.userId?.profilePicture &&
                    post.userId.profilePicture !== "default.jpg"
                      ? `${API_BASE_URL}/uploads/${post.userId.profilePicture}`
                      : DEFAULT_AVATAR // ✅ FIXED
                  }
                  alt={post.userId?.name}
                  className={styles.avatar}
                  onError={(e) => {
                    if (e.target.src !== DEFAULT_AVATAR) {
                      e.target.src = DEFAULT_AVATAR; // ✅ FIXED
                    }
                  }}
                />
                <div>
                  <h4>{post.userId?.name}</h4>
                  <p className={styles.username}>@{post.userId?.username}</p>
                  <p className={styles.postTime}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className={styles.postContent}>
              <p>{post.body}</p>

              {/* ✅ FIXED: Media rendering with proper URLs */}
              {post.media && (
                <div className={styles.postMedia}>
                  {post.fileType === "image" ? (
                    <img
                      src={`${API_BASE_URL}/uploads/${post.media}`}
                      alt="Post media"
                      className={styles.media}
                      onError={(e) => {
                        console.error("Failed to load image:", e.target.src);
                        e.target.style.display = "none";
                      }}
                      onLoad={() =>
                        console.log("Image loaded successfully:", post.media)
                      }
                    />
                  ) : post.fileType === "video" ? (
                    <video controls className={styles.media}>
                      <source src={`${API_BASE_URL}/uploads/${post.media}`} />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className={styles.unknownMedia}>
                      <p>Media file: {post.media}</p>
                      <a
                        href={`${API_BASE_URL}/uploads/${post.media}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View File
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className={styles.postActions}>
              <button
                onClick={() => handleLike(post._id)}
                className={`${styles.actionButton} ${
                  post.likes?.includes(user?._id) ? styles.liked : ""
                }`}
              >
                👍 Like ({post.likes?.length || 0})
              </button>
              <button className={styles.actionButton}>
                💬 Comment ({post.comments?.length || 0})
              </button>
            </div>

            {/* Comments Section */}
            <div className={styles.commentsSection}>
              <div className={styles.addComment}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText[post._id] || ""}
                  onChange={(e) =>
                    setCommentText((prev) => ({
                      ...prev,
                      [post._id]: e.target.value,
                    }))
                  }
                  className={styles.commentInput}
                />
                <button
                  onClick={() => handleAddComment(post._id)}
                  className={styles.commentButton}
                >
                  Post
                </button>
              </div>

              {/* Comments List */}
              {post.comments?.map((comment) => (
                <div key={comment._id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <img
                      src={
                        comment.userId?.profilePicture &&
                        comment.userId.profilePicture !== "default.jpg"
                          ? `${API_BASE_URL}/uploads/${comment.userId.profilePicture}`
                          : DEFAULT_AVATAR // ✅ FIXED
                      }
                      alt={comment.userId?.name}
                      className={styles.commentAvatar}
                    />
                    <div className={styles.commentInfo}>
                      <strong>{comment.userId?.name}</strong>
                      <span className={styles.commentTime}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {editingComment === comment._id ? (
                    <div className={styles.editComment}>
                      <input
                        type="text"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className={styles.editInput}
                      />
                      <button
                        onClick={() => saveEditComment(post._id, comment._id)}
                        className={styles.saveButton}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditComment}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className={styles.commentContent}>
                      <p>{comment.text}</p>
                      {user?._id === comment.userId?._id && (
                        <div className={styles.commentActions}>
                          <button
                            onClick={() => startEditComment(comment)}
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteComment(post._id, comment._id)
                            }
                            className={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PostFeed;
