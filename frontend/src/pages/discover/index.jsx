import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/userLayout'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllUsers } from '@/config/redux/action/authAction'
import { sendConnectionRequest } from '@/config/redux/action/authAction'
import styles from "./discover.module.css"

function DiscoverPage() {
  const dispatch = useDispatch()
  const authState = useSelector((state) => state.auth)
  const [sentRequests, setSentRequests] = useState(new Set())
  const [hasFetchedUsers, setHasFetchedUsers] = useState(false)

  useEffect(() => {
    if (!hasFetchedUsers) {
      dispatch(getAllUsers())
      setHasFetchedUsers(true)
    }
  }, [dispatch, hasFetchedUsers])

  // ✅ DEBUG CODE ADDED HERE
  useEffect(() => {
    if (authState.all_users && authState.user) {
      console.log('=== DEBUG USER FILTERING ===');
      console.log('Current User:', authState.user);
      console.log('All Users:', authState.all_users.map(u => ({ id: u._id, name: u.name })));
      console.log('Filtered Users:', filteredUsers.map(u => ({ id: u._id, name: u.name })));
    }
  }, [authState.all_users, authState.user]);

  const handleConnect = (userId) => {
    if (authState.user?.token) {
      dispatch(sendConnectionRequest({ 
        token: authState.user.token, 
        connectionId: userId 
      }))
      setSentRequests(prev => new Set([...prev, userId]))
    }
  }

  const isRequestSent = (userId) => {
    return sentRequests.has(userId)
  }

  // FIXED: Better filtering to exclude current user and already connected users
  const filteredUsers = authState.all_users?.filter(user => {
    // Exclude current user
    if (user._id === authState.user?._id) {
      return false
    }
    
    // Exclude already connected users
    const isConnected = authState.connections?.some(connection => 
      connection.userId._id === user._id || connection.connectionId._id === user._id
    )
    
    // Exclude users with pending connection requests
    const hasPendingRequest = authState.connectionRequests?.some(request => 
      request.userId._id === user._id
    )
    
    // Exclude users we've sent requests to
    const sentRequestToUser = authState.sentConnectionRequests?.some(request => 
      request.connectionId._id === user._id
    )
    
    return !isConnected && !hasPendingRequest && !sentRequestToUser
  }) || []

  // Debug logging to check filtering
  useEffect(() => {
    if (authState.all_users && authState.user) {
      console.log('All users:', authState.all_users.length)
      console.log('Current user ID:', authState.user._id)
      console.log('Filtered users:', filteredUsers.length)
      console.log('Connections:', authState.connections?.length)
      console.log('Connection requests:', authState.connectionRequests?.length)
      console.log('Sent requests:', authState.sentConnectionRequests?.length)
    }
  }, [authState.all_users, authState.user, filteredUsers])

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <h1>Discover People</h1>
          <p>Connect with professionals in your network</p>
          
          {authState.all_profiles_fetching ? (
            <div className={styles.loading}>Loading users...</div>
          ) : authState.isError ? (
            <div className={styles.error}>Error loading users: {authState.message}</div>
          ) : (
            <div className={styles.usersGrid}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user._id} className={styles.userCard}>
                    <div className={styles.userHeader}>
                      <div className={styles.userAvatar}>
                        {user.profilePicture && user.profilePicture !== 'default.jpg' ? (
                          <img 
                            src={`http://localhost:5000/uploads/${user.profilePicture}`} 
                            alt={user.name}
                            className={styles.avatarImage}
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={styles.avatarPlaceholder}
                          style={{ 
                            display: (!user.profilePicture || user.profilePicture === 'default.jpg') ? 'flex' : 'none' 
                          }}
                        >
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className={styles.userInfo}>
                        <h3 className={styles.userName}>{user.name}</h3>
                        <p className={styles.userEmail}>{user.email}</p>
                        <p className={styles.userUsername}>@{user.username}</p>
                      </div>
                    </div>
                    
                    <div className={styles.userActions}>
                      <button 
                        onClick={() => handleConnect(user._id)}
                        disabled={isRequestSent(user._id)}
                        className={`${styles.connectButton} ${
                          isRequestSent(user._id) ? styles.sent : ''
                        }`}
                      >
                        {isRequestSent(user._id) ? 'Request Sent' : 'Connect'}
                      </button>
                      
                      <button 
                        onClick={() => window.open(`/profile/${user._id}`, '_blank')}
                        className={styles.viewProfileButton}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noUsers}>
                  {authState.all_users?.length > 0 ? 
                    'No new users to discover. Try again later!' : 
                    'No users found'
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  )
}

export default DiscoverPage