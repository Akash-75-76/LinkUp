import UserLayout from '@/layout/userLayout'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { sendConnectionRequest } from '@/config/redux/action/authAction'
import styles from "./profile.module.css"

// Add default avatar
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0wIDg1QzAgNzAuNjQgMTEuNjQgNTkgMjYgNTlINzRDODguMzYgNTkgMTAwIDcwLjY0IDEwMCA4NVYxMDBIMFY4NVoiIGZpbGw9IiM5QjlCOUIiLz4KPC9zdmc+";

function UserProfile() {
  const router = useRouter()
  const { id } = router.query
  const authState = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('not_connected')

  useEffect(() => {
    if (id) {
      fetchUserProfile(id)
      checkConnectionStatus(id)
    }
  }, [id])

  // Debug the profile data
  useEffect(() => {
    if (userProfile) {
      console.log('=== PROFILE DATA DEBUG ===');
      console.log('Full userProfile:', userProfile);
      console.log('User ID data:', userProfile.userId);
      console.log('Bio:', userProfile.bio);
      console.log('Current Post:', userProfile.currentPost);
      console.log('Past Work:', userProfile.pastWork);
      console.log('Education:', userProfile.education);
    }
  }, [userProfile]);

  const fetchUserProfile = async (userId) => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`)
      if (!response.ok) {
        throw new Error('Profile not found')
      }
      const data = await response.json()
      console.log('API Response:', data); // Debug API response
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setUserProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const checkConnectionStatus = (userId) => {
    if (authState.connections?.some(conn => 
      conn.userId?._id === userId || conn.connectionId?._id === userId
    )) {
      setConnectionStatus('connected')
    } else if (authState.connectionRequests?.some(req => 
      req.userId?._id === userId
    )) {
      setConnectionStatus('request_sent')
    } else if (authState.sentConnectionRequests?.some(req => 
      req.connectionId?._id === userId
    )) {
      setConnectionStatus('request_pending')
    }
  }

  const handleConnect = async () => {
    if (!authState.user?.token || !id) return
    
    try {
      await dispatch(sendConnectionRequest({ 
        token: authState.user.token, 
        connectionId: id 
      })).unwrap()
      setConnectionStatus('request_sent')
    } catch (error) {
      console.error('Error sending connection request:', error)
    }
  }

  const downloadResume = async () => {
    if (!userProfile) return
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/download_profile?user_id=${userProfile.userId?._id || userProfile._id}`)
      if (!response.ok) {
        throw new Error('Failed to download resume')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `resume_${userProfile.userId?.username || 'user'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading resume:', error)
      alert('Failed to download resume')
    }
  }

  const getConnectButtonText = () => {
    switch(connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'request_sent':
        return 'Request Sent'
      case 'request_pending':
        return 'Respond to Request'
      default:
        return 'Connect'
    }
  }

  // Helper function to get user data safely
  const getUserData = () => {
    if (!userProfile) return null;
    
    // Handle different possible data structures
    if (userProfile.userId) {
      return userProfile.userId; // Populated user data
    } else if (userProfile.name) {
      return userProfile; // Direct user data
    }
    return null;
  }

  const userData = getUserData();

  if (isLoading) return (
    <UserLayout>
      <div className={styles.loading}>Loading profile...</div>
    </UserLayout>
  )
  
  if (!userProfile || !userData) return (
    <UserLayout>
      <div className={styles.error}>Profile not found</div>
    </UserLayout>
  )

  return (
    <UserLayout>
      <div className={styles.profileContainer}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.coverPhoto}>
            {/* Add cover photo here */}
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.avatarSection}>
              <img 
                src={userData.profilePicture && userData.profilePicture !== 'default.jpg' ? 
                  `http://localhost:5000/uploads/${userData.profilePicture}` : 
                  DEFAULT_AVATAR
                } 
                alt={userData.name}
                className={styles.profileAvatar}
                onError={(e) => {
                  e.target.src = DEFAULT_AVATAR;
                }}
              />
            </div>
            <div className={styles.profileDetails}>
              <h1>{userData.name || 'No name'}</h1>
              <p className={styles.username}>@{userData.username || 'No username'}</p>
              <p className={styles.bio}>{userProfile.bio || 'No bio available'}</p>
              <p className={styles.currentPosition}>
                {userProfile.currentPost || 'No current position'}
              </p>
              
              <div className={styles.profileActions}>
                <button 
                  onClick={handleConnect}
                  disabled={connectionStatus === 'connected' || connectionStatus === 'request_sent'}
                  className={`${styles.connectButton} ${
                    connectionStatus === 'connected' ? styles.connected : ''
                  } ${connectionStatus === 'request_sent' ? styles.requestSent : ''}`}
                >
                  {getConnectButtonText()}
                </button>
                <button 
                  onClick={downloadResume}
                  className={styles.downloadButton}
                >
                  Download Resume
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className={styles.profileContent}>
          {/* Work Experience */}
          <div className={styles.section}>
            <h2>Work Experience</h2>
            {userProfile.pastWork && userProfile.pastWork.length > 0 ? (
              userProfile.pastWork.map((work, index) => (
                <div key={index} className={styles.workItem}>
                  <h3>{work.position || 'No position specified'}</h3>
                  <p className={styles.company}>{work.company || 'No company specified'}</p>
                  <p className={styles.years}>{work.years || 'No duration specified'}</p>
                </div>
              ))
            ) : (
              <p className={styles.noData}>No work experience listed</p>
            )}
          </div>

          {/* Education */}
          <div className={styles.section}>
            <h2>Education</h2>
            {userProfile.education && userProfile.education.length > 0 ? (
              userProfile.education.map((edu, index) => (
                <div key={index} className={styles.educationItem}>
                  <h3>{edu.degree || 'No degree specified'}</h3>
                  <p className={styles.school}>{edu.school || 'No school specified'}</p>
                  <p className={styles.field}>{edu.fieldOfStudy || 'No field specified'}</p>
                </div>
              ))
            ) : (
              <p className={styles.noData}>No education information</p>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  )
}

export default UserProfile