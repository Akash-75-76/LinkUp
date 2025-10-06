import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import UserLayout from '@/layout/userLayout';
import DashboardLayout from "../../layout/Dashboardlayout/index"
import PostFeed from '@/Components/PostFeed';
import People from '@mui/icons-material/People';
import Email from '@mui/icons-material/Email';
import Visibility from '@mui/icons-material/Visibility';
import Create from '@mui/icons-material/Create';
import Search from '@mui/icons-material/Search';
import Group from '@mui/icons-material/Group';
import Celebration from '@mui/icons-material/Celebration';
import LinkIcon from '@mui/icons-material/Link';
import Mood from '@mui/icons-material/Mood';
import styles from './dashboard.module.css';

const Dashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [isTokenThere, setIsTokenThere] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (authState.isTokenThere === false) {
      router.push('/login');
    }
  }, [authState.isTokenThere, router]);

  useEffect(() => {
    if (isTokenThere && !hasFetchedData) {
      dispatch(getAllPosts());
      setHasFetchedData(true);
    }
  }, [isTokenThere, hasFetchedData, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.dashboard}>
          {/* Welcome Section */}
          

          {/* Main Content */}
          <div className={styles.dashboardContent}>
            {/* Post Feed Section */}
            <div className={styles.mainColumn}>
              <PostFeed />
            </div>

            {/* Right Sidebar */}
            <div className={styles.rightColumn}>
              {/* Network Stats */}
              <div className={styles.statsCard}>
                <div className={styles.cardHeader}>
                  <h3>Your Network</h3>
                  <span className={styles.viewAll}>View All</span>
                </div>
                <div className={styles.statsList}>
                  <div className={styles.statItem}>
                    <div className={styles.statLeft}>
                      <People className={styles.statIcon} />
                      <div className={styles.statDetails}>
                        <span className={styles.statTitle}>Connections</span>
                        <span className={styles.statSubtitle}>Your professional network</span>
                      </div>
                    </div>
                    <span className={styles.statValue}>{authState.connections?.length || 0}</span>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statLeft}>
                      <Email className={styles.statIcon} />
                      <div className={styles.statDetails}>
                        <span className={styles.statTitle}>Pending Requests</span>
                        <span className={styles.statSubtitle}>Awaiting your response</span>
                      </div>
                    </div>
                    <span className={styles.statValue}>{authState.connectionRequests?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={styles.quickActionsCard}>
                <div className={styles.cardHeader}>
                  <h3>Quick Actions</h3>
                </div>
                <div className={styles.actionsList}>
                  <button 
                    className={styles.actionButton}
                    onClick={() => router.push('/create-post')}
                  >
                    <Create className={styles.actionIcon} />
                    Create Post
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={() => router.push('/discover')}
                  >
                    <Search className={styles.actionIcon} />
                    Find Connections
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={() => router.push('/myConnections')}
                  >
                    <Group className={styles.actionIcon} />
                    Manage Network
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className={styles.activityCard}>
                <div className={styles.cardHeader}>
                  <h3>Recent Activity</h3>
                </div>
                <div className={styles.activityList}>
                  <div className={styles.activityItem}>
                    <Celebration className={styles.activityIcon} />
                    <div className={styles.activityContent}>
                      <p>Your profile was viewed 5 times this week</p>
                      <span className={styles.activityTime}>2 days ago</span>
                    </div>
                  </div>
                  <div className={styles.activityItem}>
                    <LinkIcon className={styles.activityIcon} />
                    <div className={styles.activityContent}>
                      <p>3 new people in your network</p>
                      <span className={styles.activityTime}>1 week ago</span>
                    </div>
                  </div>
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