import  {clientServer} from '@/config';
import { createAsyncThunk } from '@reduxjs/toolkit';


// Get all posts
export const getAllPosts = createAsyncThunk(
  'post/getAllPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clientServer.get('/posts/all_posts');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch posts'
      );
    }
  }
);

// Get user posts
export const getUserPosts = createAsyncThunk(
  'post/getUserPosts',
  async (token, { rejectWithValue }) => {
    try {
      const response = await clientServer.get('/posts/user_posts', {
        params: { token }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user posts'
      );
    }
  }
);

// Create post
export const createPost = createAsyncThunk(
  'post/createPost',
  async ({ token, body, media }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('body', body);
      if (media) {
        formData.append('media', media);
      }

      const response = await clientServer.post('/posts/create_post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create post'
      );
    }
  }
);

// Delete post
export const deletePost = createAsyncThunk(
  'post/deletePost',
  async ({ token, postId }, { rejectWithValue }) => {
    try {
      const response = await clientServer.delete('/posts/delete_post', {
        data: { token, postId }
      });
      return { postId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete post'
      );
    }
  }
);

// Like/Unlike post
export const likePost = createAsyncThunk(
  'post/likePost',
  async ({ token, postId }, { rejectWithValue }) => {
    try {
      const response = await clientServer.post('/posts/like', { token, postId });
      return { 
        postId, 
        liked: response.data.liked,
        likeCount: response.data.likeCount,
        message: response.data.message
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to like post'
      );
    }
  }
);

// Add comment
export const addComment = createAsyncThunk(
  'post/addComment',
  async ({ token, postId, comment }, { rejectWithValue }) => {
    try {
      const response = await clientServer.post('/posts/comment', {
        token,
        postId,
        comment
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add comment'
      );
    }
  }
);

// Get comments by post ID
export const getCommentsByPostId = createAsyncThunk(
  'post/getCommentsByPostId',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await clientServer.get(`/posts/comments/${postId}`);
      return { postId, comments: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch comments'
      );
    }
  }
);

// Delete comment
export const deleteComment = createAsyncThunk(
  'post/deleteComment',
  async ({ token, postId, commentId }, { rejectWithValue }) => {
    try {
      const response = await clientServer.delete('/posts/delete_comment', {
        data: { token, postId, commentId }
      });
      return { postId, commentId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete comment'
      );
    }
  }
);