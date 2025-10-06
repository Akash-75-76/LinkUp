import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPosts,
  likePost,
  addComment,
  deleteComment,
} from "@/config/redux/action/postAction";
import ThumbUp from '@mui/icons-material/ThumbUp';
import ThumbUpAlt from '@mui/icons-material/ThumbUpAlt';
import ChatBubble from '@mui/icons-material/ChatBubble';
import Share from '@mui/icons-material/Share';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Send from '@mui/icons-material/Send';
import Description from '@mui/icons-material/Description';
import styles from "./PostFeed.module.css";

const API_BASE_URL = "https://linkup-o722.onrender.com";
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0wIDg1QzAgNzAuNjQgMTEuNjQgNTkgMjYgNTlINzRDODguMzYgNTkgMTAwIDcwLjY0IDEwMCA4NVYxMDBIMFY4NVoiIGZpbGw9IiM5QjlCOUIiLz4KPC9zdmc+";

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

  const handleLike = (postId) => {
    if (!user?.token || !user?._id) return;
    dispatch(likePost({ token: user.token, postId, userId: user._id }));
  };

  const handleAddComment = (postId) => {
    if (!user?.token || !commentText[postId]?.trim()) return;
    dispatch(addComment({ token: user.token, postId, comment: commentText[postId] }));
    setCommentText((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleDeleteComment = (postId, commentId) => {
    if (!user?.token) return;
    dispatch(deleteComment({ token: user.token, postId, commentId }));
  };

  const startEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditCommentText(comment.body);
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
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className={styles.postFeed}>
      <div className={styles.feedHeader}>
        <h2>Your Professional Feed</h2>
        <p>Stay updated with your network's activities</p>
      </div>

      {posts.length === 0 ? (
        <div className={styles.noPosts}>
          <Description className={styles.noPostsIcon} />
          <h3>No posts yet</h3>
          <p>Be the first to share your thoughts and updates!</p>
        </div>
      ) : (
        <div className={styles.postsContainer}>
          {posts.map((post) => (
            <div key={post._id} className={styles.postCard}>
              {/* Post Header */}
              <div className={styles.postHeader}>
                <div className={styles.userInfo}>
                  <img
                    src={
                      post.userId?.profilePicture &&
                      post.userId.profilePicture !== "default.jpg"
                        ? `${API_BASE_URL}/uploads/${post.userId.profilePicture}`
                        : DEFAULT_AVATAR
                    }
                    alt={post.userId?.name}
                    className={styles.avatar}
                    onError={(e) => {
                      if (e.target.src !== DEFAULT_AVATAR) {
                        e.target.src = DEFAULT_AVATAR;
                      }
                    }}
                  />
                  <div className={styles.userDetails}>
                    <h4 className={styles.userName}>{post.userId?.name}</h4>
                    <p className={styles.username}>@{post.userId?.username}</p>
                    <p className={styles.postTime}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className={styles.postContent}>
                <p className={styles.postBody}>{post.body}</p>

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
                          className={styles.fileLink}
                        >
                          View File
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Post Stats */}
              <div className={styles.postStats}>
                <span className={styles.likesCount}>
                  {post.likes?.length || 0} likes
                </span>
                <span className={styles.commentsCount}>
                  {post.comments?.length || 0} comments
                </span>
              </div>

              {/* Post Actions */}
              <div className={styles.postActions}>
                <button
                  onClick={() => handleLike(post._id)}
                  className={`${styles.actionButton} ${
                    post.likes?.includes(user?._id) ? styles.liked : ''
                  }`}
                >
                  {post.likes?.includes(user?._id) ? (
                    <ThumbUpAlt className={styles.actionIcon} />
                  ) : (
                    <ThumbUp className={styles.actionIcon} />
                  )}
                  Like
                </button>
                <button className={styles.actionButton}>
                  <ChatBubble className={styles.actionIcon} />
                  Comment
                </button>
                <button className={styles.actionButton}>
                  <Share className={styles.actionIcon} />
                  Share
                </button>
              </div>

              {/* Comments Section */}
              <div className={styles.commentsSection}>
                <div className={styles.addComment}>
                  <img
                    src={
                      user?.profilePicture && user.profilePicture !== "default.jpg"
                        ? `${API_BASE_URL}/uploads/${user.profilePicture}`
                        : DEFAULT_AVATAR
                    }
                    alt="Your avatar"
                    className={styles.commenterAvatar}
                  />
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
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && commentText[post._id]?.trim()) {
                        handleAddComment(post._id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAddComment(post._id)}
                    disabled={!commentText[post._id]?.trim()}
                    className={styles.commentButton}
                  >
                    <Send className={styles.buttonIcon} />
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
                            : DEFAULT_AVATAR
                        }
                        alt={comment.userId?.name}
                        className={styles.commentAvatar}
                      />
                      <div className={styles.commentInfo}>
                        <strong className={styles.commentAuthor}>
                          {comment.userId?.name}
                        </strong>
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
                        <div className={styles.editActions}>
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
                      </div>
                    ) : (
                      <div className={styles.commentContent}>
                        <p className={styles.commentText}>{comment.body}</p>
                        {user?._id === comment.userId?._id && (
                          <div className={styles.commentActions}>
                            <button
                              onClick={() => startEditComment(comment)}
                              className={styles.editButton}
                            >
                              <Edit className={styles.buttonIcon} />
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteComment(post._id, comment._id)
                              }
                              className={styles.deleteButton}
                            >
                              <Delete className={styles.buttonIcon} />
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
          ))}
        </div>
      )}
    </div>
  );
};

export default PostFeed;