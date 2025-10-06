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
    // For real-time updates - add message immediately
    addMessageToChat: (state, action) => {
      const { message, userId } = action.payload;
      
      // Add to current chat if active
      if (state.currentChat.userId === userId) {
        state.currentChat.messages.push(message);
      }
      
      // Update last message in chat rooms
      const chatRoomIndex = state.chatRooms.findIndex(room => 
        room.participants.some(participant => 
          participant._id === userId || participant._id === message.senderId
        )
      );
      
      if (chatRoomIndex !== -1) {
        state.chatRooms[chatRoomIndex].lastMessage = message;
        state.chatRooms[chatRoomIndex].updatedAt = new Date().toISOString();
        
        // Move to top
        const updatedRoom = state.chatRooms.splice(chatRoomIndex, 1)[0];
        state.chatRooms.unshift(updatedRoom);
      }
    },
    // Mark messages as read locally
    markMessagesAsReadLocal: (state, action) => {
      const { senderId } = action.payload;
      
      // Mark as read in current chat
      if (state.currentChat.userId === senderId) {
        state.currentChat.messages.forEach(msg => {
          if (msg.senderId === senderId) {
            msg.isRead = true;
          }
        });
      }
      
      // Update unread count
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    // Update online status
    updateUserOnlineStatus: (state, action) => {
      const { userId, isOnline, lastSeen } = action.payload;
      
      // Update in chat rooms
      state.chatRooms.forEach(room => {
        room.participants.forEach(participant => {
          if (participant._id === userId) {
            participant.isOnline = isOnline;
            participant.lastSeen = lastSeen;
          }
        });
      });
      
      // Update in current chat
      if (state.currentChat.userInfo && state.currentChat.userInfo._id === userId) {
        state.currentChat.userInfo.isOnline = isOnline;
        state.currentChat.userInfo.lastSeen = lastSeen;
      }
    },
    // Open chat with specific user
    openChatWithUser: (state, action) => {
      state.currentChat.userId = action.payload._id;
      state.currentChat.userInfo = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.isError = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.success = true;
        
        // Add message to current chat immediately
        if (state.currentChat.userId === action.payload.chatMessage.receiverId) {
          state.currentChat.messages.push(action.payload.chatMessage);
        }
        
        state.message = "Message sent successfully";
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
        
        // Add image message to current chat immediately
        if (state.currentChat.userId === action.payload.chatMessage.receiverId) {
          state.currentChat.messages.push(action.payload.chatMessage);
        }
        
        state.message = "Image sent successfully";
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
        
        // Only update if we're still viewing the same chat
        if (state.currentChat.userId === otherUserId) {
          state.currentChat.messages = messages;
        }
        
        state.message = "Chat history loaded";
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
        state.message = "Chat rooms loaded";
      })
      .addCase(getChatRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Mark Messages as Read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { senderId } = action.payload;
        
        // Mark as read in current chat
        if (state.currentChat.userId === senderId) {
          state.currentChat.messages.forEach(msg => {
            if (msg.senderId === senderId) {
              msg.isRead = true;
            }
          });
        }
        
        // Update unread count
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.message = "Messages marked as read";
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
  }
});

export const {
  resetChat,
  setCurrentChat,
  clearCurrentChat,
  addMessageToChat,
  markMessagesAsReadLocal,
  updateUserOnlineStatus,
  openChatWithUser
} = chatSlice.actions;

export default chatSlice.reducer;