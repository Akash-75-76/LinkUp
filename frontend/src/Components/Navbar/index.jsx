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

  // Debug logging (commented out for production)
  // console.log('Navbar authState:', authState);
  // console.log('Logged in:', authState.loggedIn);
  // console.log('Profile fetched:', authState.profileFetched);
  // console.log('User:', authState.user);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
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
                onClick={() => router.push("/profile")} 
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