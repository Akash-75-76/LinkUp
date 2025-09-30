import { Router } from "express";
import { register, login } from "../controllers/user.controller.js";
import { uploadProfilePic } from "../controllers/user.controller.js";
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
export default router;
