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
        state.posts[index] = updatedPost;
      }
      
      const userIndex = state.userPosts.findIndex(post => post._id === updatedPost._id);
      if (userIndex !== -1) {
        state.userPosts[userIndex] = updatedPost;
      }
    },
    removePostFromState: (state, action) => {
      const postId = action.payload;
      state.posts = state.posts.filter(post => post._id !== postId);
      state.userPosts = state.userPosts.filter(post => post._id !== postId);
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
        state.isLoading = true;
        state.isError = false;
        state.message = "Creating post...";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload.post);
        state.userPosts.unshift(action.payload.post);
        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "Deleting post...";
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        const { postId } = action.payload;
        state.posts = state.posts.filter(post => post._id !== postId);
        state.userPosts = state.userPosts.filter(post => post._id !== postId);
        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Like Post - FIXED VERSION
      .addCase(likePost.pending, (state) => {
        state.isLoading = true;
      })
    // Like Post - FIXED VERSION
.addCase(likePost.fulfilled, (state, action) => {
  state.isLoading = false;
  const { postId, liked, likeCount, userId } = action.payload; // ✅ Get userId from payload
  
  // Update posts array
  const postIndex = state.posts.findIndex(post => post._id === postId);
  if (postIndex !== -1) {
    if (liked) {
      // Add user to likes if not already there
      if (!state.posts[postIndex].likes.some(like => like.toString() === userId.toString())) {
        state.posts[postIndex].likes.push(userId);
      }
    } else {
      // Remove user from likes
      state.posts[postIndex].likes = state.posts[postIndex].likes.filter(
        like => like.toString() !== userId.toString()
      );
    }
  }
  
  // Also update in userPosts array
  const userPostIndex = state.userPosts.findIndex(post => post._id === postId);
  if (userPostIndex !== -1) {
    if (liked) {
      if (!state.userPosts[userPostIndex].likes.some(like => like.toString() === userId.toString())) {
        state.userPosts[userPostIndex].likes.push(userId);
      }
    } else {
      state.userPosts[userPostIndex].likes = state.userPosts[userPostIndex].likes.filter(
        like => like.toString() !== userId.toString()
      );
    }
  }
  
  state.success = true;
  state.message = action.payload.message;
})
      .addCase(addComment.rejected, (state, action) => {
        state.isLoading = false;
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
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false;
        const { postId, commentId } = action.payload;
        
        // Remove comment from comments state
        if (state.comments[postId]) {
          state.comments[postId] = state.comments[postId].filter(
            comment => comment._id !== commentId
          );
        }
        
        state.message = "Comment deleted successfully";
        state.success = true;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false;
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
  removePostFromState 
} = postSlice.actions;

export default postSlice.reducer;