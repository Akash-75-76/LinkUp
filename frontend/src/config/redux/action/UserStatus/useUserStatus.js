import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clientServer } from '@/config';

export const useUserStatus = () => {
  const dispatch = useDispatch();
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
      } catch (error) {
        console.error('Failed to set online status:', error);
      }
    };

    setOnline();

    // Set user as offline when page unloads
    const handleBeforeUnload = () => {
      try {
        // Use sendBeacon with Blob for reliable offline status update
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

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.token, dispatch]);
};