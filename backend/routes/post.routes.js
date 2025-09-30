import { Router } from "express";
import { 
  activeCheck, 
  createPost, 
  getAllPosts,
  getUserPosts,
  deletePost,
  commentPost,
  get_comment_by_postId,
  delete_comment_of_user,
  incrementLikes  // ✅ Add missing import
} from "../controllers/post.controller.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
router.get('/', activeCheck);
router.post('/create_post', upload.single("media"), createPost);
router.get('/all_posts', getAllPosts);
router.get('/user_posts', getUserPosts);
router.delete('/delete_post', deletePost);
router.post('/comment', commentPost);  // ✅ Fixed route name consistency
router.get('/comments/:postId', get_comment_by_postId);  // ✅ Add comment routes
router.delete('/delete_comment', delete_comment_of_user);  // ✅ Add comment routes
router.post('/like', incrementLikes);  // ✅ Fixed route name

export default router;  // ✅ Fixed export syntax