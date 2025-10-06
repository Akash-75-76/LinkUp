import DashboardLayout from '../../layout/Dashboardlayout/index'
import UserLayout from '@/layout/userLayout'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  getMyConnectionRequests, 
  whatAreMyConnections,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getSentConnectionRequests
} from '@/config/redux/action/authAction'
import styles from "./myConnections.module.css"
import { useRouter } from 'next/router'

// Material-UI Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import PeopleIcon from '@mui/icons-material/People';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CircleIcon from '@mui/icons-material/Circle';
import PersonIcon from '@mui/icons-material/Person';

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0wIDg1QzAgNzAuNjQgMTEuNjQgNTkgMjYgNTlINzRDODguMzYgNTkgMTAwIDcwLjY0IDEwMCA4NVYxMDBIMFY4NVoiIGZpbGw9IiM5QjlCOUIiLz4KPC9zdmc+";

function MyConnectionsPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const authState = useSelector((state) => state.auth)
  const { user } = authState
  const [hasFetchedConnections, setHasFetchedConnections] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('requests')

  useEffect(() => {
    const fetchConnections = async () => {
      if (user?.token && !hasFetchedConnections) {
        setIsLoading(true);
        try {
          await Promise.all([
            dispatch(getMyConnectionRequests({ token: user.token })),
            dispatch(whatAreMyConnections({ token: user.token })),
            dispatch(getSentConnectionRequests({ token: user.token }))
          ]);
          setHasFetchedConnections(true);
        } catch (error) {
          console.error('Error fetching connections:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchConnections();
  }, [dispatch, user, hasFetchedConnections]);

  const handleAcceptRequest = async (requestId) => {
    if (user?.token) {
      try {
        await dispatch(acceptConnectionRequest({ token: user.token, requestId })).unwrap();
        setTimeout(() => {
          dispatch(getMyConnectionRequests({ token: user.token }));
          dispatch(whatAreMyConnections({ token: user.token }));
        }, 500);
      } catch (error) {
        console.error('Error accepting request:', error);
        alert('Failed to accept connection request: ' + (error.message || error));
      }
    }
  }

  const handleRejectRequest = async (requestId) => {
    if (user?.token) {
      try {
        await dispatch(rejectConnectionRequest({ token: user.token, requestId })).unwrap();
        setTimeout(() => {
          dispatch(getMyConnectionRequests({ token: user.token }));
        }, 500);
      } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Failed to reject connection request: ' + (error.message || error));
      }
    }
  }

  const handleRemoveConnection = async (connectionId) => {
    if (user?.token) {
      try {
        await dispatch(removeConnection({ token: user.token, connectionId })).unwrap();
        setTimeout(() => {
          dispatch(whatAreMyConnections({ token: user.token }));
        }, 500);
      } catch (error) {
        console.error('Error removing connection:', error);
        alert('Failed to remove connection: ' + (error.message || error));
      }
    }
  }

  const getConnectionUser = (connection) => {
    if (!connection) return null;
    
    try {
      if (connection.userId && connection.userId._id === user?._id) {
        return connection.connectionId;
      } else if (connection.connectionId && connection.connectionId._id === user?._id) {
        return connection.userId;
      }
      
      if (connection.userId && connection.connectionId) {
        return connection.userId._id === user?._id ? connection.connectionId : connection.userId;
      }
      
      return connection.userId || connection.connectionId;
    } catch (error) {
      console.error('Error getting connection user:', error, connection);
      return null;
    }
  }

  const getProfileImageUrl = (profilePicture) => {
    if (profilePicture && profilePicture !== 'default.jpg') {
      return `http://localhost:5000/uploads/${profilePicture}`;
    }
    return DEFAULT_AVATAR;
  }

  const refreshAllData = () => {
    if (user?.token) {
      setHasFetchedConnections(false);
      setIsLoading(true);
      Promise.all([
        dispatch(getMyConnectionRequests({ token: user.token })),
        dispatch(whatAreMyConnections({ token: user.token })),
        dispatch(getSentConnectionRequests({ token: user.token }))
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }

  if (isLoading) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.container}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading your network...</p>
              <button onClick={refreshAllData} className={styles.refreshButton}>
                <RefreshIcon className={styles.buttonIcon} />
                Refresh Data
              </button>
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
              <h1>My Network</h1>
              <p>Manage your professional connections and requests</p>
            </div>
            <button onClick={refreshAllData} className={styles.refreshButton}>
              <RefreshIcon className={styles.refreshIcon} />
              Refresh
            </button>
          </div>

          {/* Tab Navigation */}
          <div className={styles.tabNavigation}>
            <button 
              className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <EmailIcon className={styles.tabIcon} />
              Connection Requests
              <span className={styles.tabBadge}>
                {authState.connectionRequests?.length || 0}
              </span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'connections' ? styles.active : ''}`}
              onClick={() => setActiveTab('connections')}
            >
              <PeopleIcon className={styles.tabIcon} />
              My Connections
              <span className={styles.tabBadge}>
                {authState.connections?.length || 0}
              </span>
            </button>
          </div>

          {/* Connection Requests Section */}
          {activeTab === 'requests' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Connection Requests</h2>
                <span className={styles.sectionCount}>
                  {authState.connectionRequests?.length || 0} pending
                </span>
              </div>
              
              {authState.connectionRequests?.length > 0 ? (
                <div className={styles.requestsGrid}>
                  {authState.connectionRequests.map((request) => {
                    if (!request.userId) return null;
                    
                    return (
                      <div key={request._id} className={styles.requestCard}>
                        <div className={styles.userInfo}>
                          <div className={styles.avatarContainer}>
                            <img 
                              src={getProfileImageUrl(request.userId.profilePicture)}
                              alt={request.userId.name}
                              className={styles.avatar}
                              onError={(e) => {
                                e.target.src = DEFAULT_AVATAR;
                              }}
                            />
                            <CircleIcon className={styles.onlineIndicator} />
                          </div>
                          <div className={styles.userDetails}>
                            <h4 className={styles.userName}>{request.userId.name || 'Unknown User'}</h4>
                            <p className={styles.userTitle}>@{request.userId.username || 'unknown'}</p>
                            <p className={styles.userEmail}>{request.userId.email}</p>
                            <p className={styles.requestTime}>
                              Requested {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={styles.requestActions}>
                          <button 
                            onClick={() => handleAcceptRequest(request._id)}
                            className={styles.acceptBtn}
                            title="Accept connection request"
                          >
                            <CheckIcon className={styles.buttonIcon} />
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(request._id)}
                            className={styles.rejectBtn}
                            title="Reject connection request"
                          >
                            <CloseIcon className={styles.buttonIcon} />
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <EmailIcon className={styles.emptyIcon} />
                  <h3>No pending requests</h3>
                  <p className={styles.emptySubtext}>
                    When someone sends you a connection request, it will appear here.
                  </p>
                  <button 
                    onClick={() => router.push('/discover')}
                    className={styles.discoverButton}
                  >
                    <SearchIcon className={styles.buttonIcon} />
                    Discover People
                  </button>
                </div>
              )}
            </div>
          )}

          {/* My Connections Section */}
          {activeTab === 'connections' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>My Connections</h2>
                <span className={styles.sectionCount}>
                  {authState.connections?.length || 0} total
                </span>
              </div>
              
              {authState.connections?.length > 0 ? (
                <div className={styles.connectionsGrid}>
                  {authState.connections.map((connection) => {
                    const connectionUser = getConnectionUser(connection);
                    if (!connectionUser) return null;

                    return (
                      <div key={connection._id} className={styles.connectionCard}>
                        <div className={styles.userInfo}>
                          <div className={styles.avatarContainer}>
                            <img 
                              src={getProfileImageUrl(connectionUser.profilePicture)}
                              alt={connectionUser.name}
                              className={styles.avatar}
                              onError={(e) => {
                                e.target.src = DEFAULT_AVATAR;
                              }}
                            />
                            <CircleIcon className={styles.onlineIndicator} />
                          </div>
                          <div className={styles.userDetails}>
                            <h4 className={styles.userName}>{connectionUser.name || 'Unknown User'}</h4>
                            <p className={styles.userTitle}>@{connectionUser.username || 'unknown'}</p>
                            <p className={styles.userEmail}>{connectionUser.email}</p>
                            <p className={styles.connectedSince}>
                              Connected since {new Date(connection.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={styles.connectionActions}>
  <button 
    onClick={() => router.push(`/profile/${connectionUser._id}`)}
    className={styles.viewProfileBtn}
    title="View full profile"
  >
    <VisibilityIcon className={styles.buttonIcon} />
    View Profile
  </button>
  <button 
    onClick={() => {
      // This will be implemented to open chat with this connection
      // We'll add this functionality after setting up the chat widget
      alert(`Open chat with ${connectionUser.name}`);
    }}
    className={styles.messageBtn}
    title="Send message"
  >
    <EmailIcon className={styles.buttonIcon} />
    Message
  </button>
  <button 
    onClick={() => handleRemoveConnection(connectionUser._id)}
    className={styles.removeBtn}
    title="Remove connection"
  >
    <DeleteIcon className={styles.buttonIcon} />
    Remove
  </button>
</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <PeopleIcon className={styles.emptyIcon} />
                  <h3>No connections yet</h3>
                  <p className={styles.emptySubtext}>
                    Start connecting with people to build your professional network!
                  </p>
                  <button 
                    onClick={() => router.push('/discover')}
                    className={styles.discoverButton}
                  >
                    <SearchIcon className={styles.buttonIcon} />
                    Discover People
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  )
}

export default MyConnectionsPage