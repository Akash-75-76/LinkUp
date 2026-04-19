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
  getSentConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getUserProfileById,
  followUser,
  unfollowUser,
  getFollowersCount,
  getFollowingCount,
  checkIfFollowing
} from "../controllers/user.controller.js";
import upload from "../middleware/fileUpload.js";

const router = Router();

// ✅ Registration route with optional profile picture upload (memory storage -> S3)
router.route("/register").post(upload.single("profile_pic"), register);

// Profile picture upload route (uses memory storage -> S3)
router.post(
  "/update_profile_pic",
  upload.single("profile_pic"),
  uploadProfilePic
);



// Authentication routes
router.route("/login").post(login);

// User profile routes
router.route("/user_update").post(updateUserProfile);
router.route("/getUserAndProfile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);

// User data routes
router.route("/all").get(getAllUsers);
router.get('/download_profile', downloadProfile);
router.get('/profile/:userId', getUserProfileById);

// Connection routes
router.post("/send_connection_request", sendConnectionRequest);
router.get("/my_connection_requests", getMyConnectionRequests);
router.get("/my_connections", whatAreMyConnections);
router.get("/sent_connection_requests", getSentConnectionRequests);
router.post("/accept_connection", acceptConnectionRequest);
router.post("/reject_connection", rejectConnectionRequest);
router.post("/remove_connection", removeConnection);
// Follow routes
router.post('/follow', followUser);
router.post('/unfollow', unfollowUser);
router.get('/following_count', getFollowingCount);
router.get('/followers_count', getFollowersCount);
router.get('/check_following', checkIfFollowing);
export default router;