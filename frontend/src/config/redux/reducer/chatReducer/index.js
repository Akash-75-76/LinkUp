import { createSlice } from '@reduxjs/toolkit';
import {
  sendMessage,
  sendImageMessage,
  getChatHistory,
  getChatRooms,
  markMessagesAsRead,
  getUnreadCount
} from '../../action/chatAction/index.js';

const initialState = {
  chatRooms: [],
  currentChat: {
    userId: null,
    messages: [],
    userInfo: null
  },
  notifications: [],
  unreadNotificationCount: 0,
  typingUsers: {},  // { [userId]: { isTyping, userName } }
  unreadCount: 0,
  isError: false,
  isLoading: false,
  isSending: false,
  message: "",
  success: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    resetChat: () => initialState,

    setCurrentChat: (state, action) => {
      state.currentChat.userId = action.payload.userId;
      state.currentChat.userInfo = action.payload.userInfo;
    },

    clearCurrentChat: (state) => {
      state.currentChat = {
        userId: null,
        messages: [],
        userInfo: null
      };
    },

    // ── Real-time message received via Socket.IO ──
    receiveRealtimeMessage: (state, action) => {
      const msg = action.payload;
      const senderId = msg.senderId?._id || msg.senderId;
      const receiverId = msg.receiverId?._id || msg.receiverId;

      // Add to current chat if chat is open with this user
      const chatUserId = state.currentChat.userId;
      if (chatUserId && (senderId === chatUserId || receiverId === chatUserId)) {
        // Avoid duplicate messages
        const exists = state.currentChat.messages.some(
          (m) => m._id === msg._id
        );
        if (!exists) {
          state.currentChat.messages.push(msg);
        }
      }

      // Update chat rooms list
      const roomIndex = state.chatRooms.findIndex((room) =>
        room.participants.some(
          (p) => p._id === senderId || p._id === receiverId
        )
      );

      if (roomIndex !== -1) {
        state.chatRooms[roomIndex].lastMessage = msg;
        state.chatRooms[roomIndex].updatedAt = new Date().toISOString();

        // Move to top
        const updated = state.chatRooms.splice(roomIndex, 1)[0];
        state.chatRooms.unshift(updated);
      }
    },

    // ── Typing indicator ──
    setUserTyping: (state, action) => {
      const { userId, userName, isTyping } = action.payload;
      if (isTyping) {
        state.typingUsers[userId] = { isTyping: true, userName };
      } else {
        delete state.typingUsers[userId];
      }
    },

    // ── Online status ──
    updateUserOnlineStatus: (state, action) => {
      const { userId, isOnline, lastSeen } = action.payload;

      // Update in chat rooms
      state.chatRooms.forEach((room) => {
        room.participants.forEach((participant) => {
          if (participant._id === userId) {
            participant.isOnline = isOnline;
            participant.lastSeen = lastSeen;
          }
        });
      });

      // Update in current chat
      if (
        state.currentChat.userInfo &&
        state.currentChat.userInfo._id === userId
      ) {
        state.currentChat.userInfo.isOnline = isOnline;
        state.currentChat.userInfo.lastSeen = lastSeen;
      }
    },

    // ── Notifications ──
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadNotificationCount += 1;
    },

    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadNotificationCount = action.payload.filter(
        (n) => !n.read
      ).length;
    },

    markNotificationRead: (state, action) => {
      const id = action.payload;
      const notif = state.notifications.find((n) => n._id === id);
      if (notif) {
        notif.read = true;
        state.unreadNotificationCount = Math.max(
          0,
          state.unreadNotificationCount - 1
        );
      }
    },

    clearAllNotifications: (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadNotificationCount = 0;
    },

    // Open chat with specific user
    openChatWithUser: (state, action) => {
      state.currentChat.userId = action.payload._id;
      state.currentChat.userInfo = action.payload;
    },

    // Legacy — kept for compatibility
    addMessageToChat: (state, action) => {
      const { message, userId } = action.payload;
      if (state.currentChat.userId === userId) {
        state.currentChat.messages.push(message);
      }
    },

    markMessagesAsReadLocal: (state, action) => {
      const { senderId } = action.payload;
      if (state.currentChat.userId === senderId) {
        state.currentChat.messages.forEach((msg) => {
          if (msg.senderId === senderId) {
            msg.isRead = true;
          }
        });
      }
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Message (REST fallback)
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.isError = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.success = true;
        const chatMsg = action.payload.chatMessage;
        const msgReceiverId = chatMsg.receiverId?._id || chatMsg.receiverId;
        const msgSenderId = chatMsg.senderId?._id || chatMsg.senderId;

        // Add to current chat if this conversation is open
        if (
          state.currentChat.userId &&
          (state.currentChat.userId === msgReceiverId?.toString() ||
           state.currentChat.userId === msgSenderId?.toString())
        ) {
          const exists = state.currentChat.messages.some(
            (m) => m._id === chatMsg._id
          );
          if (!exists) {
            state.currentChat.messages.push(chatMsg);
          }
        }
        state.message = 'Message sent successfully';
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Send Image Message
      .addCase(sendImageMessage.pending, (state) => {
        state.isSending = true;
        state.isError = false;
      })
      .addCase(sendImageMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.success = true;
        if (
          state.currentChat.userId ===
          action.payload.chatMessage.receiverId
        ) {
          const exists = state.currentChat.messages.some(
            (m) => m._id === action.payload.chatMessage._id
          );
          if (!exists) {
            state.currentChat.messages.push(action.payload.chatMessage);
          }
        }
        state.message = 'Image sent successfully';
      })
      .addCase(sendImageMessage.rejected, (state, action) => {
        state.isSending = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Get Chat History
      .addCase(getChatHistory.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getChatHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const { otherUserId, messages } = action.payload;
        if (state.currentChat.userId === otherUserId) {
          state.currentChat.messages = messages;
        }
        state.message = 'Chat history loaded';
      })
      .addCase(getChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Get Chat Rooms
      .addCase(getChatRooms.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getChatRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.chatRooms = action.payload;
        state.message = 'Chat rooms loaded';
      })
      .addCase(getChatRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Mark Messages as Read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { senderId } = action.payload;
        if (state.currentChat.userId === senderId) {
          state.currentChat.messages.forEach((msg) => {
            if (msg.senderId === senderId) {
              msg.isRead = true;
            }
          });
        }
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.message = 'Messages marked as read';
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })

      // Get Unread Count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count || 0;
      })
      .addCase(getUnreadCount.rejected, (state) => {
        state.unreadCount = 0;
      });
  },
});

export const {
  resetChat,
  setCurrentChat,
  clearCurrentChat,
  receiveRealtimeMessage,
  setUserTyping,
  updateUserOnlineStatus,
  addNotification,
  setNotifications,
  markNotificationRead,
  clearAllNotifications,
  openChatWithUser,
  addMessageToChat,
  markMessagesAsReadLocal,
} = chatSlice.actions;

export default chatSlice.reducer;