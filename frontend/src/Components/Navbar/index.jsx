import React from 'react'
import styles from "./styles.module.css"
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux';
import { logout } from '@/config/redux/reducer/authreducer';
import { useDispatch } from 'react-redux';

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
      window.open(`/profile/${authState.user._id}`, '_blank');
    } else {
      console.error('User ID not available');
      // Optional: redirect to current user's profile page without ID
      router.push('/profile');
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <h1 onClick={() => router.push("/")}>
          LinkUP
        </h1>

        <div className={styles.navBarOptionContainer}>
          {authState.loggedIn && authState.profileFetched ? (
            <div className={styles.userMenu}>
              <span className={styles.welcomeText}>
                Hey {authState.user?.name || 'User'}
              </span>
              <div 
                onClick={handleViewProfile}
                className={styles.profileButton}
              >
                View Profile
              </div>
              <div 
                onClick={handleLogout} 
                className={styles.logoutButton}
              >
                Logout
              </div>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <div 
                onClick={() => router.push("/login")} 
                className={styles.loginButton}
              >
                Login
              </div>
              <div 
                onClick={() => router.push("/register")}
                className={styles.buttonJoin}
              >
                Join Now
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}

export default Navbar;