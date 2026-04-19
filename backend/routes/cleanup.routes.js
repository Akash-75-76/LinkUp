/**
 * Database Cleanup Route (Optional)
 * 
 * Add this to your backend to cleanup via HTTP request
 * 
 * Endpoints:
 *   DELETE /api/cleanup/users  - Delete all users
 *   DELETE /api/cleanup/posts  - Delete all posts
 *   DELETE /api/cleanup/all    - Delete everything
 * 
 * WARNING: Only use in development environment!
 */

const express = require('express');
const router = express.Router();

/**
 * Helper function to delete a collection
 */
async function deleteCollection(collectionName) {
  try {
    const collection = require('mongoose').connection.collection(collectionName);
    const result = await collection.deleteMany({});
    return {
      success: true,
      collection: collectionName,
      deleted: result.deletedCount,
    };
  } catch (error) {
    return {
      success: false,
      collection: collectionName,
      error: error.message,
    };
  }
}

/**
 * Security middleware - Only allow in development
 */
router.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      error: 'Cleanup is only available in development environment',
    });
  }
  next();
});

/**
 * DELETE /api/cleanup/users
 * Delete all users
 */
router.delete('/users', async (req, res) => {
  try {
    const result = await deleteCollection('users');
    res.json({
      status: 'success',
      message: `Deleted ${result.deleted} user(s)`,
      deleted: result.deleted,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/cleanup/posts
 * Delete all posts
 */
router.delete('/posts', async (req, res) => {
  try {
    const result = await deleteCollection('posts');
    res.json({
      status: 'success',
      message: `Deleted ${result.deleted} post(s)`,
      deleted: result.deleted,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/cleanup/all
 * Delete all collections
 */
router.delete('/all', async (req, res) => {
  try {
    const collections = [
      'users',
      'posts',
      'comments',
      'follows',
      'connections',
      'chats',
    ];

    let totalDeleted = 0;
    const results = [];

    for (const collectionName of collections) {
      const result = await deleteCollection(collectionName);
      if (result.success) {
        totalDeleted += result.deleted;
        results.push({
          collection: collectionName,
          deleted: result.deleted,
        });
      }
    }

    res.json({
      status: 'success',
      message: `Cleanup complete! Deleted ${totalDeleted} total documents`,
      totalDeleted,
      details: results,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * GET /api/cleanup/status
 * Check if cleanup is available
 */
router.get('/status', (req, res) => {
  res.json({
    cleanupAvailable: process.env.NODE_ENV === 'development',
    environment: process.env.NODE_ENV,
    endpoints: {
      deleteUsers: 'DELETE /api/cleanup/users',
      deletePosts: 'DELETE /api/cleanup/posts',
      deleteAll: 'DELETE /api/cleanup/all',
    },
  });
});

module.exports = router;
