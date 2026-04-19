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
    const handleBeforeUnload = () => {
      try {
        // Use sendBeacon with Blob for reliable offline status update during unload
        const blob = new Blob([JSON.stringify({
          token: user.token,
          isOnline: false
        })], { type: 'application/json' });
        navigator.sendBeacon(
          'https://linkup-o722.onrender.com/api/user-status/update_status',
          blob
        );
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