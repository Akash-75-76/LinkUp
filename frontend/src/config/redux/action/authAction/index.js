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
      console.log("Register request payload:", user);
      const response = await clientServer.post('/users/register', {
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });
      console.log("Register response:", response.data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data; // ✅ Return full response data instead of just token
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