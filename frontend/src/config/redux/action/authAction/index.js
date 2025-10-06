import { clientServer } from '@/config';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
  'user/login',
  async (user, thunkAPI) => {
    try {
      console.log("Login request payload:", user);
      const response = await clientServer.post('/users/login', {
        email: user.email,
        password: user.password,
      });
      console.log("Login response:", response.data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        return thunkAPI.rejectWithValue("Token not found");
      }
      return response.data; // ✅ Return full response data instead of just token
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (user, thunkAPI) => {
    try {
      console.log("=== AUTH ACTION DEBUG: DATA RECEIVED ===");
      console.log("User object received:", {
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        currentPost: user.currentPost,
        profilePicture: user.profilePicture ? "File present" : "No file",
        education: user.education,
        pastWork: user.pastWork
      });
      console.log("=== END AUTH ACTION DEBUG ===");
      
      // ✅ SIMPLIFIED: Use regular JSON for now, we'll add file upload separately
      const response = await clientServer.post('/users/register', {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        bio: user.bio || "",
        currentPost: user.currentPost || "",
        education: user.education || [],
        pastWork: user.pastWork || []
        // We'll handle profile picture separately after registration
      });
      
      console.log("Register API response:", response.data);
      
      // ✅ NEW: If we have a profile picture, upload it separately after registration
      if (user.profilePicture && response.data.token) {
        console.log("Uploading profile picture separately...");
        try {
          const profileFormData = new FormData();
          profileFormData.append('profile_pic', user.profilePicture);
          profileFormData.append('token', response.data.token);
          
          await clientServer.post('/users/update_profile_pic', profileFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log("Profile picture uploaded successfully");
        } catch (uploadError) {
          console.error("Profile picture upload failed:", uploadError);
          // Continue without profile picture - it's optional
        }
      }
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const getUserAndProfile = createAsyncThunk(
  'user/getUserAndProfile',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await clientServer.get('/users/getUserAndProfile', {
        params: { token },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/users/all");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Connection Request Actions
export const sendConnectionRequest = createAsyncThunk(
  'user/sendConnectionRequest',
  async ({ token, connectionId }, { rejectWithValue }) => {
    try {
      const response = await clientServer.post('/users/send_connection_request', {
        token,
        connectionId
      });
      return { connectionId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const acceptConnectionRequest = createAsyncThunk(
  'user/acceptConnectionRequest',
  async ({ token, requestId }, { rejectWithValue }) => {
    try {
      const response = await clientServer.post('/users/accept_connection', {
        token,
        requestId
      });
      return { requestId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const rejectConnectionRequest = createAsyncThunk(
  'user/rejectConnectionRequest',
  async ({ token, requestId }, { rejectWithValue }) => {
    try {
      const response = await clientServer.post('/users/reject_connection', {
        token,
        requestId
      });
      return { requestId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeConnection = createAsyncThunk(
  'user/removeConnection',
  async ({ token, connectionId }, { rejectWithValue }) => {
    try {
      const response = await clientServer.post('/users/remove_connection', {
        token,
        connectionId
      });
      return { connectionId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMyConnectionRequests = createAsyncThunk(
  'user/getMyConnectionRequests',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await clientServer.get('/users/my_connection_requests', {
        params: { token }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const whatAreMyConnections = createAsyncThunk(
  'user/whatAreMyConnections',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await clientServer.get('/users/my_connections', {
        params: { token }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getSentConnectionRequests = createAsyncThunk(
  'user/getSentConnectionRequests',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await clientServer.get('/users/sent_connection_requests', {
        params: { token }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);