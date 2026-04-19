import React, { useState, useRef, useEffect } from 'react';
import styles from "./styles.module.css";
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/config/redux/reducer/authreducer';
import { markNotificationRead, clearAllNotifications } from '@/config/redux/reducer/chatReducer';
import { clientServer, API_BASE_URL, UPLOADS_BASE_URL } from '@/config';
import { getSocket } from '@/config/socket';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Dashboard from '@mui/icons-material/Dashboard';
import ExitToApp from '@mui/icons-material/ExitToApp';
import LinkIcon from '@mui/icons-material/Link';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CloseIcon from '@mui/icons-material/Close';

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const { notifications, unreadNotificationCount } = useSelector((state) => state.chat);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (authState.user?.token) {
      try {
        await clientServer.post('/user-status/update_status', {
          token: authState.user.token,
          isOnline: false
        });
      } catch (error) {
        console.error('Failed to set offline status on logout:', error);
      }
    }
    dispatch(logout());
    router.push("/login");
  };

  const handleViewProfile = () => {
    if (authState.user?._id) {
      router.push(`/profile/${authState.user._id}`);
    } else {
      router.push('/profile');
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleClearNotifications = () => {
    dispatch(clearAllNotifications());
    const socket = getSocket();
    if (socket) {
      socket.emit('clear_notifications');
    }
  };

  const handleNotificationClick = (notif) => {
    dispatch(markNotificationRead(notif._id));
    const socket = getSocket();
    if (socket) {
      socket.emit('notification_read', notif._id);
    }

    // Navigate based on type
    if (notif.type === 'message' && notif.from?._id) {
      // Open chat — handled by existing infrastructure
    } else if (notif.type === 'connection_request' || notif.type === 'connection_accepted') {
      router.push('/myConnections');
    }
    setShowNotifications(false);
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navbarContent}>
          <div 
            className={styles.logo}
            onClick={() => handleNavigation("/")}
          >
            <LinkIcon className={styles.logoIcon} />
            <h1>LinkUP</h1>
          </div>

          <div className={styles.navBarOptionContainer}>
            {authState.loggedIn && authState.profileFetched ? (
              <div className={styles.userMenu}>
                <div className={styles.userInfo}>
                  <span className={styles.welcomeText}>
                    Welcome back, <strong>{authState.user?.name || 'User'}</strong>
                  </span>
                </div>
                <div className={styles.menuButtons}>
                  {/* Notification Bell */}
                  <div className={styles.notificationWrapper} ref={notifRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={styles.notifButton}
                    >
                      {unreadNotificationCount > 0 ? (
                        <NotificationsActiveIcon className={styles.notifIconActive} />
                      ) : (
                        <NotificationsIcon className={styles.buttonIcon} />
                      )}
                      {unreadNotificationCount > 0 && (
                        <span className={styles.notifBadge}>
                          {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className={styles.notifDropdown}>
                        <div className={styles.notifHeader}>
                          <h4>Notifications</h4>
                          {notifications.length > 0 && (
                            <button
                              onClick={handleClearNotifications}
                              className={styles.clearAllBtn}
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className={styles.notifList}>
                          {notifications.length > 0 ? (
                            notifications.slice(0, 10).map((notif) => (
                              <div
                                key={notif._id}
                                className={`${styles.notifItem} ${
                                  !notif.read ? styles.notifUnread : ''
                                }`}
                                onClick={() => handleNotificationClick(notif)}
                              >
                                <img
                                  src={
                                    notif.from?.profilePicture &&
                                    notif.from.profilePicture !== 'default.jpg'
                                      ? (notif.from.profilePicture.startsWith('http://') || notif.from.profilePicture.startsWith('https://') ?
                                          notif.from.profilePicture :
                                          `${UPLOADS_BASE_URL}/uploads/${notif.from.profilePicture}`)
                                      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjgiIGZpbGw9IiM5QjlCOUIiLz4KPHBhdGggZD0iTTAgMzRDMCAyOC4yNTYgNC4yNTYgMjQgMTAgMjRIMzBDMzUuNzQ0IDI0IDQwIDI4LjI1NiA0MCAzNFY0MEgwVjM0WiIgZmlsbD0iIzlCOUI5QiIvPgo8L3N2Zz4='
                                  }
                                  alt=""
                                  className={styles.notifAvatar}
                                />
                                <div className={styles.notifContent}>
                                  <p className={styles.notifText}>{notif.message}</p>
                                  <span className={styles.notifTime}>
                                    {formatTimeAgo(notif.createdAt)}
                                  </span>
                                </div>
                                {!notif.read && <span className={styles.notifDot} />}
                              </div>
                            ))
                          ) : (
                            <div className={styles.notifEmpty}>
                              <NotificationsIcon className={styles.notifEmptyIcon} />
                              <p>No notifications</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleViewProfile}
                    className={styles.profileButton}
                  >
                    <AccountCircle className={styles.buttonIcon} />
                    My Profile
                  </button>
                  <button 
                    onClick={() => handleNavigation("/dashboard")}
                    className={styles.dashboardButton}
                  >
                    <Dashboard className={styles.buttonIcon} />
                    Dashboard
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className={styles.logoutButton}
                  >
                    <ExitToApp className={styles.buttonIcon} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <button 
                  onClick={() => handleNavigation("/login")} 
                  className={styles.loginButton}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleNavigation("/register")}
                  className={styles.buttonJoin}
                >
                  Join Now
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;