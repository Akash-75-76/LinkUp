import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
// 404 Handler - REMOVED THE PROBLEMATIC WILDCARD
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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});