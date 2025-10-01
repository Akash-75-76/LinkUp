import  {clientServer} from '@/config';
import { createAsyncThunk } from '@reduxjs/toolkit';


export const loginUser = createAsyncThunk(
  'user/login',
  async (user, thunkAPI) => {
    try {
      console.log("Login request payload:", user); // 🚀 log request
      const response = await clientServer.post('/users/login', {
  email: user.email,
  password: user.password,
});
      console.log("Login response:", response.data); // 🚀 log response
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        return thunkAPI.rejectWithValue("Token not found");
      }
      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message); // 🚀 log error
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (user, thunkAPI) => {
    try {
      console.log("Register request payload:", user); // 🚀 log request
      const response = await clientServer.post('/users/register', {
  username: user.username,
  password: user.password,
  email: user.email,
  name: user.name,
});
      console.log("Register response:", response.data); // 🚀 log response
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message); // 🚀 log error
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
