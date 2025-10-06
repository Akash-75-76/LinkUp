import DashboardLayout from "../../layout/Dashboardlayout/index";
import UserLayout from "@/layout/userLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, sendConnectionRequest, getSentConnectionRequests } from "@/config/redux/action/authAction";
import { useRouter } from "next/router";
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

    const isConnected = authState.connections?.some((connection) => {
      if (!connection.userId || !connection.connectionId) return false;
      
      const connectionUser =
        connection.userId._id === authState.user?._id
          ? connection.connectionId
          : connection.userId;
      return connectionUser?._id === user._id;
    });

    const hasIncomingRequest = authState.connectionRequests?.some(
      (request) => request.userId?._id === user._id
    );

    const hasOutgoingRequest = authState.sentConnectionRequests?.some(
      (request) => request.connectionId?._id === user._id
    );

    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());

    return !isConnected && !hasIncomingRequest && !hasOutgoingRequest && matchesSearch;
  }) || [];

  useEffect(() => {
    const fetchData = async () => {
      if (!hasFetchedUsers && authState.user?.token) {
        setIsLoading(true);
        try {
          await Promise.all([
            dispatch(getAllUsers()),
            dispatch(getSentConnectionRequests({ token: authState.user.token }))
          ]);
          setHasFetchedUsers(true);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [dispatch, hasFetchedUsers, authState.user]);

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
                        <span className={styles.statNumber}>0</span>
                        <span className={styles.statLabel}>Connections</span>
                      </div>
                      <div className={styles.stat}>
                        <ArticleIcon className={styles.statIcon} />
                        <span className={styles.statNumber}>0</span>
                        <span className={styles.statLabel}>Posts</span>
                      </div>
                    </div>

                    <div className={styles.userActions}>
                      <button
                        onClick={() => handleConnect(user._id)}
                        disabled={
                          connectionStatusMap[user._id] === "request_sent" ||
                          actionLoading[user._id]
                        }
                        className={`${styles.connectButton} ${
                          connectionStatusMap[user._id] === "request_sent"
                            ? styles.sent
                            : ""
                        } ${actionLoading[user._id] ? styles.loading : ''}`}
                      >
                        {actionLoading[user._id] ? (
                          <>
                            <span className={styles.buttonSpinner}></span>
                            Sending...
                          </>
                        ) : connectionStatusMap[user._id] === "request_sent" ? (
                          <>
                            <CheckIcon className={styles.buttonIcon} />
                            Request Sent
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