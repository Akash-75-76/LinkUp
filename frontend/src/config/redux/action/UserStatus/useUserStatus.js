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
    const handleBeforeUnload = async () => {
      try {
        // Use sendBeacon for reliable offline status update
        navigator.sendBeacon(
          'http://localhost:5000/api/user-status/update_status',
          JSON.stringify({
            token: user.token,
            isOnline: false
          })
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