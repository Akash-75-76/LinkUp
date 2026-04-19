import DashboardLayout from "../../layout/Dashboardlayout/index";
import UserLayout from "@/layout/userLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, sendConnectionRequest, getSentConnectionRequests, whatAreMyConnections, getMyConnectionRequests } from "@/config/redux/action/authAction";
import { useRouter } from "next/router";
import { idEq } from "@/utils/id";
import styles from "./discover.module.css";

// Material-UI Icons
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import WarningIcon from "@mui/icons-material/Warning";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckIcon from "@mui/icons-material/Check";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import GroupIcon from "@mui/icons-material/Group";
import ArticleIcon from "@mui/icons-material/Article";
import CircleIcon from "@mui/icons-material/Circle";
import ScheduleIcon from "@mui/icons-material/Schedule";

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0wIDg1QzAgNzAuNjQgMTEuNjQgNTkgMjYgNTlINzRDODguMzYgNTkgMTAwIDcwLjY0IDEwMCA4NVYxMDBIMFY4NVoiIGZpbGw9IiM5QjlCOUIiLz4KPC9zdmc+";

function DiscoverPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const [hasFetchedUsers, setHasFetchedUsers] = useState(false);
  const [connectionStatusMap, setConnectionStatusMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = authState.all_users?.filter((user) => {
    if (user._id === authState.user?._id) {
      return false;
    }

    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  }) || [];

  const getConnectionState = (targetUserId) => {
    const selfId = authState.user?._id;
    // 1. Already connected (show Following)
    const isConnected = authState.connections?.some((connection) => {
      if (!connection.userId || !connection.connectionId) return false;
      const other =
        idEq(connection.userId._id || connection.userId, selfId)
          ? connection.connectionId
          : connection.userId;
      const oid = other?._id || other;
      return idEq(oid, targetUserId);
    });
    if (isConnected) return "following";

    // 2. Outgoing pending request
    if (connectionStatusMap[targetUserId] === "request_sent") return "pending";

    const hasOutgoingRequest = authState.sentConnectionRequests?.some((request) =>
      idEq(request.connectionId?._id || request.connectionId, targetUserId)
    );
    if (hasOutgoingRequest) return "pending";

    // 3. Incoming request (they asked you)
    const hasIncomingRequest = authState.connectionRequests?.some((request) =>
      idEq(request.userId?._id || request.userId, targetUserId)
    );
    if (hasIncomingRequest) return "respond";

    return "connect";
  };

  useEffect(() => {
    const fetchData = async () => {
      if (authState.user?.token) {
        // Always re-fetch connection state so accepted requests show correctly
        await Promise.all([
          dispatch(whatAreMyConnections({ token: authState.user.token })),
          dispatch(getSentConnectionRequests({ token: authState.user.token })),
          dispatch(getMyConnectionRequests({ token: authState.user.token })),
        ]);

        // Only fetch all users once
        if (!hasFetchedUsers) {
          setIsLoading(true);
          try {
            await dispatch(getAllUsers());
            setHasFetchedUsers(true);
          } catch (error) {
            console.error('Error fetching users:', error);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    fetchData();
  }, [dispatch, authState.user?.token]);

  const handleConnect = async (userId) => {
    if (authState.user?.token) {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      try {
        await dispatch(
          sendConnectionRequest({
            token: authState.user.token,
            connectionId: userId,
          })
        ).unwrap();
        
        await dispatch(getSentConnectionRequests({ token: authState.user.token }));
        
        setConnectionStatusMap((prev) => ({
          ...prev,
          [userId]: "request_sent",
        }));
      } catch (error) {
        if (error.message?.includes('already exists') || error?.includes('already exists')) {
          await dispatch(getSentConnectionRequests({ token: authState.user.token }));
        } else {
          alert(error.message || 'Failed to send connection request');
        }
      } finally {
        setActionLoading(prev => ({ ...prev, [userId]: false }));
      }
    }
  };

  const getProfileImageUrl = (profilePicture) => {
    if (profilePicture && profilePicture !== 'default.jpg') {
      return `https://linkup-o722.onrender.com/uploads/${profilePicture}`;
    }
    return DEFAULT_AVATAR;
  };

  if (isLoading && !hasFetchedUsers) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.container}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Discovering professionals...</p>
            </div>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1>Discover Professionals</h1>
              <p>Connect with like-minded professionals in your industry</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <SearchIcon className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className={styles.clearSearch}
                >
                  <ClearIcon className={styles.clearIcon} />
                </button>
              )}
            </div>
            <div className={styles.resultsInfo}>
              <span className={styles.resultsCount}>
                {filteredUsers.length} professionals found
              </span>
            </div>
          </div>

          {authState.isError ? (
            <div className={styles.error}>
              <WarningIcon className={styles.errorIcon} />
              <div className={styles.errorContent}>
                <h3>Error loading users</h3>
                <p>{authState.message}</p>
              </div>
              <button 
                onClick={() => setHasFetchedUsers(false)}
                className={styles.retryButton}
              >
                <RefreshIcon className={styles.buttonIcon} />
                Try Again
              </button>
            </div>
          ) : (
            <div className={styles.usersGrid}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user._id} className={styles.userCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.userAvatar}>
                        <img
                          src={getProfileImageUrl(user.profilePicture)}
                          alt={user.name}
                          className={styles.avatarImage}
                          onError={(e) => {
                            e.target.src = DEFAULT_AVATAR;
                          }}
                        />
                        <CircleIcon className={styles.onlineIndicator} />
                      </div>
                      <div className={styles.userInfo}>
                        <h3 className={styles.userName}>{user.name || 'Unknown User'}</h3>
                        <p className={styles.userEmail}>{user.email}</p>
                        <p className={styles.userUsername}>@{user.username || 'unknown'}</p>
                      </div>
                    </div>

                    <div className={styles.userStats}>
                      <div className={styles.stat}>
                        <GroupIcon className={styles.statIcon} />
                        <span className={styles.statNumber}>{user.followersCount || 0}</span>
                        <span className={styles.statLabel}>Followers</span>
                      </div>
                      <div className={styles.stat}>
                        <ArticleIcon className={styles.statIcon} />
                        <span className={styles.statNumber}>{user.postsCount || 0}</span>
                        <span className={styles.statLabel}>Posts</span>
                      </div>
                    </div>

                    <div className={styles.userActions}>
                      <button
                        onClick={() => {
                          if (getConnectionState(user._id) === "connect") {
                            handleConnect(user._id);
                          } else if (getConnectionState(user._id) === "respond") {
                            router.push('/myConnections');
                          }
                        }}
                        disabled={
                          ["pending", "following"].includes(getConnectionState(user._id)) ||
                          actionLoading[user._id]
                        }
                        className={`${styles.connectButton} ${
                          ["pending", "following"].includes(getConnectionState(user._id))
                            ? styles.sent
                            : ""
                        } ${actionLoading[user._id] ? styles.loading : ''}`}
                      >
                        {actionLoading[user._id] ? (
                          <>
                            <span className={styles.buttonSpinner}></span>
                            Sending...
                          </>
                        ) : getConnectionState(user._id) === "pending" ? (
                          <>
                            <ScheduleIcon className={styles.buttonIcon} />
                            Pending
                          </>
                        ) : getConnectionState(user._id) === "following" ? (
                          <>
                            <CheckIcon className={styles.buttonIcon} />
                            Following
                          </>
                        ) : getConnectionState(user._id) === "respond" ? (
                          <>
                            <GroupIcon className={styles.buttonIcon} />
                            Respond
                          </>
                        ) : (
                          <>
                            <PersonAddIcon className={styles.buttonIcon} />
                            Connect
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => router.push(`/profile/${user._id}`)}
                        className={styles.viewProfileButton}
                      >
                        <VisibilityIcon className={styles.buttonIcon} />
                        View Profile
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noUsers}>
                  <SearchIcon className={styles.noUsersIcon} />
                  <h3>No professionals found</h3>
                  <p>
                    {searchTerm 
                      ? "No users match your search criteria. Try different keywords."
                      : "No new users to discover right now. Check back later!"
                    }
                  </p>
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm("")}
                      className={styles.clearSearchButton}
                    >
                      <ClearIcon className={styles.buttonIcon} />
                      Clear Search
                    </button>
                  )}
                  <button 
                    onClick={() => setHasFetchedUsers(false)}
                    className={styles.refreshButton}
                  >
                    <RefreshIcon className={styles.buttonIcon} />
                    Refresh Results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export default DiscoverPage;