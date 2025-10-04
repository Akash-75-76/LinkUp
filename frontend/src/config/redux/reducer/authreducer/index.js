import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  getUserAndProfile,
  getAllUsers,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getMyConnectionRequests,
  whatAreMyConnections,
  getSentConnectionRequests
} from "../../action/authAction/index";

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  isTokenThere: false,
  profileFetched: false,
  connections: [],
  connectionRequests: [],
  sentConnectionRequests: [],
  all_users: [],
  all_profiles_fetching: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    handleLoginUser: (state) => {
      state.message = "";
    },
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.loggedIn = false;
      state.profileFetched = false;
      state.isTokenThere = false; // ✅ Reset token state on logout
    },
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking the door...";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.isTokenThere = true; // ✅ Set token state on login
        state.message = "Welcome back!";
        state.user = action.payload.user || state.user; // ✅ Handle user data properly
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.isTokenThere = false;
        state.message = action.payload || "Something went wrong";
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Creating your account...";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.isTokenThere = true; // ✅ Set token state on register
        state.message = "Account created successfully!";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.isTokenThere = false;
        state.message = action.payload || "Something went wrong";
      })

      // Get User + Profile
      .addCase(getUserAndProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserAndProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.loggedIn = true;
        state.isTokenThere = true;
        state.user = action.payload.user;
        state.message = "User profile fetched successfully";
      })
      .addCase(getUserAndProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.loggedIn = false;
        state.isTokenThere = false;
        state.message = action.payload || "Failed to fetch profile";
      })

      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.all_profiles_fetching = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.all_profiles_fetching = false;
        state.all_users = action.payload;
        state.isError = false;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.all_profiles_fetching = false;
        state.isError = true;
        state.message = action.payload || "Failed to fetch users";
      })

      // Get My Connection Requests
      .addCase(getMyConnectionRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyConnectionRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connectionRequests = action.payload;
        state.isError = false;
      })
      .addCase(getMyConnectionRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to fetch connection requests";
      })

      // Get My Connections
      .addCase(whatAreMyConnections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(whatAreMyConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections = action.payload;
        state.isError = false;
      })
      .addCase(whatAreMyConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to fetch connections";
      })

      // Get Sent Connection Requests
      .addCase(getSentConnectionRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSentConnectionRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sentConnectionRequests = action.payload;
        state.isError = false;
      })
      .addCase(getSentConnectionRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to fetch sent requests";
      })

      // Accept Connection Request
      .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
        state.connectionRequests = state.connectionRequests.filter(
          request => request._id !== action.payload.requestId
        );
        state.message = action.payload.message;
      })
      .addCase(acceptConnectionRequest.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload || "Failed to accept connection";
      })

      // Reject Connection Request
      .addCase(rejectConnectionRequest.fulfilled, (state, action) => {
        state.connectionRequests = state.connectionRequests.filter(
          request => request._id !== action.payload.requestId
        );
        state.message = action.payload.message;
      })
      .addCase(rejectConnectionRequest.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload || "Failed to reject connection";
      })

      // Remove Connection
      .addCase(removeConnection.fulfilled, (state, action) => {
        state.connections = state.connections.filter(
          conn => conn.userId._id !== action.payload.connectionId && 
                  conn.connectionId._id !== action.payload.connectionId
        );
        state.message = action.payload.message;
      })
      .addCase(removeConnection.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload || "Failed to remove connection";
      })

      // Send Connection Request
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload || "Failed to send connection request";
      });
  },
});

export const { reset, handleLoginUser, logout, setTokenIsNotThere, setTokenIsThere } = authSlice.actions;
export default authSlice.reducer;