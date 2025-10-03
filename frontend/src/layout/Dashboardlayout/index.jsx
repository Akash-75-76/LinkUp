// layout/DashboardLayout.js
import React, { useEffect } from 'react';
import styles from "./index.module.css";
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.homeContainer}>
        
        {/* Left Sidebar */}
        <div className={styles.leftSidebar}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Navigation</h3>
            <div className={styles.sidebarMenu}>
              <div className={styles.menuItem} onClick={() => router.push('/dashboard')}>
                <span className={styles.menuIcon}>📊</span>
                Dashboard
              </div>
              <div className={styles.menuItem} onClick={() => router.push('/discover')}>
                <span className={styles.menuIcon}>🔍</span>
                Discover
              </div>
              <div className={styles.menuItem} onClick={() => router.push('/myConnections')}>
                <span className={styles.menuIcon}>👥</span>
                My Connections
              </div>
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Quick Access</h3>
            <div className={styles.sidebarMenu}>
              <div className={styles.menuItem} onClick={() => router.push('/scroll')}>
                <span className={styles.menuIcon}>📜</span>
                Scroll
              </div>
              <div className={styles.menuItem} onClick={() => router.push('/top-profiles')}>
                <span className={styles.menuIcon}>⭐</span>
                Top Profiles
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {children}
        </div>

        {/* Right Sidebar */}
        <div className={styles.rightSidebar}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Trending</h3>
            <div className={styles.trendingList}>
              <div className={styles.trendingItem}>
                <span className={styles.trendingBadge}>1</span>
                <span>Web Development</span>
              </div>
              <div className={styles.trendingItem}>
                <span className={styles.trendingBadge}>2</span>
                <span>AI & ML</span>
              </div>
              <div className={styles.trendingItem}>
                <span className={styles.trendingBadge}>3</span>
                <span>UI/UX Design</span>
              </div>
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Suggested Profiles</h3>
            <div className={styles.suggestedList}>
              <div className={styles.profileCard}>
                <div className={styles.profileAvatar}>JD</div>
                <div className={styles.profileInfo}>
                  <div className={styles.profileName}>John Doe</div>
                  <div className={styles.profileTitle}>Frontend Developer</div>
                </div>
                <button className={styles.connectBtn}>Connect</button>
              </div>
              <div className={styles.profileCard}>
                <div className={styles.profileAvatar}>SJ</div>
                <div className={styles.profileInfo}>
                  <div className={styles.profileName}>Sarah Johnson</div>
                  <div className={styles.profileTitle}>UI Designer</div>
                </div>
                <button className={styles.connectBtn}>Connect</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}