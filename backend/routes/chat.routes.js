import { Router } from "express";
import { 
  sendMessage, 
  sendImageMessage, 
  getChatHistory, 
  getChatRooms, 
  markMessagesAsRead 
} from "../controllers/chat.controller.js";
import upload from "../middleware/fileUpload.js";

const router = Router();

router.post('/send_message', sendMessage);
router.post('/send_image', upload.single('image'), sendImageMessage);
router.get('/chat_history', getChatHistory);
router.get('/chat_rooms', getChatRooms);
router.post('/mark_as_read', markMessagesAsRead);

export default router;