import { createSlice } from '@reduxjs/toolkit'
import { 
  getAllPosts, 
  getUserPosts, 
  createPost, 
  deletePost, 
  likePost, 
  addComment, 
  getCommentsByPostId, 
  deleteComment 
} from '../../action/postAction/index'

const initialState = {
  posts: [],
  userPosts: [],
  currentPost: null,
  isError: false,
  isLoading: false,
  isActionLoading: false,
  message: "",
  success: false,
  comments: {},
}

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostState: (state) => {
      state.isError = false;
      state.message = "";
      state.success = false;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearUserPosts: (state) => {
      state.userPosts = [];
    },
    updatePostInState: (state, action) => {
      const updatedPost = action.payload;
      const index = state.posts.findIndex(post => post._id === updatedPost._id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...updatedPost };
      }
      
      const userIndex = state.userPosts.findIndex(post => post._id === updatedPost._id);
      if (userIndex !== -1) {
        state.userPosts[userIndex] = { ...state.userPosts[userIndex], ...updatedPost };
      }
    },
    removePostFromState: (state, action) => {
      const postId = action.payload;
      state.posts = state.posts.filter(post => post._id !== postId);
      state.userPosts = state.userPosts.filter(post => post._id !== postId);
    },
    // FIX: Add comment to state immediately
    addCommentToState: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post && Array.isArray(post.comments)) {
        post.comments.push(comment);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Posts
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "Fetching all posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
        state.message = "Posts fetched successfully";
        state.success = true;
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.posts = [];
      })

      // Get User Posts
      .addCase(getUserPosts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "Fetching your posts...";
      })
      .addCase(getUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = action.payload;
        state.message = "Your posts fetched successfully";
        state.success = true;
      })
      .addCase(getUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.userPosts = [];
      })

      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isActionLoading = true;
        state.isError = false;
        state.message = "Creating post...";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isActionLoading = false;
        if (action.payload.post) {
          state.posts.unshift(action.payload.post);
          state.userPosts.unshift(action.payload.post);
        }
        state.message = action.payload.message || "Post created successfully";
        state.success = true;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isActionLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.isActionLoading = true;
        state.isError = false;
        state.message = "Deleting post...";
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const { postId } = action.payload;
        state.posts = state.posts.filter(post => post._id !== postId);
        state.userPosts = state.userPosts.filter(post => post._id !== postId);
        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isActionLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // FIXED: Like Post - Handle both string and object IDs
      .addCase(likePost.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const { postId, liked, userId, likeCount } = action.payload;
        
        // Helper to update likes in a post
        const updatePostLikes = (post) => {
          if (!post) return post;
          
          if (liked) {
            // Add like
            if (!post.likes.some(like => 
              like.toString() === userId.toString() || 
              (like._id && like._id.toString() === userId.toString())
            )) {
              post.likes.push(userId);
            }
          } else {
            // Remove like
            post.likes = post.likes.filter(like => 
              like.toString() !== userId.toString() && 
              (!like._id || like._id.toString() !== userId.toString())
            );
          }
          return post;
        };

        // Update in all posts
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex] = updatePostLikes(state.posts[postIndex]);
        }
        
        // Update in user posts
        const userPostIndex = state.userPosts.findIndex(post => post._id === postId);
        if (userPostIndex !== -1) {
          state.userPosts[userPostIndex] = updatePostLikes(state.userPosts[userPostIndex]);
        }
        
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(likePost.rejected, (state, action) => {
        state.isActionLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // FIXED: Add Comment - Update posts properly
      .addCase(addComment.pending, (state) => {
        state.isActionLoading = true;
        state.isError = false;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isActionLoading = false;
        
        if (action.payload.post) {
          const { post } = action.payload;
          
          // Update in all posts
          const postIndex = state.posts.findIndex(p => p._id === post._id);
          if (postIndex !== -1) {
            state.posts[postIndex] = post;
          }
          
          // Update in user posts
          const userPostIndex = state.userPosts.findIndex(p => p._id === post._id);
          if (userPostIndex !== -1) {
            state.userPosts[userPostIndex] = post;
          }
        }
        
        if (action.payload.comment) {
          const { comment } = action.payload;
          if (!state.comments[comment.postId]) {
            state.comments[comment.postId] = [];
          }
          state.comments[comment.postId].unshift(comment);
        }
        
        state.message = "Comment added successfully";
        state.success = true;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isActionLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Get Comments by Post ID
      .addCase(getCommentsByPostId.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getCommentsByPostId.fulfilled, (state, action) => {
        state.isLoading = false;
        const { postId, comments } = action.payload;
        state.comments[postId] = comments;
        state.success = true;
      })
      .addCase(getCommentsByPostId.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Delete Comment
      .addCase(deleteComment.pending, (state) => {
        state.isActionLoading = true;
        state.isError = false;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const { postId, commentId } = action.payload;
        
        // Remove from comments state
        if (state.comments[postId]) {
          state.comments[postId] = state.comments[postId].filter(
            comment => comment._id !== commentId
          );
        }
        
        // Remove from posts
        state.posts.forEach(post => {
          if (post._id === postId && Array.isArray(post.comments)) {
            post.comments = post.comments.filter(comment => 
              comment._id !== commentId
            );
          }
        });
        
        state.userPosts.forEach(post => {
          if (post._id === postId && Array.isArray(post.comments)) {
            post.comments = post.comments.filter(comment => 
              comment._id !== commentId
            );
          }
        });
        
        state.message = "Comment deleted successfully";
        state.success = true;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isActionLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { 
  reset, 
  resetPostState, 
  clearCurrentPost, 
  clearUserPosts, 
  updatePostInState, 
  removePostFromState,
  addCommentToState
} = postSlice.actions;

export default postSlice.reducer;