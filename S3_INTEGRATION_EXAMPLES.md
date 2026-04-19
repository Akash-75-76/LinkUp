# 🖼️ S3 Integration Examples - How to Modify Your Controllers

This file shows exactly how to update your existing controllers to use AWS S3 for file uploads.

---

## Example 1: Profile Picture Upload (User Controller)

### BEFORE (Disk Storage)
```javascript
// controllers/user.controller.js - OLD CODE
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadProfilePic = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Saves file to disk
    const newUser = await User.updateOne({ _id: user._id }, {
      profilePicture: req.file.filename  // Just filename
    });
    
    return res.status(200).json({ message: "Profile picture updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

### AFTER (S3 Storage)
```javascript
// controllers/user.controller.js - NEW CODE
import { uploadToS3, deleteFromS3 } from '../config/s3.js';

export const uploadProfilePic = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Validate file
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Find user
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Delete old profile picture from S3 if it exists
    if (user.profilePicture && !user.profilePicture.includes('default')) {
      try {
        await deleteFromS3(user.profilePicture);
        console.log('Old profile picture deleted');
      } catch (err) {
        console.error('Error deleting old profile picture:', err);
        // Don't fail the upload if deletion fails
      }
    }
    
    // Upload new file to S3
    try {
      const s3Url = await uploadToS3(
        req.file.buffer,           // File content from memory
        req.file.originalname,     // Original filename
        'profile-pictures'         // Folder in S3
      );
      
      // Update user with S3 URL
      await User.updateOne(
        { _id: user._id },
        { profilePicture: s3Url }  // Store full S3 URL
      );
      
      return res.status(200).json({
        message: "Profile picture updated successfully",
        profilePicture: s3Url      // Return URL to frontend
      });
    } catch (uploadError) {
      console.error('S3 upload error:', uploadError);
      return res.status(500).json({
        message: "Failed to upload image to S3",
        error: uploadError.message
      });
    }
  } catch (error) {
    console.error('Profile upload error:', error);
    return res.status(500).json({ message: error.message });
  }
};
```

---

## Example 2: Create Post with Image (Post Controller)

### BEFORE (Disk Storage)
```javascript
// controllers/post.controller.js - OLD CODE
export const createPost = async (req, res) => {
  try {
    const { userId, caption } = req.body;
    
    // Get filename from disk upload
    const mediaPath = req.file ? req.file.filename : null;
    
    const newPost = new Post({
      userId,
      caption,
      media: mediaPath,  // Just filename
      createdAt: new Date(),
    });
    
    await newPost.save();
    
    return res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

### AFTER (S3 Storage)
```javascript
// controllers/post.controller.js - NEW CODE
import { uploadToS3, deleteFromS3 } from '../config/s3.js';

export const createPost = async (req, res) => {
  try {
    const { userId, caption } = req.body;
    
    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    let mediaUrl = null;
    
    // If file is provided, upload to S3
    if (req.file) {
      try {
        mediaUrl = await uploadToS3(
          req.file.buffer,
          req.file.originalname,
          'post-images'  // Folder in S3
        );
        console.log('Image uploaded to S3:', mediaUrl);
      } catch (uploadError) {
        console.error('S3 upload failed:', uploadError);
        return res.status(500).json({
          message: "Failed to upload image",
          error: uploadError.message
        });
      }
    }
    
    // Create post with S3 URL
    const newPost = new Post({
      userId,
      caption,
      media: mediaUrl,  // Full S3 URL, not just filename
      createdAt: new Date(),
    });
    
    await newPost.save();
    
    return res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });
  } catch (error) {
    console.error('Post creation error:', error);
    return res.status(500).json({ message: error.message });
  }
};
```

---

## Example 3: Delete Post with Image Cleanup

### BEFORE (Disk Storage)
```javascript
// OLD CODE - Delete file from disk
import fs from 'fs';
import path from 'path';

export const deletePost = async (req, res) => {
  try {
    const { postId, token } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Delete file from disk
    if (post.media) {
      const filePath = path.join('uploads', post.media);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete post from database
    await Post.deleteOne({ _id: postId });
    
    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

### AFTER (S3 Storage)
```javascript
// NEW CODE - Delete from S3
export const deletePost = async (req, res) => {
  try {
    const { postId, token } = req.body;
    
    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Verify ownership
    const user = await User.findOne({ token });
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }
    
    // Delete image from S3 if it exists
    if (post.media) {
      try {
        await deleteFromS3(post.media);
        console.log('Image deleted from S3:', post.media);
      } catch (err) {
        console.error('Error deleting from S3:', err);
        // Don't fail the post deletion if S3 delete fails
      }
    }
    
    // Delete post from database
    await Post.deleteOne({ _id: postId });
    
    return res.status(200).json({
      message: "Post and image deleted successfully"
    });
  } catch (error) {
    console.error('Post deletion error:', error);
    return res.status(500).json({ message: error.message });
  }
};
```

---

## Example 4: Get Posts with S3 URLs

### BEFORE (Disk Storage)
```javascript
// OLD CODE - Returns local file paths
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name username profilePicture')
      .sort({ createdAt: -1 });
    
    // Frontend had to construct path: /uploads/1234-image.jpg
    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

### AFTER (S3 Storage)
```javascript
// NEW CODE - Returns full S3 URLs
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name username profilePicture')
      .sort({ createdAt: -1 })
      .lean();  // Use lean() for better performance
    
    // Transform posts to include full S3 URLs
    const postsWithUrls = posts.map(post => ({
      ...post,
      media: post.media,  // Already full S3 URL, no transformation needed
      mediaUrl: post.media  // Optional: add as separate field
    }));
    
    return res.status(200).json({
      success: true,
      posts: postsWithUrls
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ message: error.message });
  }
};
```

---

## Example 5: Update Routes to Use Memory Multer

### BEFORE (Disk Storage Multer)
```javascript
// routes/user.routes.js - OLD CODE
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/update_profile_pic", upload.single("profile_pic"), uploadProfilePic);
```

### AFTER (Memory Storage Multer)
```javascript
// routes/user.routes.js - NEW CODE
import upload from '../middleware/fileUpload.js';

// Use the centralized memory storage middleware
router.post("/update_profile_pic", upload.single("profile_pic"), uploadProfilePic);
```

And your `middleware/fileUpload.js` looks like:
```javascript
// middleware/fileUpload.js
import multer from 'multer';

// Use memory storage since we upload to S3, not disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only images and videos
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: fileFilter,
});

export default upload;
```

---

## Example 6: Frontend - Update API Calls

### BEFORE (Assuming local path)
```javascript
// frontend - OLD CODE
const response = await axios.post(
  'http://localhost:5000/user/update_profile_pic',
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  }
);

// Image displayed as: /uploads/1234-photo.jpg
<img src={`/uploads/${user.profilePicture}`} />
```

### AFTER (Full S3 URL)
```javascript
// frontend - NEW CODE
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const response = await axios.post(
  `${BACKEND_URL}/user/update_profile_pic`,
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  }
);

// Backend returns full S3 URL
const s3Url = response.data.profilePicture;
// Example: https://linkup-media-bucket-2026.s3.amazonaws.com/profile-pictures/1714070400000-photo.jpg

// Image displayed directly from S3
<img src={user.profilePicture} alt="Profile" />
// No path transformation needed!
```

---

## Step-by-Step Integration Guide

### 1. Create S3 Config
```bash
# Create directory
mkdir -p backend/config

# Create s3.js file (copy from AWS_DEPLOYMENT_GUIDE.md)
# Place at: backend/config/s3.js
```

### 2. Create Memory Storage Middleware
```bash
# Create directory
mkdir -p backend/middleware

# Create fileUpload.js (copy from examples above)
# Place at: backend/middleware/fileUpload.js
```

### 3. Update package.json
```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

### 4. Update .env
```bash
# Add to backend/.env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=linkup-media-bucket-2026
```

### 5. Update Each Controller
Follow examples above to modify:
- `uploadProfilePic` in user.controller.js
- `createPost` in post.controller.js
- `deletePost` in post.controller.js
- Any other file upload handlers

### 6. Update Routes
Change from disk multer to memory multer:
```javascript
import upload from '../middleware/fileUpload.js';
```

### 7. Update Frontend (Optional)
Remove any path transformations since URLs are now full S3 URLs.

### 8. Test
```bash
# Start backend
npm run dev

# Upload a file
# Check backend logs for S3 URL
# Verify image appears in AWS S3 console
```

---

## 🆘 Troubleshooting Integration

### Error: "uploadToS3 is not defined"
**Solution:** Make sure you imported it:
```javascript
import { uploadToS3, deleteFromS3 } from '../config/s3.js';
```

### Error: "AWS credentials not configured"
**Solution:** Check .env file has these:
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=linkup-media-bucket-2026
```

### Error: "Access Denied" from S3
**Solution:** Check:
1. AWS credentials are correct
2. S3 bucket policy allows uploads
3. IAM user has S3 permissions

### File not appearing in S3
**Solution:** Check:
1. Backend logs for errors
2. S3 bucket exists
3. File size is under 50MB
4. File type is allowed (image/video)

---

## ✅ Checklist for Full Integration

- [ ] `backend/config/s3.js` created
- [ ] `backend/middleware/fileUpload.js` created
- [ ] `backend/.env` has AWS credentials
- [ ] `package.json` has @aws-sdk packages
- [ ] User controller updated for profile pictures
- [ ] Post controller updated for post images
- [ ] Routes updated to use memory multer
- [ ] Tests pass - images upload to S3
- [ ] Images appear in AWS S3 console
- [ ] Frontend loads images from S3 URLs

---

**Once all steps are complete, your LinkUp project is using AWS S3 for all file storage! 🎉**
