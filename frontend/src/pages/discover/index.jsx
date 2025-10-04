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
  const [hasFetchedUsers, setHasFetchedUsers] = useState(false) // ✅ Add state to prevent infinite fetches

  useEffect(() => {
    if (!hasFetchedUsers) { // ✅ Only fetch if not already fetched
      dispatch(getAllUsers())
      setHasFetchedUsers(true)
    }
  }, [dispatch, hasFetchedUsers]) // ✅ Add dependency

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

  // Filter out current user from the list
  const filteredUsers = authState.all_users?.filter(
    user => user._id !== authState.user?._id
  ) || []

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
                            src={`/uploads/${user.profilePicture}`} 
                            alt={user.name}
                            className={styles.avatarImage}
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
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
                <div className={styles.noUsers}>No users found</div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  )
}

export default DiscoverPage