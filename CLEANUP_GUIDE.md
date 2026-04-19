# 🗑️ Database Cleanup Guide

**Two methods to delete data for testing**

---

## 🔧 Method 1: Command Line Script (Recommended)

**Fastest way to cleanup your database locally**

### Setup (One-time)

```bash
cd d:\ApnaCollege\LinkUp\backend
npm install dotenv mongoose
```

### Usage

```bash
# Delete all users
node cleanup.js

# Delete all users (explicit)
node cleanup.js --users

# Delete all posts
node cleanup.js --posts

# Delete EVERYTHING
node cleanup.js --all

# Show help
node cleanup.js --help
```

### Example Output

```
━━━━━━━━━━━━━━━━━━━━━━
📊 DATABASE CLEANUP SCRIPT
━━━━━━━━━━━━━━━━━━━━━━

ℹ ⚠️  ENVIRONMENT: development
ℹ 📁 Database: linkup
ℹ Connecting to MongoDB...
✓ Connected to MongoDB

━━━━━━━━━━━━━━━━━━━━━━
🗑️  DELETING USERS
━━━━━━━━━━━━━━━━━━━━━━

✓ Deleted 15 documents from users
✓ Cleanup complete! Deleted 15 user(s)
✓ All done!
✓ Database connection closed
```

### What It Does

**`--users`** (Default):
- Deletes all documents from `users` collection
- Keeps posts, comments, and other data

**`--posts`**:
- Deletes all documents from `posts` collection

**`--all`**:
- Deletes from ALL collections:
  - ✗ users
  - ✗ posts
  - ✗ comments
  - ✗ follows
  - ✗ connections
  - ✗ chats

---

## 🌐 Method 2: HTTP API Endpoints (Optional)

**Trigger cleanup via REST API calls**

### Setup

1. In `backend/server.js`, add this route:

```javascript
// Add near other route imports
const cleanupRoutes = require('./routes/cleanup.routes');

// Add this in your route middleware section (only if development)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/cleanup', cleanupRoutes);
}
```

2. Restart your backend server

### API Endpoints

#### Check if cleanup is available
```bash
GET http://localhost:5000/api/cleanup/status
```

**Response:**
```json
{
  "cleanupAvailable": true,
  "environment": "development",
  "endpoints": {
    "deleteUsers": "DELETE /api/cleanup/users",
    "deletePosts": "DELETE /api/cleanup/posts",
    "deleteAll": "DELETE /api/cleanup/all"
  }
}
```

#### Delete all users
```bash
DELETE http://localhost:5000/api/cleanup/users
```

**Response:**
```json
{
  "status": "success",
  "message": "Deleted 15 user(s)",
  "deleted": 15
}
```

#### Delete all posts
```bash
DELETE http://localhost:5000/api/cleanup/posts
```

#### Delete everything
```bash
DELETE http://localhost:5000/api/cleanup/all
```

**Response:**
```json
{
  "status": "success",
  "message": "Cleanup complete! Deleted 50 total documents",
  "totalDeleted": 50,
  "details": [
    { "collection": "users", "deleted": 15 },
    { "collection": "posts", "deleted": 20 },
    { "collection": "comments", "deleted": 10 },
    { "collection": "follows", "deleted": 0 },
    { "collection": "connections", "deleted": 5 },
    { "collection": "chats", "deleted": 0 }
  ]
}
```

### Test with Postman

**Setup:**
1. Open Postman
2. Create new request
3. Set method to `DELETE`
4. Enter URL: `http://localhost:5000/api/cleanup/users`
5. Click **Send**

**Or use curl:**
```bash
curl -X DELETE http://localhost:5000/api/cleanup/users
```

---

## 🎯 Quick Comparison

| Aspect | Script | API |
|--------|--------|-----|
| Speed | ⚡ Very fast | ⚡ Fast |
| Setup | Simple | Requires server change |
| Location | Local terminal | From anywhere |
| Schedule | Manual run | Can automate |
| Safe | ✓ Dev only | ✓ Dev only |
| Details | Detailed output | JSON response |

---

## ⚠️ Safety Features

Both methods have protections:

✅ **Only works in development environment**
```javascript
if (process.env.NODE_ENV !== 'development') {
  // Refuse to cleanup
}
```

✅ **Connects via MONGO_URI from .env**
- Won't work if database URL is wrong
- Won't work if MONGO_URI is missing

✅ **Detailed output**
- Shows exactly what was deleted
- Shows error messages if something fails

---

## 🔍 Common Scenarios

### Scenario 1: "I want to test user registration"

```bash
# Clear old test users
node cleanup.js --users

# Now register new test users
```

### Scenario 2: "I want to test from scratch"

```bash
# Delete everything
node cleanup.js --all

# Now upload new test data
```

### Scenario 3: "I just want to delete posts"

```bash
# Keep users, delete posts
node cleanup.js --posts

# Users still exist, posts are gone
```

### Scenario 4: "Automated testing cleanup"

Create a test script:

```bash
# test.sh (Windows: test.bat)
#!/bin/bash
node cleanup.js --all
npm test
```

Then run: `bash test.sh`

---

## 🆘 Troubleshooting

### Error: "MONGO_URI not found in .env file"

**Solution:** Make sure `.env` file exists in `backend/` folder:
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/linkup
```

### Error: "Failed to connect"

**Solution:** Check your MongoDB Atlas:
1. Is cluster running?
2. Is IP address whitelisted?
3. Are credentials correct?

### Script says "0 documents deleted"

**Possible causes:**
- Database is already empty ✓ (that's okay)
- Collection name is wrong
- Connected to wrong database

### API returns 403 error

**Solution:** Cleanup routes are only enabled in development:
```bash
# Make sure your .env has:
NODE_ENV=development
```

---

## 📋 File Locations

```
backend/
├── cleanup.js              ← Script to run
└── routes/
    └── cleanup.routes.js   ← API routes (optional)
```

---

## ✅ Testing Workflow

**Recommended workflow:**

1. **Delete test data:**
   ```bash
   node cleanup.js --all
   ```

2. **Test registration:**
   - Create 3-5 test accounts

3. **Test core features:**
   - Create posts
   - Follow users
   - Send messages

4. **Delete and repeat:**
   ```bash
   node cleanup.js --all
   ```

---

## 🚀 Next Steps

Choose your cleanup method:

**Option A: Script (Recommended)**
```bash
cd d:\ApnaCollege\LinkUp\backend
node cleanup.js --users
```

**Option B: API (if you want HTTP endpoints)**
1. Edit `backend/server.js`
2. Add cleanup routes
3. Test with Postman or curl

---

**Happy testing! 🎉**

