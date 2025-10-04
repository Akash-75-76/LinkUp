import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import UserLayout from '@/layout/userLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import CreatePost from '@/Components/CreatePost';
import PostFeed from '@/Components/PostFeed';
import styles from './dashboard.module.css';

const Dashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [isTokenThere, setIsTokenThere] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false); // ✅ Fixed variable name

 // Add this to handle token expiration
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }
  
  // Verify token is still valid
  if (authState.isTokenThere === false) {
    router.push('/login');
  }
}, [authState.isTokenThere, router]);

  useEffect(() => {
    if (isTokenThere && !hasFetchedData) {
      dispatch(getAllPosts()); // ✅ Only fetch posts, UserLayout handles profile
      setHasFetchedData(true); // ✅ Mark as fetched
    }
  }, [isTokenThere, hasFetchedData, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.dashboard}>
          <div className={styles.welcomeSection}>
            <h1>Welcome back, {authState.user?.name || 'User'}! 👋</h1>
            <p>Here's what's happening in your network today</p>
          </div>

          <div className={styles.dashboardContent}>
            {/* Left Column - Create Post */}
            <div className={styles.leftColumn}>
              <CreatePost />
            </div>

            {/* Main Column - Post Feed */}
            <div className={styles.mainColumn}>
              <PostFeed />
            </div>

            {/* Right Column - Stats */}
            <div className={styles.rightColumn}>
              <div className={styles.statsCard}>
                <h3>Your Network</h3>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {authState.connections?.length || 0}
                  </span>
                  <span className={styles.statLabel}>Connections</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {authState.connectionRequests?.length || 0}
                  </span>
                  <span className={styles.statLabel}>Pending Requests</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default Dashboard;