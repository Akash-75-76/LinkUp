import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initSocket, disconnectSocket, getSocket } from '@/config/socket';
import {
  receiveRealtimeMessage,
  setUserTyping,
  updateUserOnlineStatus,
  addNotification,
  setNotifications,
} from '@/config/redux/reducer/chatReducer';
import { 
  addConnection, 
  removeSentConnectionRequest, 
  removeConnectionRequest 
} from '@/config/redux/reducer/authreducer';
import { idEq } from '@/utils/id';

export function useSocket() {
  const dispatch = useDispatch();
  const { user, loggedIn } = useSelector((state) => state.auth);
  const initialized = useRef(false);

  useEffect(() => {
    if (!loggedIn || !user?._id || initialized.current) return;

    const socket = initSocket(user._id);
    initialized.current = true;

    // ── Real-time message ──
    socket.on('new_message', (message) => {
      dispatch(receiveRealtimeMessage(message));
    });

    // ── Typing indicator ──
    socket.on('user_typing', (data) => {
      dispatch(setUserTyping(data));
    });

    // ── Online/offline status ──
    socket.on('user_online', (data) => {
      dispatch(updateUserOnlineStatus(data));
    });

    // ── Push notification ──
    socket.on('notification', (notification) => {
      dispatch(addNotification(notification));
    });

    // ── Pending notifications on connect ──
    socket.on('pending_notifications', (notifications) => {
      dispatch(setNotifications(notifications));
    });

    // ── Read receipts ──
    socket.on('messages_read_ack', (data) => {
      // Could update UI to show double-check marks
    });

    // ── Relationship updates (Real-time connection status) ──
    socket.on("relationship_update", (data) => {
      const { type, userId, connectionId, connection } = data;

      if (type === "connection_accepted" && connection) {
        // userId = sender, connectionId = user who accepted (recipient)
        if (idEq(userId, user._id)) {
          dispatch(removeSentConnectionRequest(connectionId));
          dispatch(addConnection(connection));
        } else if (idEq(connectionId, user._id)) {
          dispatch(removeConnectionRequest(userId));
          dispatch(addConnection(connection));
        }
      }
    });

    return () => {
      // Don't disconnect on component unmount — keep alive while app is open
      // disconnectSocket() is called on logout instead
    };
  }, [loggedIn, user?._id, dispatch]);

  // Disconnect on logout
  useEffect(() => {
    if (!loggedIn && initialized.current) {
      disconnectSocket();
      initialized.current = false;
    }
  }, [loggedIn]);

  return getSocket;
}
