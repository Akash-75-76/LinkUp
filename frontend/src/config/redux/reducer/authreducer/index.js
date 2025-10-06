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
      return initialState;
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
    },
    // Add these new reducers for manual state updates
    addConnectionRequest: (state, action) => {
      state.connectionRequests.push(action.payload);
    },
    addSentConnectionRequest: (state, action) => {
      state.sentConnectionRequests.push(action.payload);
    },
    addConnection: (state, action) => {
      state.connections.push(action.payload);
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
        state.isTokenThere = true;
        state.message = "Welcome back!";
        
        state.user = {
          ...action.payload.user,
          token: action.payload.token
        };
        
        console.log('Login successful, user:', state.user);
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
        state.isTokenThere = true;
        state.message = "Account created successfully!";
        
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
        state.all_users = action.payload || [];
        state.isError = false;
        console.log('All users loaded:', state.all_users.length);
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.all_profiles_fetching = false;
        state.isError = true;
        state.message = action.payload?.message || "Failed to fetch users";
      })

      // Get My Connection Requests - FIXED: Add proper state handling
      .addCase(getMyConnectionRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyConnectionRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connectionRequests = action.payload || [];
        state.isError = false;
        console.log('Connection requests loaded:', state.connectionRequests.length);
        console.log('Connection requests data:', state.connectionRequests);
      })
      .addCase(getMyConnectionRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.connectionRequests = [];
        state.message = action.payload?.message || "Failed to fetch connection requests";
        console.error('Failed to fetch connection requests:', action.payload);
      })

      // Get My Connections - FIXED: Add proper state handling
      .addCase(whatAreMyConnections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(whatAreMyConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections = action.payload || [];
        state.isError = false;
        console.log('Connections loaded:', state.connections.length);
        console.log('Connections data:', state.connections);
      })
      .addCase(whatAreMyConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.connections = [];
        state.message = action.payload?.message || "Failed to fetch connections";
        console.error('Failed to fetch connections:', action.payload);
      })

      // Get Sent Connection Requests - FIXED: Add proper state handling
      .addCase(getSentConnectionRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSentConnectionRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sentConnectionRequests = action.payload || [];
        state.isError = false;
        console.log('Sent connection requests loaded:', state.sentConnectionRequests.length);
        console.log('Sent connection requests data:', state.sentConnectionRequests);
      })
      .addCase(getSentConnectionRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.sentConnectionRequests = [];
        state.message = action.payload?.message || "Failed to fetch sent requests";
        console.error('Failed to fetch sent requests:', action.payload);
      })

      // Accept Connection Request - FIXED: Add the new connection to connections array
      .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
        // Remove from connection requests
        state.connectionRequests = state.connectionRequests.filter(
          request => request._id !== action.payload.requestId
        );
        
        // Add to connections if the backend returns the connection data
        if (action.payload.connection) {
          state.connections.push(action.payload.connection);
        }
        
        state.message = action.payload.message;
        console.log('Connection request accepted, removed from requests');
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
        console.log('Connection request rejected, removed from requests');
      })
      .addCase(rejectConnectionRequest.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload?.message || "Failed to reject connection";
      })

      // Remove Connection - FIXED: Better filtering logic
      .addCase(removeConnection.fulfilled, (state, action) => {
        state.connections = state.connections.filter(conn => {
          // Check both userId and connectionId with safe access
          const userId = conn.userId?._id || conn.userId;
          const connectionId = conn.connectionId?._id || conn.connectionId;
          return userId !== action.payload.connectionId && connectionId !== action.payload.connectionId;
        });
        state.message = action.payload.message;
        console.log('Connection removed, remaining:', state.connections.length);
      })
      .addCase(removeConnection.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload?.message || "Failed to remove connection";
      })

      // Send Connection Request - FIXED: Add to sentConnectionRequests
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.message = action.payload.message;
        
        // If we have the request data, add it to sent requests
        if (action.payload.request) {
          state.sentConnectionRequests.push(action.payload.request);
        }
        
        console.log('Connection request sent successfully');
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload?.message || "Failed to send connection request";
        console.error('Send connection request failed:', action.payload);
      });
  },
});

export const { 
  reset, 
  handleLoginUser, 
  logout, 
  setTokenIsNotThere, 
  setTokenIsThere,
  updateUserData,
  addConnectionRequest,
  addSentConnectionRequest,
  addConnection
} = authSlice.actions;
export default authSlice.reducer;