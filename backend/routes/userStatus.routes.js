import { Router } from "express";
import { updateUserStatus, getUserStatus } from "../controllers/userStatus.controller.js";

const router = Router();

router.post('/update_status', updateUserStatus);
router.get('/status/:userId', getUserStatus);

export default router;