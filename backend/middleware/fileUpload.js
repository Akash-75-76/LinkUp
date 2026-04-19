import multer from 'multer';

// Use memory storage since we'll upload to S3, not disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images and videos
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'));
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
