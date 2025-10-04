import UserLayout from '@/layout/userLayout'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { sendConnectionRequest } from '@/config/redux/action/authAction'
import styles from "./profile.module.css"

function UserProfile() {
  const router = useRouter()
  const { id } = router.query
  const authState = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('not_connected') // ✅ Track connection status

  useEffect(() => {
    if (id) {
      fetchUserProfile(id)
      checkConnectionStatus(id)
    }
  }, [id])

  const fetchUserProfile = async (userId) => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`)
      if (!response.ok) {
        throw new Error('Profile not found')
      }
      const data = await response.json()
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setUserProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const checkConnectionStatus = (userId) => {
    // ✅ Check if users are already connected
    if (authState.connections?.some(conn => 
      conn.userId._id === userId || conn.connectionId._id === userId
    )) {
      setConnectionStatus('connected')
    } else if (authState.connectionRequests?.some(req => 
      req.userId._id === userId
    )) {
      setConnectionStatus('request_sent')
    } else if (authState.sentConnectionRequests?.some(req => 
      req.connectionId._id === userId
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
      const response = await fetch(`http://localhost:5000/api/users/download_profile?user_id=${userProfile.userId._id}`)
      if (!response.ok) {
        throw new Error('Failed to download resume')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `resume_${userProfile.userId.username}.pdf`
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

  if (isLoading) return (
    <UserLayout>
      <div className={styles.loading}>Loading profile...</div>
    </UserLayout>
  )
  
  if (!userProfile) return (
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
                src={userProfile.userId.profilePicture && userProfile.userId.profilePicture !== 'default.jpg' ? 
                  `/uploads/${userProfile.userId.profilePicture}` : 
                  '/default-avatar.png'
                } 
                alt={userProfile.userId.name}
                className={styles.profileAvatar}
              />
            </div>
            <div className={styles.profileDetails}>
              <h1>{userProfile.userId.name}</h1>
              <p className={styles.username}>@{userProfile.userId.username}</p>
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