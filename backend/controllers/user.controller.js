import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Profile from "../models/profile.model.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import ConnectionRequest from "../models/connections.model.js";
import Follow from "../models/follow.model.js";
import { uploadToS3, deleteFromS3 } from "../config/s3.js";
import Post from "../models/posts.model.js";
import { Notification } from "../models/chat.model.js";
import { emitToUser, emitRelationshipUpdate } from "../socket.js";
const convertUserDataTOPDF = async (userProfile) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const fullPath = path.join("uploads", outputPath);

  const stream = fs.createWriteStream(fullPath);
  doc.pipe(stream);

  // Add profile picture with error handling
  if (userProfile.userId.profilePicture && userProfile.userId.profilePicture !== "default.jpg") {
    try {
      const imagePath = path.join("uploads", userProfile.userId.profilePicture);
      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, {
          fit: [100, 100],
          align: "center"
        });
        doc.moveDown();
      }
    } catch (error) {
      console.error("Error adding profile picture to PDF:", error);
    }
  }

  // Rest of your content...
  doc.fontSize(14).text(`Name: ${userProfile.userId.name}`);
  doc.fontSize(14).text(`Username: ${userProfile.userId.username}`);
  // ... rest of your existing content

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
};

export const register = async (req, res) => {
  try {
    console.log("=== BACKEND DEBUG: REQUEST RECEIVED ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("=== END BACKEND DEBUG ===");

    if (!req.body) {
      return res.status(400).json({ message: "No data received" });
    }

    let { name, username, email, password, bio, currentPost, education, pastWork } = req.body;
    
    // ✅ Parse JSON strings from FormData
    try {
      if (typeof education === 'string') {
        education = JSON.parse(education);
      }
      if (typeof pastWork === 'string') {
        pastWork = JSON.parse(pastWork);
      }
    } catch (parseError) {
      console.warn("Error parsing education/pastWork JSON:", parseError);
      education = education || [];
      pastWork = pastWork || [];
    }
    
    // ✅ FIX: Remove JSON parsing - use arrays directly
    console.log("Education received:", education);
    console.log("Past Work received:", pastWork);
    console.log("Education type:", typeof education);
    console.log("Past Work type:", typeof pastWork);

    // ✅ Handle profile picture upload to S3
    let profilePicture = "default.jpg";
    if (req.file) {
      try {
        const s3Url = await uploadToS3(req.file.buffer, req.file.originalname, 'profile-pictures');
        profilePicture = s3Url;
        console.log("Profile picture uploaded to S3:", profilePicture);
      } catch (error) {
        console.error("Failed to upload profile picture to S3:", error);
        // Continue with default if S3 upload fails
      }
    }

    console.log("=== BACKEND DEBUG: PARSED DATA ===");
    console.log("Basic info:", { name, username, email });
    console.log("Profile info:", { bio, currentPost });
    console.log("Education:", education);
    console.log("Education length:", education ? education.length : 0);
    console.log("Past Work:", pastWork);
    console.log("Past Work length:", pastWork ? pastWork.length : 0);
    console.log("=== END BACKEND DEBUG ===");

    // Validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All required fields are missing" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      profilePicture: profilePicture,
    });
    await newUser.save();

    // Create profile with all the data
    const profileData = {
      userId: newUser._id,
      bio: bio || "",
      currentPost: currentPost || "",
      // ✅ FIX: Use arrays directly
      education: education || [],
      pastWork: pastWork || []
    };

    console.log("=== BACKEND DEBUG: FINAL PROFILE DATA ===");
    console.log("Profile data being saved:", profileData);
    console.log("=== END BACKEND DEBUG ===");

    const profile = new Profile(profileData);
    await profile.save();
    
    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: newUser._id }, { $set: { token } });
    
    return res.status(201).json({ 
      message: "User registered successfully", 
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        profilePicture: newUser.profilePicture
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: user._id }, { $set: { token } });
    
    // ✅ FIXED: Return user data along with token
    return res.status(200).json({ 
      message: "Login successful", 
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
    
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// Upload profile picture to S3
export const uploadProfilePic = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ token });
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      // Upload to S3
      const s3Url = await uploadToS3(req.file.buffer, req.file.originalname, 'profile-pictures');
      
      console.log("Profile picture uploaded to S3:", {
        userId: user._id,
        s3Url: s3Url
      });

      // Delete old profile picture from S3 if exists and not default
      if (user.profilePicture && user.profilePicture !== "default.jpg" && user.profilePicture.includes('s3')) {
        try {
          await deleteFromS3(user.profilePicture);
        } catch (deleteError) {
          console.warn("Failed to delete old profile picture from S3:", deleteError);
        }
      }

      // Update user with new profile picture URL
      user.profilePicture = s3Url;
      await user.save();

      return res.status(200).json({ 
        message: "Profile picture uploaded successfully",
        profilePicture: s3Url 
      });
    } catch (s3Error) {
      console.error("S3 upload error:", s3Error);
      return res.status(500).json({ message: "Failed to upload to S3: " + s3Error.message });
    }
  } catch (error) {
    console.error("Profile picture upload error:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    const { username, email } = newUserData;
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id !== user._id) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id !== user._id) {
        return res.status(400).json({ message: "Email already taken" });
      }
    }

    await User.updateOne({ _id: user._id }, { $set: newUserData });
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    // Get token from query
    const { token } = req.query;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );

    return res.status(200).json({ user, userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;
    const userProfile = await User.findOne({ token: token });
    if (!userProfile) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });
    Object.assign(profile_to_update, newProfileData);
    await profile_to_update.save();
    return res
      .status(200)
      .json({ message: "Profile data updated successfully" });
  } catch (error) {
    console.error("Update profile data error:", error);
    return res.status(500).json({ message: error.message || "Failed to update profile data" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password -token").lean();
    
    // Get counts for each user
    const usersWithCounts = await Promise.all(users.map(async (user) => {
      const userIdObj = new mongoose.Types.ObjectId(user._id);
      
      const postsCount = await Post.countDocuments({ userId: userIdObj });
      const followersCount = await Follow.countDocuments({ followingId: userIdObj });
      const connectionsCount = await ConnectionRequest.countDocuments({
        $or: [
          { userId: userIdObj, status: 'accepted' },
          { connectionId: userIdObj, status: 'accepted' }
        ]
      });

      console.log(`User: ${user.username}, Posts: ${postsCount}, Followers: ${followersCount}, Conns: ${connectionsCount}`);
      
      return {
        ...user,
        postsCount,
        followersCount,
        connectionsCount
      };
    }));

    return res.status(200).json(usersWithCounts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.user_id;

    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name email username profilePicture"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const filename = `profile_${userProfile.userId.username}.pdf`;
    const filePath = path.join("uploads", filename);
    
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");

    const doc = new PDFDocument({
      bufferPages: true,
      size: "A4",
      margin: 0,
    });

    const fileStream = fs.createWriteStream(filePath);
    doc.pipe(fileStream);
    doc.pipe(res);

    const theme = {
      headerBg: "#0f172a",
      headerAccent: "#312e81",
      accent: "#6366f1",
      accentSoft: "#eef2ff",
      text: "#1e293b",
      textMuted: "#64748b",
      border: "#e2e8f0",
      card: "#f8fafc",
      white: "#ffffff",
    };

    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const padX = 48;
    const contentW = pageW - padX * 2;
    const headerH = 148;
    const avatarSize = 96;
    const avatarR = 14;

    const ensureSpace = (needed = 72) => {
      if (doc.y + needed > pageH - 56) {
        doc.addPage();
        doc.fillColor(theme.white).rect(0, 0, pageW, pageH).fill();
        doc.y = 48;
      }
    };

    const drawSectionLabel = (label) => {
      ensureSpace(48);
      const y0 = doc.y;
      doc.rect(padX, y0 + 2, 3, 13).fill(theme.accent);
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(theme.textMuted)
        .text(label.toUpperCase(), padX + 10, y0, { width: contentW - 14 });
      doc.moveDown(0.85);
    };

    // ── Header (dark band + optional rounded photo) ──
    doc.rect(0, 0, pageW, headerH).fill(theme.headerBg);
    doc.rect(0, headerH - 36, pageW, 36).fill(theme.headerAccent);

    const pic = userProfile.userId.profilePicture;
    const wantsPhoto =
      pic &&
      pic !== "default.jpg" &&
      pic !== "default.png";

    let photoRendered = false;
    if (wantsPhoto) {
      try {
        const imagePath = path.join("uploads", userProfile.userId.profilePicture);
        if (fs.existsSync(imagePath)) {
          const ax = padX;
          const ay = 32;
          doc.save();
          doc.roundedRect(ax, ay, avatarSize, avatarSize, avatarR).clip();
          doc.image(imagePath, ax, ay, {
            width: avatarSize,
            height: avatarSize,
            align: "center",
            valign: "center",
          });
          doc.restore();
          doc
            .lineWidth(2.5)
            .strokeColor("#ffffff")
            .roundedRect(ax, ay, avatarSize, avatarSize, avatarR)
            .stroke();
          photoRendered = true;
        }
      } catch (imageError) {
        console.error("Error adding profile picture:", imageError);
      }
    }

    if (!photoRendered) {
      const initials = (userProfile.userId.name || "?")
        .split(/\s+/)
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      doc.roundedRect(padX, 32, avatarSize, avatarSize, avatarR).fill("#475569");
      doc
        .font("Helvetica-Bold")
        .fontSize(28)
        .fillColor("#e2e8f0")
        .text(initials, padX, 32 + avatarSize / 2 - 12, {
          width: avatarSize,
          align: "center",
        });
    }

    const textLeft = padX + avatarSize + 22;
    const nameY = 38;
    doc
      .font("Helvetica-Bold")
      .fontSize(26)
      .fillColor(theme.white)
      .text(userProfile.userId.name, textLeft, nameY, { width: pageW - textLeft - padX });
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#94a3b8")
      .text(`@${userProfile.userId.username}`, textLeft, nameY + 32, { width: pageW - textLeft - padX });
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#cbd5e1")
      .text(userProfile.userId.email, textLeft, nameY + 50, { width: pageW - textLeft - padX });

    if (userProfile.currentPost) {
      doc
        .font("Helvetica-Oblique")
        .fontSize(10.5)
        .fillColor("#a5b4fc")
        .text(userProfile.currentPost, textLeft, nameY + 72, {
          width: pageW - textLeft - padX,
          lineGap: 2,
        });
    }

    doc.x = padX;
    doc.y = headerH + 28;

    // ── Summary / About ──
    if (userProfile.bio) {
      drawSectionLabel("Profile");
      doc
        .font("Helvetica")
        .fontSize(10.5)
        .fillColor(theme.text)
        .text(userProfile.bio, {
          width: contentW,
          lineGap: 4,
          align: "left",
        });
      doc.moveDown(1.1);
    }

    // ── Work experience ──
    drawSectionLabel("Experience");
    if (userProfile.pastWork && userProfile.pastWork.length > 0) {
      userProfile.pastWork.forEach((work, index) => {
        const company = work.company || "Company";
        const role = work.position || "Role";
        const years = work.years || "";
        const meta = [role, years].filter(Boolean).join(" · ");
        const desc = work.description ? String(work.description) : "";

        doc.font("Helvetica").fontSize(9.5);
        const descH = desc
          ? doc.heightOfString(desc, {
              width: contentW - 28,
              lineGap: 2,
            })
          : 0;
        const blockH = Math.max(58, 44 + (desc ? 8 + descH : 0));

        ensureSpace(blockH + 14);
        const blockTop = doc.y;

        doc.fillColor(theme.accentSoft).roundedRect(padX, blockTop, contentW, blockH, 6).fill();
        doc.strokeColor(theme.border).lineWidth(0.4).roundedRect(padX, blockTop, contentW, blockH, 6).stroke();

        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .fillColor(theme.text)
          .text(company, padX + 14, blockTop + 12, { width: contentW - 28 });
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor(theme.accent)
          .text(meta, padX + 14, blockTop + 30, { width: contentW - 28 });
        if (desc) {
          doc
            .font("Helvetica")
            .fontSize(9.5)
            .fillColor(theme.textMuted)
            .text(desc, padX + 14, blockTop + 46, {
              width: contentW - 28,
              lineGap: 2,
            });
        }

        doc.y = blockTop + blockH + (index < userProfile.pastWork.length - 1 ? 10 : 6);
      });
    } else {
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor(theme.textMuted)
        .text("No work experience listed yet.", { width: contentW });
      doc.moveDown(0.6);
    }

    doc.moveDown(0.9);

    // ── Education ──
    drawSectionLabel("Education");
    if (userProfile.education && userProfile.education.length > 0) {
      userProfile.education.forEach((edu, index) => {
        const school = edu.school || "School";
        const degreeParts = [edu.degree, edu.fieldOfStudy, edu.years].filter(Boolean);
        const degreeLine =
          degreeParts.length > 0
            ? degreeParts.join(" · ")
            : "Program";

        doc.font("Helvetica").fontSize(10);
        const lineH = doc.heightOfString(degreeLine, { width: contentW - 28 });
        const eduBlockH = Math.max(58, 42 + Math.min(lineH, 48));

        ensureSpace(eduBlockH + 18);
        const blockTop = doc.y;

        doc.fillColor("#f0fdf4").roundedRect(padX, blockTop, contentW, eduBlockH, 6).fill();
        doc.strokeColor("#bbf7d0").lineWidth(0.35).roundedRect(padX, blockTop, contentW, eduBlockH, 6).stroke();

        doc
          .font("Helvetica-Bold")
          .fontSize(11.5)
          .fillColor(theme.text)
          .text(school, padX + 14, blockTop + 12, { width: contentW - 28 });
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#15803d")
          .text(degreeLine, padX + 14, blockTop + 30, { width: contentW - 28 });

        doc.y = blockTop + eduBlockH + (index < userProfile.education.length - 1 ? 10 : 6);
      });
    } else {
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor(theme.textMuted)
        .text("No education entries yet.", { width: contentW });
    }

    doc.moveDown(1);

    // ── Footer (follows content; avoids overlap) ──
    ensureSpace(40);
    const footerLineY = doc.y + 4;
    doc
      .moveTo(padX, footerLineY)
      .lineTo(pageW - padX, footerLineY)
      .strokeColor(theme.border)
      .lineWidth(0.75)
      .stroke();
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor("#94a3b8")
      .text(
        `LinkUp · Resume export · ${new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}`,
        padX,
        footerLineY + 10,
        { width: contentW, align: "center" }
      );

    doc.end();

    // Wait for file to be saved
    fileStream.on('finish', () => {
      console.log(`PDF saved to: ${filePath}`);
    });

  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ message: error.message });
  }
};


// In sendConnectionRequest - Add better error handling
export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  
  try {
    const user = await User.findOne({ token });
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    
    // Prevent self-connection
    if (user._id.toString() === connectionId) {
      return res.status(400).json({ message: "Cannot send connection request to yourself" });
    }
    
    const connectionUser = await User.findById(connectionId);
    if (!connectionUser) {
      return res.status(404).json({ message: "User to connect not found" });
    }
    
    // Check if request already exists in either direction
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { userId: user._id, connectionId: connectionId },
        { userId: connectionId, connectionId: user._id }
      ]
    });
    
    if (existingRequest) {
      return res.status(400).json({ 
        message: "Connection request already exists",
        existingRequest 
      });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionId
    });
    
    await request.save();

    try {
      const connNotif = new Notification({
        type: "connection_request",
        from: user._id,
        to: connectionUser._id,
        message: `${user.name} sent you a connection request`,
        metadata: { requestId: request._id.toString() },
      });
      await connNotif.save();
      await connNotif.populate("from", "name username profilePicture");
      if (req.io) {
        emitToUser(
          req.io,
          connectionUser._id,
          "notification",
          connNotif.toObject()
        );
      }
    } catch (notifErr) {
      console.error("Connection request notification error:", notifErr);
    }

    return res.status(200).json({
      message: "Connection request sent successfully",
      requestId: request._id,
    });
  } catch (error) {
    console.error("Error sending connection request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getMyConnectionRequests = async (req, res) => {
  const { token } = req.query;
  try {
    // ✅ Fix: Use findOne instead of find
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    
    // ✅ Get requests sent TO the current user (pending requests)
    const requests = await ConnectionRequest.find({ 
      connectionId: user._id, 
      status: 'pending' 
    }).populate('userId', 'name username email profilePicture');
    
    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const whatAreMyConnections = async (req, res) => {
  const { token } = req.query;
  try {
    // ✅ Fix: Use findOne instead of find
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    
    // ✅ Get all accepted connections where user is either userId OR connectionId
    const connections = await ConnectionRequest.find({
      $or: [
        { userId: user._id, status: 'accepted' },
        { connectionId: user._id, status: 'accepted' }
      ]
    })
    .populate('userId', 'name username email profilePicture')
    .populate('connectionId', 'name username email profilePicture');
    
    return res.status(200).json(connections);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSentConnectionRequests = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    
    // Get requests sent BY the current user
    const sentRequests = await ConnectionRequest.find({ 
      userId: user._id,
      status: 'pending'
    })
    .populate('connectionId', 'name username email profilePicture')
    .sort({ createdAt: -1 });
    
    return res.status(200).json(sentRequests);
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId } = req.body;
  
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const connectionRequest = await ConnectionRequest.findById(requestId);
    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (connectionRequest.connectionId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    connectionRequest.status = 'accepted';
    await connectionRequest.save();

    // Populate the fields so the frontend can add it to connections immediately
    await connectionRequest.populate('userId', 'name username email profilePicture');
    await connectionRequest.populate('connectionId', 'name username email profilePicture');

    const senderId = connectionRequest.userId._id || connectionRequest.userId;

    try {
      const acceptedNotif = new Notification({
        type: "connection_accepted",
        from: user._id,
        to: senderId,
        message: `${user.name} accepted your connection request`,
        metadata: { requestId: connectionRequest._id.toString() },
      });
      await acceptedNotif.save();
      await acceptedNotif.populate("from", "name username profilePicture");
      if (req.io) {
        emitToUser(req.io, senderId, "notification", acceptedNotif.toObject());
      }
    } catch (notifErr) {
      console.error("Accept notification error:", notifErr);
    }

    const relPayload = {
      type: "connection_accepted",
      userId: String(senderId),
      connectionId: String(user._id),
      connection: connectionRequest.toObject({ virtuals: true }),
    };
    if (req.io) {
      emitRelationshipUpdate(req.io, relPayload);
    }

    return res.status(200).json({
      message: "Connection request accepted",
      connection: connectionRequest,
    });
  } catch (error) {
    console.error("Error accepting connection:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  const { token, requestId } = req.body;
  
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const connectionRequest = await ConnectionRequest.findById(requestId);
    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (connectionRequest.connectionId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    connectionRequest.status = 'rejected';
    await connectionRequest.save();

    return res.status(200).json({ message: "Connection request rejected" });
  } catch (error) {
    console.error("Error rejecting connection:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeConnection = async (req, res) => {
  const { token, connectionId } = req.body;
  
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    // Delete connection regardless of who initiated it
    await ConnectionRequest.deleteMany({
      $or: [
        { userId: user._id, connectionId: connectionId },
        { userId: connectionId, connectionId: user._id }
      ],
      status: 'accepted'
    });

    return res.status(200).json({ message: "Connection removed successfully" });
  } catch (error) {
    console.error("Error removing connection:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("Fetching profile for user ID:", userId); // Debug log

    // First, try to find the profile with populated user data
    const profile = await Profile.findOne({ userId })
      .populate('userId', 'name username email profilePicture');
    
    if (!profile) {
      console.log("Profile not found for user ID:", userId);
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log("Profile found:", {
      hasUserId: !!profile.userId,
      userId: profile.userId?._id,
      name: profile.userId?.name,
      bio: profile.bio,
      education: profile.education,
      pastWork: profile.pastWork
    }); // Debug log

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const followUser = async (req, res) => {
  const { token, followingId } = req.body;

  try {
    const follower = await User.findOne({ token });
    if (!follower) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent self-follow
    if (follower._id.toString() === followingId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId: follower._id,
      followingId: followingId
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Create follow relationship
    const follow = new Follow({
      followerId: follower._id,
      followingId: followingId
    });

    await follow.save();

    return res.status(201).json({ 
      message: "Successfully followed user",
      follow 
    });
  } catch (error) {
    console.error("Follow user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  const { token, followingId } = req.body;

  try {
    const follower = await User.findOne({ token });
    if (!follower) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await Follow.findOneAndDelete({
      followerId: follower._id,
      followingId: followingId
    });

    if (!result) {
      return res.status(404).json({ message: "Not following this user" });
    }

    return res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Unfollow user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get following count
export const getFollowingCount = async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const followingCount = await Follow.countDocuments({
      followerId: userId
    });

    return res.status(200).json({
      count: followingCount,
      userId: userId
    });
  } catch (error) {
    console.error("Get following count error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get followers count
export const getFollowersCount = async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const followersCount = await Follow.countDocuments({
      followingId: userId
    });

    return res.status(200).json({
      count: followersCount,
      userId: userId
    });
  } catch (error) {
    console.error("Get followers count error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Check if current user is following another user
export const checkIfFollowing = async (req, res) => {
  const { token, targetUserId } = req.query;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = await Follow.findOne({
      followerId: user._id,
      followingId: targetUserId
    });

    return res.status(200).json({
      isFollowing: !!isFollowing,
      followerId: user._id,
      followingId: targetUserId
    });
  } catch (error) {
    console.error("Check following error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};