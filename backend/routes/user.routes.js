import { Router } from "express";
import { 
  register, 
  login, 
  uploadProfilePic, 
  updateUserProfile, 
  getUserAndProfile, 
  updateProfileData, 
  getAllUsers, 
  downloadProfile,
  sendConnectionRequest,
  getMyConnectionRequests,
  whatAreMyConnections,
  getSentConnectionRequests
} from "../controllers/user.controller.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Profile picture upload route
router.post(
  "/update_profile_pic",
  upload.single("profile_pic"),
  uploadProfilePic
);

// Authentication routes
router.route("/register").post(register);
router.route("/login").post(login);

// User profile routes
router.route("/user_update").post(updateUserProfile);
router.route("/getUserAndProfile").get(getUserAndProfile);

router.route("/update_profile_data").post(updateProfileData);

// User data routes
router.route("/all").get(getAllUsers);
router.get('/download_profile', downloadProfile);

// Connection routes
router.post("/send_connection_request", sendConnectionRequest);
router.get("/my_connection_requests", getMyConnectionRequests);
router.get("/my_connections", whatAreMyConnections);
router.get("/sent_connection_requests", getSentConnectionRequests);

export default router;