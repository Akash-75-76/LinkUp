import { Server } from 'socket.io';
import { Message, ChatRoom, Notification } from './models/chat.model.js';
import User from './models/user.model.js';

// Map userId (string) -> socketId for online tracking
const onlineUsers = new Map();

/** Emit an event to a single logged-in user, if online */
export function emitToUser(io, userId, event, payload) {
  if (!io || userId == null) return;
  const sid = onlineUsers.get(String(userId));
  if (sid) io.to(sid).emit(event, payload);
}

/** Notify both users involved in a connection (sender + other party) */
export function emitRelationshipUpdate(io, data) {
  if (!io || !data) return;
  const { userId, connectionId } = data;
  if (userId != null) emitToUser(io, userId, "relationship_update", data);
  if (connectionId != null) emitToUser(io, connectionId, "relationship_update", data);
}

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // ── JOIN: register userId → socketId ──
    socket.on('join', async (userId) => {
      if (!userId) return;

      const uid = String(userId);
      onlineUsers.set(uid, socket.id);
      socket.userId = uid;

      // Update DB
      await User.findByIdAndUpdate(uid, {
        isOnline: true,
        lastSeen: new Date(),
      });

      // Broadcast to all clients
      io.emit('user_online', { userId: uid, isOnline: true });
      console.log(`👤 User ${userId} is online (${onlineUsers.size} total)`);

      // Send pending notifications
      try {
        const pending = await Notification.find({ to: uid, read: false })
          .populate('from', 'name username profilePicture')
          .sort({ createdAt: -1 })
          .limit(20);
        if (pending.length > 0) {
          socket.emit('pending_notifications', pending);
        }
      } catch (err) {
        console.error('Error fetching pending notifications:', err);
      }
    });

    // ── SEND MESSAGE ──
    socket.on('send_message', async (data) => {
      const { token, receiverId, message } = data;

      try {
        const sender = await User.findOne({ token });
        if (!sender) return socket.emit('error', { message: 'Auth failed' });

        // Find or create chat room
        let chatRoom = await ChatRoom.findOne({
          participants: { $all: [sender._id, receiverId] },
        });

        if (!chatRoom) {
          chatRoom = new ChatRoom({
            participants: [sender._id, receiverId],
          });
          await chatRoom.save();
        }

        // Save message
        const newMessage = new Message({
          senderId: sender._id,
          receiverId,
          message,
          messageType: 'text',
        });
        await newMessage.save();

        // Update chat room
        chatRoom.lastMessage = newMessage._id;
        chatRoom.updatedAt = new Date();
        await chatRoom.save();

        // Populate sender info
        await newMessage.populate('senderId', 'name username profilePicture');

        const messageData = newMessage.toObject();

        // Send to sender
        socket.emit('new_message', messageData);

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(String(receiverId));
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', messageData);
        }

        // Create notification for receiver
        const notification = new Notification({
          type: 'message',
          from: sender._id,
          to: receiverId,
          message: `${sender.name} sent you a message`,
          metadata: { messageId: newMessage._id },
        });
        await notification.save();
        await notification.populate('from', 'name username profilePicture');

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification', notification.toObject());
        }
      } catch (error) {
        console.error('Socket send_message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── RELAY MESSAGE (sent via REST, relay to receiver in real-time) ──
    socket.on('relay_message', (data) => {
      const { receiverId, messageData } = data;
      if (!receiverId || !messageData) return;

      const receiverSocketId = onlineUsers.get(String(receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', messageData);
      }
    });

    // ── TYPING INDICATORS ──
    socket.on('typing_start', (data) => {
      const { receiverId, userId, userName } = data;
      const receiverSocketId = onlineUsers.get(String(receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId,
          userName,
          isTyping: true,
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { receiverId, userId } = data;
      const receiverSocketId = onlineUsers.get(String(receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId,
          isTyping: false,
        });
      }
    });

    // ── READ RECEIPTS ──
    socket.on('messages_read', async (data) => {
      const { token, senderId } = data;

      try {
        const user = await User.findOne({ token });
        if (!user) return;

        await Message.updateMany(
          { senderId, receiverId: user._id, isRead: false },
          { $set: { isRead: true } }
        );

        // Notify the sender that their messages were read
        const senderSocketId = onlineUsers.get(String(senderId));
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read_ack', {
            readBy: user._id.toString(),
          });
        }
      } catch (error) {
        console.error('Socket messages_read error:', error);
      }
    });

    // ── MARK NOTIFICATION READ ──
    socket.on('notification_read', async (notificationId) => {
      try {
        await Notification.findByIdAndUpdate(notificationId, { read: true });
      } catch (error) {
        console.error('Socket notification_read error:', error);
      }
    });

    socket.on('clear_notifications', async () => {
      if (!socket.userId) return;
      try {
        await Notification.updateMany(
          { to: socket.userId, read: false },
          { $set: { read: true } }
        );
      } catch (error) {
        console.error('Socket clear_notifications error:', error);
      }
    });

    // ── DISCONNECT ──
    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);

        const lastSeen = new Date();
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen,
        });

        io.emit('user_online', {
          userId: socket.userId,
          isOnline: false,
          lastSeen,
        });

        console.log(`👋 User ${socket.userId} disconnected (${onlineUsers.size} remain)`);
      }
    });
  });

  return io;
}
