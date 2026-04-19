import { io } from 'socket.io-client';

// Detect environment: use localhost in dev, Render URL in production
const SOCKET_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : (process.env.NEXT_PUBLIC_SOCKET_URL || 'https://linkup-o722.onrender.com');

let socket = null;

export function initSocket(userId) {
  if (socket?.connected) {
    return socket;
  }

  console.log('🔌 Connecting socket to:', SOCKET_URL);

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('⚡ Socket connected:', socket.id);
    if (userId) {
      socket.emit("join", String(userId));
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('reconnect', () => {
    console.log('🔄 Socket reconnected');
    if (userId) {
      socket.emit("join", String(userId));
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
