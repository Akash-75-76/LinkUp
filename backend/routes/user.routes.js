import { Router } from "express";
import { register, login } from "../controllers/user.controller.js";
import { uploadProfilePic } from "../controllers/user.controller.js";
import { updateUserProfile } from "../controllers/user.controller.js";
import { getUserAndProfile } from "../controllers/user.controller.js";
import { updateProfileData } from "../controllers/user.controller.js";
import { getAllUsers } from "../controllers/user.controller.js";
import { downloadProfile } from "../controllers/user.controller.js";
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

router.post(
  "/update_profile_pic",
  upload.single("profile_pic"),
  uploadProfilePic
);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/all").get(getAllUsers);
router.get('/download_profile', downloadProfile);
export default router;
