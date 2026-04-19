import UserLayout from '@/layout/userLayout'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { sendConnectionRequest, getSentConnectionRequests, whatAreMyConnections, getMyConnectionRequests } from '@/config/redux/action/authAction'
import { API_BASE_URL, UPLOADS_BASE_URL } from '@/config'
import { idEq } from '@/utils/id'
import { openChatWithUser } from '@/config/redux/reducer/chatReducer' // Add this import
import styles from "./profile.module.css"

// Material-UI Icons
import WarningIcon from '@mui/icons-material/Warning';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CircleIcon from '@mui/icons-material/Circle';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupsIcon from '@mui/icons-material/Groups';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0wIDg1QzAgNzAuNjQgMTEuNjQgNTkgMjYgNTlINzRDODguMzYgNTkgMTAwIDcwLjY0IDEwMCA4NVYxMDBIMFY4NVoiIGZpbGw9IiM5QjlCOUIiLz4KPC9zdmc+";

function UserProfile() {
  const router = useRouter()
  const { id } = router.query
  const authState = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('not_connected')
  const [activeTab, setActiveTab] = useState('about')
  const [postsCount, setPostsCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [connectionsCount, setConnectionsCount] = useState(0)

  useEffect(() => {
    if (id) {
      fetchUserProfile(id)
      fetchUserPostsCount(id)
      fetchFollowingCount(id)
      fetchConnectionsCount(id)
      // Always re-fetch connection state so status is current
      if (authState.user?.token) {
        Promise.all([
          dispatch(whatAreMyConnections({ token: authState.user.token })),
          dispatch(getSentConnectionRequests({ token: authState.user.token })),
          dispatch(getMyConnectionRequests({ token: authState.user.token })),
        ]).then(() => {
          checkConnectionStatus(id)
        })
      }
    }
  }, [id])

  // Re-check status whenever Redux connection data updates
  useEffect(() => {
    if (id) {
      checkConnectionStatus(id)
    }
  }, [id, authState.connections, authState.sentConnectionRequests, authState.connectionRequests])

  const fetchUserProfile = async (userId) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`)
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

  const checkConnectionStatus = (profileUserId) => {
    const uid = String(profileUserId)
    if (
      authState.connections?.some(
        (conn) =>
          idEq(conn.userId?._id || conn.userId, uid) ||
          idEq(conn.connectionId?._id || conn.connectionId, uid)
      )
    ) {
      setConnectionStatus('connected')
    } else if (
      authState.sentConnectionRequests?.some((req) =>
        idEq(req.connectionId?._id || req.connectionId, uid)
      )
    ) {
      setConnectionStatus('request_sent')
    } else if (
      authState.connectionRequests?.some((req) =>
        idEq(req.userId?._id || req.userId, uid)
      )
    ) {
      setConnectionStatus('request_received')
    } else {
      setConnectionStatus('not_connected')
    }
  }

   const fetchUserPostsCount = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/user_posts_count?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch posts count')
      }
      const data = await response.json()
      setPostsCount(data.count || 0)
    } catch (error) {
      console.error('Error fetching posts count:', error)
      setPostsCount(0)
    }
  }

   const fetchFollowingCount = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/following_count?userId=${userId}`)
    if (response.ok) {
      const data = await response.json()
      setFollowingCount(data.count || 0)
    } else {
      setFollowingCount(0)
    }
  } catch (error) {
    console.error('Error fetching following count:', error)
    setFollowingCount(0)
  }
}

  const fetchConnectionsCount = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/my_connections?token=${authState.user?.token}`)
      if (response.ok) {
        const data = await response.json()
        // Count connections where this userId is involved
        const count = data.filter(
          (conn) =>
            idEq(conn.userId?._id || conn.userId, userId) ||
            idEq(conn.connectionId?._id || conn.connectionId, userId)
        ).length
        setConnectionsCount(count)
      } else {
        setConnectionsCount(0)
      }
    } catch (error) {
      console.error('Error fetching connections count:', error)
      setConnectionsCount(0)
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

  const handleMessage = () => {
  if (!userProfile || !userProfile.userId) {
    console.log('No user profile or user ID');
    return;
  }
  
  // Check if users are connected before allowing messaging
  if (connectionStatus !== 'connected') {
    alert('You need to be connected to message this user');
    return;
  }
  
  console.log('Opening chat with user:', userProfile.userId);
  
  // Open chat with this user
  dispatch(openChatWithUser(userProfile.userId));
  console.log('Dispatched openChatWithUser action');
}

  const downloadResume = async () => {
    if (!userProfile) return
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/download_profile?user_id=${userProfile.userId?._id || userProfile._id}`
      )
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
        return 'Following'
      case 'request_sent':
        return 'Pending'
      case 'request_pending':
        return 'Respond to Request'
      default:
        return 'Connect'
    }
  }

  const getUserData = () => {
    if (!userProfile) return null;
    
    if (userProfile.userId) {
      return userProfile.userId;
    } else if (userProfile.name) {
      return userProfile;
    }
    return null;
  }

  const userData = getUserData();

  if (isLoading) return (
    <UserLayout>
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading profile...</p>
      </div>
    </UserLayout>
  )
  
  if (!userProfile || !userData) return (
    <UserLayout>
      <div className={styles.errorContainer}>
        <WarningIcon className={styles.errorIcon} />
        <h3>Profile not found</h3>
        <p>The profile you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          <ArrowBackIcon className={styles.buttonIcon} />
          Go Back
        </button>
      </div>
    </UserLayout>
  )

  const isOwnProfile = userData._id === authState.user?._id;

  return (
    <UserLayout>
      <div className={styles.profileContainer}>
        {/* Simplified Profile Header - No duplicate name */}
        <div className={styles.profileHeader}>
          <div className={styles.profileMain}>
            <div className={styles.avatarSection}>
              <img 
                src={userData.profilePicture && userData.profilePicture !== 'default.jpg' ? 
                  (userData.profilePicture.startsWith('http://') || userData.profilePicture.startsWith('https://') ? 
                    userData.profilePicture : 
                    `${UPLOADS_BASE_URL}/uploads/${userData.profilePicture}`) : 
                  DEFAULT_AVATAR
                } 
                alt={userData.name}
                className={styles.profileAvatar}
                onError={(e) => {
                  e.target.src = DEFAULT_AVATAR;
                }}
              />
              {!isOwnProfile && (
                <div className={styles.connectionStatus}>
                  <CircleIcon className={`${styles.statusDot} ${
                    connectionStatus === 'connected' ? styles.connected : 
                    connectionStatus === 'request_sent' ? styles.pending : 
                    styles.notConnected
                  }`} />
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'request_sent' ? 'Request Sent' : 
                   'Not Connected'}
                </div>
              )}
            </div>
            
            <div className={styles.profileDetails}>
              <div className={styles.profileHeaderInfo}>
                <h1>{userData.name || 'No name'}</h1>
                <p className={styles.username}>@{userData.username || 'No username'}</p>
                <p className={styles.currentPosition}>
                  {userProfile.currentPost || 'No current position'}
                </p>
              </div>
              
              <p className={styles.bio}>{userProfile.bio || 'No bio available'}</p>
              
              <div className={styles.profileStats}>
    <div className={styles.stat}>
      <GroupsIcon className={styles.statIcon} />
      <span className={styles.statNumber}>{connectionsCount}</span>
      <span className={styles.statLabel}>Connections</span>
    </div>
    <div className={styles.stat}>
      <ArticleIcon className={styles.statIcon} />
      <span className={styles.statNumber}>{postsCount}</span> {/* ✅ Now dynamic */}
      <span className={styles.statLabel}>Posts</span>
    </div>
    <div className={styles.stat}>
      <PeopleIcon className={styles.statIcon} />
      <span className={styles.statNumber}>{followingCount}</span> {/* ✅ Now dynamic */}
      <span className={styles.statLabel}>Following</span>
    </div>
  </div>

              {!isOwnProfile && (
                <div className={styles.profileActions}>
                  <button 
                    onClick={handleConnect}
                    disabled={connectionStatus === 'connected' || connectionStatus === 'request_sent'}
                    className={`${styles.connectButton} ${
                      connectionStatus === 'connected' ? styles.connected : ''
                    } ${connectionStatus === 'request_sent' ? styles.requestSent : ''}`}
                  >
                    {connectionStatus === 'connected' ? (
                      <CheckIcon className={styles.buttonIcon} />
                    ) : connectionStatus === 'request_sent' ? (
                      <ScheduleIcon className={styles.buttonIcon} />
                    ) : (
                      <PersonAddIcon className={styles.buttonIcon} />
                    )}
                    {getConnectButtonText()}
                  </button>
                  <button 
                    onClick={downloadResume}
                    className={styles.downloadButton}
                  >
                    <DownloadIcon className={styles.buttonIcon} />
                    Download Resume
                  </button>
                  <button 
                    onClick={handleMessage}
                    disabled={connectionStatus !== 'connected'}
                    className={`${styles.messageButton} ${
                      connectionStatus !== 'connected' ? styles.disabled : ''
                    }`}
                    title={connectionStatus !== 'connected' ? 'Connect to message this user' : 'Send message'}
                  >
                    <EmailIcon className={styles.buttonIcon} />
                    Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Navigation */}
        <div className={styles.profileNavigation}>
          <button 
            className={`${styles.navItem} ${activeTab === 'about' ? styles.active : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <PersonIcon className={styles.navIcon} />
            About
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'experience' ? styles.active : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            <WorkIcon className={styles.navIcon} />
            Experience
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'education' ? styles.active : ''}`}
            onClick={() => setActiveTab('education')}
          >
            <SchoolIcon className={styles.navIcon} />
            Education
          </button>
        </div>

        {/* Profile Content - Compact layout */}
        <div className={styles.profileContent}>
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className={styles.tabContent}>
              <div className={styles.aboutSection}>
                <h3>About</h3>
                <p className={styles.aboutText}>
                  {userProfile.bio || 'No information available about this professional.'}
                </p>
              </div>
              
              <div className={styles.contactInfo}>
                <h4>Contact Information</h4>
                <div className={styles.contactItem}>
                  <EmailIcon className={styles.contactIcon} />
                  <span className={styles.contactLabel}>Email:</span>
                  <span className={styles.contactValue}>{userData.email}</span>
                </div>
                <div className={styles.contactItem}>
                  <CalendarTodayIcon className={styles.contactIcon} />
                  <span className={styles.contactLabel}>Member since:</span>
                  <span className={styles.contactValue}>
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className={styles.tabContent}>
              <h3>Work Experience</h3>
              {userProfile.pastWork && userProfile.pastWork.length > 0 ? (
                <div className={styles.experienceList}>
                  {userProfile.pastWork.map((work, index) => (
                    <div key={index} className={styles.experienceItem}>
                      <div className={styles.experienceHeader}>
                        <h4>{work.position || 'No position specified'}</h4>
                        <span className={styles.experienceYears}>{work.years || 'No duration'}</span>
                      </div>
                      <p className={styles.company}>{work.company || 'No company specified'}</p>
                      {work.description && (
                        <p className={styles.experienceDescription}>{work.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noData}>
                  <WorkIcon className={styles.noDataIcon} />
                  <h4>No work experience listed</h4>
                  <p>This professional hasn't added their work experience yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className={styles.tabContent}>
              <h3>Education</h3>
              {userProfile.education && userProfile.education.length > 0 ? (
                <div className={styles.educationList}>
                  {userProfile.education.map((edu, index) => (
                    <div key={index} className={styles.educationItem}>
                      <div className={styles.educationHeader}>
                        <h4>{edu.degree || 'No degree specified'}</h4>
                        <span className={styles.educationYears}>{edu.years || ''}</span>
                      </div>
                      <p className={styles.school}>{edu.school || 'No school specified'}</p>
                      <p className={styles.field}>{edu.fieldOfStudy || 'No field specified'}</p>
                      {edu.description && (
                        <p className={styles.educationDescription}>{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noData}>
                  <SchoolIcon className={styles.noDataIcon} />
                  <h4>No education information</h4>
                  <p>This professional hasn't added their education details yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  )
}

export default UserProfile