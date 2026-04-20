import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { initSocket } from './socket.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import userStatusRoutes from './routes/userStatus.routes.js';
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initSocket(httpServer);

// Middleware
app.use(cors({
  origin: "*"
}));

// Log raw request body for debugging FormData issues
app.use((req, res, next) => {
  if (req.path === '/api/users/register' && req.method === 'POST') {
    console.log('\n🔍 RAW REQUEST DEBUG (before middleware):');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach io to req for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from LinkUp backend!',
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user-status', userStatusRoutes);
app.use('/uploads', express.static('uploads'));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found on this server`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error'
  });
});

// Use httpServer instead of app.listen so Socket.IO shares the port
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`⚡ Socket.IO is ready for connections`);
});