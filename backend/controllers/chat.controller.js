import { Message, ChatRoom } from '../models/chat.model.js';
import User from '../models/user.model.js';

export const sendMessage = async (req, res) => {
  const { token, receiverId, message } = req.body;

  try {
    const sender = await User.findOne({ token });
    if (!sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if users are connected
    const ConnectionRequest = (await import('../models/connections.model.js')).default;
    const connection = await ConnectionRequest.findOne({
      $or: [
        { userId: sender._id, connectionId: receiverId, status: 'accepted' },
        { userId: receiverId, connectionId: sender._id, status: 'accepted' }
      ]
    });

    if (!connection) {
      return res.status(403).json({ message: "You can only message your connections" });
    }

    // Find or create chat room
    let chatRoom = await ChatRoom.findOne({
      participants: { $all: [sender._id, receiverId] }
    });

    if (!chatRoom) {
      chatRoom = new ChatRoom({
        participants: [sender._id, receiverId]
      });
      await chatRoom.save();
    }

    // Create message
    const newMessage = new Message({
      senderId: sender._id,
      receiverId: receiverId,
      message: message,
      messageType: 'text'
    });

    await newMessage.save();

    // Update chat room
    chatRoom.lastMessage = newMessage._id;
    chatRoom.updatedAt = new Date();
    await chatRoom.save();

    // Populate sender info
    await newMessage.populate('senderId', 'name username profilePicture');

    return res.status(201).json({
      message: "Message sent successfully",
      chatMessage: newMessage
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendImageMessage = async (req, res) => {
  const { token, receiverId } = req.body;

  try {
    const sender = await User.findOne({ token });
    if (!sender) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Check connection (same as above)
    const ConnectionRequest = (await import('../models/connections.model.js')).default;
    const connection = await ConnectionRequest.findOne({
      $or: [
        { userId: sender._id, connectionId: receiverId, status: 'accepted' },
        { userId: receiverId, connectionId: sender._id, status: 'accepted' }
      ]
    });

    if (!connection) {
      return res.status(403).json({ message: "You can only message your connections" });
    }

    // Find or create chat room
    let chatRoom = await ChatRoom.findOne({
      participants: { $all: [sender._id, receiverId] }
    });

    if (!chatRoom) {
      chatRoom = new ChatRoom({
        participants: [sender._id, receiverId]
      });
      await chatRoom.save();
    }

    // Create image message
    const newMessage = new Message({
      senderId: sender._id,
      receiverId: receiverId,
      message: '📷 Image',
      messageType: 'image',
      mediaUrl: req.file.filename
    });

    await newMessage.save();

    // Update chat room
    chatRoom.lastMessage = newMessage._id;
    chatRoom.updatedAt = new Date();
    await chatRoom.save();

    // Populate sender info
    await newMessage.populate('senderId', 'name username profilePicture');

    return res.status(201).json({
      message: "Image sent successfully",
      chatMessage: newMessage
    });
  } catch (error) {
    console.error("Send image error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatHistory = async (req, res) => {
  const { token, otherUserId } = req.query;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: user._id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: user._id }
      ]
    })
    .populate('senderId', 'name username profilePicture')
    .populate('receiverId', 'name username profilePicture')
    .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Get chat history error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatRooms = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const chatRooms = await ChatRoom.find({
      participants: user._id
    })
    .populate('participants', 'name username profilePicture')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'senderId',
        select: 'name username profilePicture'
      }
    })
    .sort({ updatedAt: -1 });

    return res.status(200).json(chatRooms);
  } catch (error) {
    console.error("Get chat rooms error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  const { token, senderId } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Message.updateMany(
      {
        senderId: senderId,
        receiverId: user._id,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    return res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};