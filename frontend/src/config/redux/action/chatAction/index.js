import { clientServer } from '@/config';
import { createAsyncThunk } from '@reduxjs/toolkit';

// Send text message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ token, receiverId, message }, { rejectWithValue }) => {
    try {
      const response = await clientServer.post('/chat/send_message', { // Changed from '/api/chat/send_message'
        token,
        receiverId,
        message
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send message'
      );
    }
  }
);

// Send image message
export const sendImageMessage = createAsyncThunk(
  'chat/sendImageMessage',
  async ({ token, receiverId, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('receiverId', receiverId);
      formData.append('image', image);

      const response = await clientServer.post('/chat/send_image', formData, { // Changed from '/api/chat/send_image'
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send image'
      );
    }
  }
);

// Get chat history with a user
export const getChatHistory = createAsyncThunk(
  'chat/getChatHistory',
  async ({ token, otherUserId }, { rejectWithValue }) => {
    try {
      const response = await clientServer.get('/chat/chat_history', { // Changed from '/api/chat/chat_history'
        params: { token, otherUserId }
      });
      return { otherUserId, messages: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch chat history'
      );
    }
  }
);

// Get all chat rooms (conversations)
export const getChatRooms = createAsyncThunk(
  'chat/getChatRooms',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await clientServer.get('/chat/chat_rooms', { // Changed from '/api/chat/chat_rooms'
        params: { token }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch chat rooms'
      );
    }
  }
);

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async ({ token, senderId }, { rejectWithValue }) => {
    try {
      const response = await clientServer.post('/chat/mark_as_read', { // Changed from '/api/chat/mark_as_read'
        token,
        senderId
      });
      return { senderId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark messages as read'
      );
    }
  }
);

// Get unread message count
export const getUnreadCount = createAsyncThunk(
  'chat/getUnreadCount',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await clientServer.get('/chat/unread_count', { // Changed from '/api/chat/unread_count'
        params: { token }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch unread count'
      );
    }
  }
);