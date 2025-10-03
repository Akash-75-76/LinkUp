import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  getUserAndProfile,
  getAllUsers
} from "../../action/authAction/index";

const initialState = {
  user: null,              // 👈 should be object, not []
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  isTokenThere:false,
  profileFetched: false,
  connections: [],
  connectionRequests: [],
  all_users:[],
  all_profiles_fetching:false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    handleLoginUser: (state) => {
      state.message = "";
    },
    logout: (state) => {     // 👈 add logout reducer
      localStorage.removeItem("token");
      state.user = null;
      state.loggedIn = false;
      state.profileFetched = false;
    },
    setTokenIsThere:(state)=>{
      state.isTokenThere=true
    },
    setTokenIsNotThere:(state)=>{
      state.isTokenThere=false
    }
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking the door...";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.message = "Welcome back!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.message = action.payload || "Something went wrong";
      })

      // 🔹 Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Creating your account...";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.message = "Account created successfully!";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.message = action.payload || "Something went wrong";
      })

      // 🔹 Get User + Profile
      .addCase(getUserAndProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserAndProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.loggedIn = true;                 // 👈 set loggedIn true after fetch
        state.user = action.payload.user;      // ✅ store user info
        state.message = "User profile fetched successfully";
      })
      .addCase(getUserAndProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.loggedIn = false;
        state.message = action.payload || "Failed to fetch profile";
      })
       // 🔹 Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.all_profiles_fetching = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.all_profiles_fetching = false;
        state.all_users = action.payload; // Store all users
        state.isError = false;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.all_profiles_fetching = false;
        state.isError = true;
        state.message = action.payload || "Failed to fetch users";
      });

      

  },
});

export const { reset, handleLoginUser, logout,setTokenIsNotThere,setTokenIsThere } = authSlice.actions;
export default authSlice.reducer;
