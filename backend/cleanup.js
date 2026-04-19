/**
 * Database Cleanup Script for Testing
 * 
 * WARNING: This script DELETES data from the database!
 * Only use in development/test environments!
 * 
 * Usage:
 *   node cleanup.js          - Delete all users
 *   node cleanup.js --all    - Delete ALL collections
 *   node cleanup.js --users  - Delete only users
 *   node cleanup.js --posts  - Delete only posts
 */

require('dotenv').config();
const mongoose = require('mongoose');

const args = process.argv.slice(2);
const cleanupType = args[0] || '--users';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`),
};

async function connectDB() {
  try {
    log.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log.success('Connected to MongoDB');
    return true;
  } catch (error) {
    log.error(`Failed to connect: ${error.message}`);
    return false;
  }
}

async function deleteCollection(collectionName) {
  try {
    const collection = mongoose.connection.collection(collectionName);
    const result = await collection.deleteMany({});
    log.success(`Deleted ${result.deletedCount} documents from ${collectionName}`);
    return result.deletedCount;
  } catch (error) {
    log.error(`Failed to delete from ${collectionName}: ${error.message}`);
    return 0;
  }
}

async function cleanupUsers() {
  log.section('🗑️  DELETING USERS');
  log.warning('This will delete ALL users from the database!');
  
  const count = await deleteCollection('users');
  
  if (count > 0) {
    log.success(`\nCleanup complete! Deleted ${count} user(s)`);
  } else {
    log.info('No users found to delete');
  }
}

async function cleanupPosts() {
  log.section('🗑️  DELETING POSTS');
  
  const count = await deleteCollection('posts');
  
  if (count > 0) {
    log.success(`\nCleanup complete! Deleted ${count} post(s)`);
  } else {
    log.info('No posts found to delete');
  }
}

async function cleanupAll() {
  log.section('🗑️  DELETING ALL COLLECTIONS');
  log.error('⚠️  WARNING: This will DELETE EVERYTHING in the database!');
  
  const collections = [
    'users',
    'posts',
    'comments',
    'follows',
    'connections',
    'chats',
  ];

  let totalDeleted = 0;

  for (const collection of collections) {
    const count = await deleteCollection(collection);
    totalDeleted += count;
  }

  log.success(`\n✅ Cleanup complete! Deleted ${totalDeleted} total documents`);
}

async function main() {
  log.section('📊 DATABASE CLEANUP SCRIPT');
  log.warning(`⚠️  ENVIRONMENT: ${process.env.NODE_ENV || 'development'}`);
  log.info(`📁 Database: ${process.env.MONGO_URI.split('/').pop()}`);

  if (!process.env.MONGO_URI) {
    log.error('MONGO_URI not found in .env file');
    process.exit(1);
  }

  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  try {
    switch (cleanupType) {
      case '--all':
        await cleanupAll();
        break;
      case '--users':
        await cleanupUsers();
        break;
      case '--posts':
        await cleanupPosts();
        break;
      case '--help':
        log.info('\nUsage: node cleanup.js [option]');
        log.info('\nOptions:');
        log.info('  --users   Delete all users (default)');
        log.info('  --posts   Delete all posts');
        log.info('  --all     Delete ALL collections');
        log.info('  --help    Show this help message');
        break;
      default:
        log.error(`Unknown option: ${cleanupType}`);
        log.info('Use --help for usage information');
        process.exit(1);
    }

    log.info('\n✅ All done!');
  } catch (error) {
    log.error(`\nCleanup failed: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log.success('Database connection closed');
    process.exit(0);
  }
}

main();
