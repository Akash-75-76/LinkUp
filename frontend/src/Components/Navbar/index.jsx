import React from 'react';
import styles from "./styles.module.css";
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/config/redux/reducer/authreducer';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Dashboard from '@mui/icons-material/Dashboard';
import ExitToApp from '@mui/icons-material/ExitToApp';
import LinkIcon from '@mui/icons-material/Link';

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const handleLogout = () => {
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