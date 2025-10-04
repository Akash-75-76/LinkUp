import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/userLayout'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  getMyConnectionRequests, 
  whatAreMyConnections,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection
} from '@/config/redux/action/authAction'
import styles from "./myConnections.module.css"

function MyConnectionsPage() {
  const dispatch = useDispatch()
  const authState = useSelector((state) => state.auth)
  const { user } = authState
  const [hasFetchedConnections, setHasFetchedConnections] = useState(false) // ✅ Add state to prevent infinite fetches

  useEffect(() => {
    if (user?.token && !hasFetchedConnections) { // ✅ Only fetch if not already fetched
      dispatch(getMyConnectionRequests({ token: user.token }))
      dispatch(whatAreMyConnections({ token: user.token }))
      setHasFetchedConnections(true)
    }
  }, [dispatch, user, hasFetchedConnections]) // ✅ Add dependency

  const handleAcceptRequest = (requestId) => {
    if (user?.token) {
      dispatch(acceptConnectionRequest({ token: user.token, requestId }))
    }
  }

  const handleRejectRequest = (requestId) => {
    if (user?.token) {
      dispatch(rejectConnectionRequest({ token: user.token, requestId }))
    }
  }

  const handleRemoveConnection = (connectionId) => {
    if (user?.token) {
      dispatch(removeConnection({ token: user.token, connectionId }))
    }
  }

  const getConnectionUser = (connection) => {
    return connection.userId._id === user?._id ? connection.connectionId : connection.userId
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <h1>My Connections</h1>
          
          {/* Connection Requests */}
          <div className={styles.section}>
            <h2>Connection Requests</h2>
            {authState.connectionRequests?.length > 0 ? (
              <div className={styles.requestsGrid}>
                {authState.connectionRequests.map((request) => (
                  <div key={request._id} className={styles.requestCard}>
                    <div className={styles.userInfo}>
                      <img 
                        src={request.userId.profilePicture && request.userId.profilePicture !== 'default.jpg' ? 
                          `/uploads/${request.userId.profilePicture}` : 
                          '/default-avatar.png'
                        } 
                        alt={request.userId.name}
                        className={styles.avatar}
                      />
                      <div>
                        <h4>{request.userId.name}</h4>
                        <p>@{request.userId.username}</p>
                        <p>{request.userId.email}</p>
                      </div>
                    </div>
                    <div className={styles.requestActions}>
                      <button 
                        onClick={() => handleAcceptRequest(request._id)}
                        className={styles.acceptBtn}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleRejectRequest(request._id)}
                        className={styles.rejectBtn}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No pending connection requests</p>
            )}
          </div>

          {/* My Connections */}
          <div className={styles.section}>
            <h2>My Connections ({authState.connections?.length || 0})</h2>
            {authState.connections?.length > 0 ? (
              <div className={styles.connectionsGrid}>
                {authState.connections.map((connection) => {
                  const connectionUser = getConnectionUser(connection)
                  return (
                    <div key={connection._id} className={styles.connectionCard}>
                      <div className={styles.userInfo}>
                        <img 
                          src={connectionUser.profilePicture && connectionUser.profilePicture !== 'default.jpg' ? 
                            `/uploads/${connectionUser.profilePicture}` : 
                            '/default-avatar.png'
                          } 
                          alt={connectionUser.name}
                          className={styles.avatar}
                        />
                        <div>
                          <h4>{connectionUser.name}</h4>
                          <p>@{connectionUser.username}</p>
                          <p>{connectionUser.email}</p>
                        </div>
                      </div>
                      <div className={styles.connectionActions}>
                        <button 
                          onClick={() => handleRemoveConnection(connectionUser._id)}
                          className={styles.removeBtn}
                        >
                          Remove
                        </button>
                        <button 
                          onClick={() => window.open(`/profile/${connectionUser._id}`, '_blank')} // ✅ Fixed route to /profile
                          className={styles.viewProfileBtn}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p>No connections yet. Start connecting with people!</p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  )
}

export default MyConnectionsPage