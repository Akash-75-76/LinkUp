import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { clientServer } from '@/config';

export const useUserStatus = () => {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.token) return;

    // Set user as online when component mounts
    const setOnline = async () => {
      try {
        await clientServer.post('/user-status/update_status', {
          token: user.token,
          isOnline: true
        });
        console.log('User set to online');
      } catch (error) {
        console.error('Failed to set online status:', error);
      }
    };

    setOnline();

    // Set user as offline when page unloads
    const handleBeforeUnload = async () => {
      try {
        // Use fetch with keepalive for reliable offline status update
        await fetch('http://localhost:5000/api/user-status/update_status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: user.token,
            isOnline: false
          }),
          keepalive: true // This ensures the request completes even if page is unloading
        });
      } catch (error) {
        console.error('Failed to set offline status:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup: set offline when component unmounts (optional)
    const setOffline = async () => {
      try {
        await clientServer.post('/user-status/update_status', {
          token: user.token,
          isOnline: false
        });
      } catch (error) {
        console.error('Failed to set offline status on unmount:', error);
      }
    };

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Only set offline if you want users to appear offline when they navigate away
      // setOffline();
    };
  }, [user?.token]);
};