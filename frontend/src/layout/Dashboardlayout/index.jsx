import React, { useEffect } from 'react';
import styles from "./index.module.css";
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import Dashboard from '@mui/icons-material/Dashboard';
import Search from '@mui/icons-material/Search';
import People from '@mui/icons-material/People';
import Create from '@mui/icons-material/Create';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push("/login");
    }
  }, [router]);

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  const navigationItems = [
    { path: '/dashboard', icon: <Dashboard className={styles.menuIcon} />, label: 'Dashboard' },
    { path: '/discover', icon: <Search className={styles.menuIcon} />, label: 'Discover' },
    { path: '/myConnections', icon: <People className={styles.menuIcon} />, label: 'My Connections' },
  ];

  const createItems = [
    { action: handleCreatePost, icon: <Create className={styles.menuIcon} />, label: 'Create Post' },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.homeContainer}>
        
        {/* Left Sidebar */}
        <div className={styles.leftSidebar}>
          <div className={styles.sidebarContent}>
            {/* Navigation Section */}
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Navigation</h3>
              <div className={styles.sidebarMenu}>
                {navigationItems.map((item, index) => (
                  <div 
                    key={index}
                    className={`${styles.menuItem} ${
                      router.pathname === item.path ? styles.active : ''
                    }`}
                    onClick={() => router.push(item.path)}
                  >
                    {item.icon}
                    <span className={styles.menuLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Section */}
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Create</h3>
              <div className={styles.sidebarMenu}>
                {createItems.map((item, index) => (
                  <div 
                    key={index}
                    className={styles.menuItem}
                    onClick={item.action}
                  >
                    {item.icon}
                    <span className={styles.menuLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Section */}
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Quick Access</h3>
              <div className={styles.quickStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>0</span>
                  <span className={styles.statLabel}>Pending</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>0</span>
                  <span className={styles.statLabel}>Messages</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {children}
        </div>
      </div>
    </div>
  );
}