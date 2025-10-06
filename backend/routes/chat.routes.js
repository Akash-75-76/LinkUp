import { Router } from "express";
import { 
  sendMessage, 
  sendImageMessage, 
  getChatHistory, 
  getChatRooms, 
  markMessagesAsRead 
} from "../controllers/chat.controller.js";
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

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post('/send_message', sendMessage);
router.post('/send_image', upload.single('image'), sendImageMessage);
router.get('/chat_history', getChatHistory);
router.get('/chat_rooms', getChatRooms);
router.post('/mark_as_read', markMessagesAsRead);

export default router;