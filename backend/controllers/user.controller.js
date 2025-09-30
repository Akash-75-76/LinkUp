import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import Profile from "../models/profile.model.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const convertUserDataTOPDF = async (userProfile) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const fullPath = path.join("uploads", outputPath);

  const stream = fs.createWriteStream(fullPath);
  doc.pipe(stream);

  // Add profile picture with error handling
  if (userProfile.userId.profilePicture && userProfile.userId.profilePicture !== "default.png") {
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
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
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
    });
    await newUser.save();
    const profile = new Profile({ userId: newUser._id });
    await profile.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
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
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Token missing" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    return res
      .status(200)
      .json({ message: "Token is valid", userId: user._id });
  } catch (error) {
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    const token = authHeader.split(" ")[1];
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profile_pic"
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
  } catch (error) {}
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password -token");
    return res.status(200).json(users);
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

    const doc = new PDFDocument();
    
    // ✅ Create a dual stream: save to file AND send to response
    const fileStream = fs.createWriteStream(filePath);
    doc.pipe(fileStream); // Save to uploads folder
    doc.pipe(res); // Stream to response

    // Add profile picture if it exists
    if (userProfile.userId.profilePicture && userProfile.userId.profilePicture !== "default.png") {
      try {
        const imagePath = path.join("uploads", userProfile.userId.profilePicture);
        
        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, {
            fit: [100, 100],
            align: "center"
          });
          doc.moveDown();
        } else {
          console.log(`Profile picture not found: ${imagePath}`);
          doc.text("Profile Picture: Not available", { align: "center" });
        }
      } catch (imageError) {
        console.error("Error adding profile picture:", imageError);
        doc.text("Profile Picture: Error loading", { align: "center" });
      }
    } else {
      doc.text("Profile Picture: Not set", { align: "center" });
    }

    // Add user information
    doc.fontSize(16).text("Profile Information", { align: "center", underline: true });
    doc.moveDown();
    
    doc.fontSize(12).text(`Name: ${userProfile.userId.name}`);
    doc.text(`Username: ${userProfile.userId.username}`);
    doc.text(`Email: ${userProfile.userId.email}`);
    doc.text(`Bio: ${userProfile.bio || "Not provided"}`);
    doc.text(`Current Position: ${userProfile.currentPost || "Not provided"}`);
    doc.moveDown();

    // Add past work experience
    doc.fontSize(14).text("Work Experience:", { underline: true });
    if (userProfile.pastWork && userProfile.pastWork.length > 0) {
      userProfile.pastWork.forEach((work, index) => {
        doc.fontSize(12).text(`${index + 1}. Company: ${work.companyName || "N/A"}`);
        doc.text(`   Position: ${work.position || "N/A"}`);
        doc.text(`   Years: ${work.years || "N/A"}`);
        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(12).text("No work experience listed");
    }

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
    
    // ✅ Use correct field names that match your schema
    const existingRequest = await ConnectionRequest.findOne({ 
      userId: user._id, 
      connectionId: connectionId 
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: "Connection request already sent" });
    }

    // ✅ Use schema field names (userId, connectionId)
    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionId
    });
    
    await request.save();

    return res.status(200).json({ message: "Connection request sent successfully" });
    
  } catch (error) {
    console.error("Error sending connection request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export const getMyConnectionRequests = async (req, res) => {
  const { token } = req.body;
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
  const { token } = req.body;
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
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    
    // Get requests sent BY the current user
    const sentRequests = await ConnectionRequest.find({ 
      userId: user._id 
    }).populate('connectionId', 'name username email profilePicture');
    
    return res.status(200).json(sentRequests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};