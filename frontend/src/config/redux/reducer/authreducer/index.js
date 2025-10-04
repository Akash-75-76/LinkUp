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
      return initialState; // Complete reset on logout
    },
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login - FIXED: Properly handle user data
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking the door...";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.isTokenThere = true;
        state.message = "Welcome back!";
        
        // FIX: Properly merge user data with token
        state.user = {
          ...action.payload.user,
          token: action.payload.token
        };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.isTokenThere = false;
        state.user = null;
        state.message = action.payload?.message || "Something went wrong";
      })

      // Register - FIXED: Handle user data properly
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Creating your account...";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.isTokenThere = true;
        state.message = "Account created successfully!";
        
        // FIX: Set user data after registration
        state.user = {
          ...action.payload.user,
          token: action.payload.token
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.isTokenThere = false;
        state.user = null;
        state.message = action.payload?.message || "Something went wrong";
      })

      // Get User + Profile - FIXED: Handle user data properly
      .addCase(getUserAndProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserAndProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.loggedIn = true;
        state.isTokenThere = true;
        
        // FIX: Merge user data properly
        if (action.payload.user) {
          state.user = {
            ...state.user,
            ...action.payload.user
          };
        }
        state.message = "User profile fetched successfully";
      })
      .addCase(getUserAndProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.loggedIn = false;
        state.isTokenThere = false;
        state.profileFetched = false;
        state.message = action.payload?.message || "Failed to fetch profile";
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
        state.message = action.payload?.message || "Failed to fetch users";
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
        state.message = action.payload?.message || "Failed to fetch connection requests";
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
        state.message = action.payload?.message || "Failed to fetch connections";
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
        state.message = action.payload?.message || "Failed to fetch sent requests";
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
        state.message = action.payload?.message || "Failed to accept connection";
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
        state.message = action.payload?.message || "Failed to reject connection";
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
        state.message = action.payload?.message || "Failed to remove connection";
      })

      // Send Connection Request
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload?.message || "Failed to send connection request";
      });
  },
});

export const { 
  reset, 
  handleLoginUser, 
  logout, 
  setTokenIsNotThere, 
  setTokenIsThere,
  updateUserData 
} = authSlice.actions;
export default authSlice.reducer;