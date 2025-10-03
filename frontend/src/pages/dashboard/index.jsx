// pages/dashboard/index.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import { getUserAndProfile } from '@/config/redux/action/authAction';
import UserLayout from '@/layout/userLayout';
import DashboardLayout from '@/layout/DashboardLayout';

const Dashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [isTokenThere, setIsTokenThere] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsTokenThere(true);
    }
  }, [router]);

  useEffect(() => {
    if (isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getUserAndProfile({ token: localStorage.getItem("token") }));
    }
  }, [isTokenThere, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1>Welcome to Dashboard</h1>
          <p>Hello {authState.user?.name || 'User'}! 👋</p>
          
          {/* Add your dashboard content here */}
          <div style={{ marginTop: '30px' }}>
            <h2>Recent Activity</h2>
            <div style={{ 
              background: '#f8fafc', 
              padding: '20px', 
              borderRadius: '12px',
              marginTop: '15px'
            }}>
              <p>No recent activity yet. Start connecting with others!</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default Dashboard;