import User from '../models/user.model.js';

// Update user online status
export const updateUserStatus = async (req, res) => {
  const { token, isOnline } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isOnline = isOnline;
    user.lastSeen = new Date();
    await user.save();

    return res.status(200).json({ 
      message: "User status updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        profilePicture: user.profilePicture,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get user status
export const getUserStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('name username profilePicture isOnline lastSeen');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      profilePicture: user.profilePicture,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen
    });
  } catch (error) {
    console.error("Get user status error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};