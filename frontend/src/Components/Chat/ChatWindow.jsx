import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getChatHistory,
  markMessagesAsRead,
} from "@/config/redux/action/chatAction";
import { clearCurrentChat } from "@/config/redux/reducer/chatReducer";
import { getSocket } from "@/config/socket";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CircleIcon from "@mui/icons-material/Circle";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import styles from "./ChatWindow.module.css";

const DEFAULT_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0wIDg1QzAgNzAuNjQgMTEuNjY0IDU5IDI2IDU5SDc0Qzg4LjMzNiA1OSAxMDAgNzAuNjQgMTAwIDg1VjEwMEgwVjg1WiIgZmlsbD0iIzlCOUI5QiIvPgo8L3N2Zz4=";

const ChatWindow = () => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { currentChat, typingUsers } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  const isOtherUserTyping = currentChat.userId && typingUsers[currentChat.userId]?.isTyping;

  useEffect(() => {
    if (currentChat.userId && currentUser?.token) {
      dispatch(
        getChatHistory({
          token: currentUser.token,
          otherUserId: currentChat.userId,
        })
      );
      // Mark messages as read via socket
      const socket = getSocket();
      if (socket) {
        socket.emit("messages_read", {
          token: currentUser.token,
          senderId: currentChat.userId,
        });
      }
      dispatch(
        markMessagesAsRead({
          token: currentUser.token,
          senderId: currentChat.userId,
        })
      );
    }
  }, [currentChat.userId, currentUser?.token, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "recently";
    try {
      const lastSeenDate = new Date(lastSeen);
      if (isNaN(lastSeenDate.getTime())) return "recently";
      const now = new Date();
      const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
      if (diffInMinutes < 1) return "just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return lastSeenDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "recently";
    }
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group consecutive messages from same sender
  const getGroupedMessages = useCallback(() => {
    const messages = currentChat.messages || [];
    return messages.map((msg, index) => {
      const prevMsg = index > 0 ? messages[index - 1] : null;
      const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
      const senderId = msg.senderId?._id || msg.senderId;
      const prevSenderId = prevMsg ? (prevMsg.senderId?._id || prevMsg.senderId) : null;
      const nextSenderId = nextMsg ? (nextMsg.senderId?._id || nextMsg.senderId) : null;

      return {
        ...msg,
        isFirstInGroup: senderId !== prevSenderId,
        isLastInGroup: senderId !== nextSenderId,
      };
    });
  }, [currentChat.messages]);

  // Typing indicator via socket
  const handleTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !currentChat.userId || !currentUser) return;

    socket.emit("typing_start", {
      receiverId: currentChat.userId,
      userId: currentUser._id,
      userName: currentUser.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", {
        receiverId: currentChat.userId,
        userId: currentUser._id,
      });
    }, 2000);
  }, [currentChat.userId, currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentUser?.token || !currentChat.userId) return;

    const msgText = message.trim();

    // Stop typing indicator
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("typing_stop", {
        receiverId: currentChat.userId,
        userId: currentUser._id,
      });
    }

    setIsSending(true);
    setMessage(""); // Clear input immediately for UX

    try {
      // Send via REST API (reliable, persists to DB)
      const { sendMessage } = await import("@/config/redux/action/chatAction");
      const result = await dispatch(
        sendMessage({
          token: currentUser.token,
          receiverId: currentChat.userId,
          message: msgText,
        })
      ).unwrap();

      // Relay the saved message to the receiver via Socket.IO for real-time delivery
      if (socket?.connected && result?.chatMessage) {
        socket.emit("relay_message", {
          receiverId: currentChat.userId,
          messageData: result.chatMessage,
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message on failure so user doesn't lose their text
      setMessage(msgText);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser?.token || !currentChat.userId) return;

    // Image upload still uses REST (FormData not ideal over WebSocket)
    const { sendImageMessage } = await import("@/config/redux/action/chatAction");
    setIsSending(true);
    try {
      await dispatch(
        sendImageMessage({
          token: currentUser.token,
          receiverId: currentChat.userId,
          image: file,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to send image:", error);
    } finally {
      setIsSending(false);
      e.target.value = "";
    }
  };

  const handleClose = () => {
    // Stop typing indicator on close
    const socket = getSocket();
    if (socket && currentChat.userId) {
      socket.emit("typing_stop", {
        receiverId: currentChat.userId,
        userId: currentUser?._id
      });
    }
    dispatch(clearCurrentChat());
  };

  if (!currentChat.userId) return null;

  const groupedMessages = getGroupedMessages();

  return (
    <div className={styles.chatWindow}>
      {/* ── Header ── */}
      <div className={styles.chatHeader}>
        <div className={styles.userInfo}>
          <div className={styles.avatarWrapper}>
            <img
              src={
                currentChat.userInfo?.profilePicture &&
                currentChat.userInfo.profilePicture !== "default.jpg"
                  ? `https://linkup-o722.onrender.com/uploads/${currentChat.userInfo.profilePicture}`
                  : DEFAULT_AVATAR
              }
              alt={currentChat.userInfo?.name}
              className={styles.userAvatar}
            />
            <span className={`${styles.onlineDot} ${
              currentChat.userInfo?.isOnline ? styles.online : styles.offline
            }`} />
          </div>
          <div className={styles.userDetails}>
            <h4>{currentChat.userInfo?.name}</h4>
            <span className={styles.userStatus}>
              {isOtherUserTyping ? (
                <span className={styles.typingText}>typing...</span>
              ) : currentChat.userInfo?.isOnline ? (
                "Online"
              ) : (
                `Last seen ${formatLastSeen(currentChat.userInfo?.lastSeen)}`
              )}
            </span>
          </div>
        </div>
        <button onClick={handleClose} className={styles.closeButton}>
          <CloseIcon />
        </button>
      </div>

      {/* ── Messages ── */}
      <div
        className={styles.messagesContainer}
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {groupedMessages.length > 0 ? (
          <>
            {groupedMessages.map((msg) => {
              const senderId = msg.senderId?._id || msg.senderId;
              const isSent = senderId === currentUser._id;

              return (
                <div
                  key={msg._id}
                  className={`${styles.messageWrapper} ${
                    isSent ? styles.sentWrapper : styles.receivedWrapper
                  } ${msg.isFirstInGroup ? styles.firstInGroup : ""} ${
                    msg.isLastInGroup ? styles.lastInGroup : ""
                  }`}
                >
                  <div
                    className={`${styles.message} ${
                      isSent ? styles.sent : styles.received
                    }`}
                  >
                    {msg.messageType === "image" ? (
                      <img
                        src={`https://linkup-o722.onrender.com/uploads/${msg.mediaUrl}`}
                        alt="Shared content"
                        className={styles.chatImage}
                      />
                    ) : (
                      <p className={styles.messageText}>{msg.message}</p>
                    )}
                    <div className={styles.messageMeta}>
                      <span className={styles.messageTime}>
                        {formatMessageTime(msg.createdAt)}
                      </span>
                      {isSent && (
                        <span className={styles.readReceipt}>
                          {msg.isRead ? (
                            <DoneAllIcon className={styles.readIcon} />
                          ) : (
                            <DoneIcon className={styles.unreadIcon} />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isOtherUserTyping && (
              <div className={`${styles.messageWrapper} ${styles.receivedWrapper}`}>
                <div className={`${styles.message} ${styles.received} ${styles.typingBubble}`}>
                  <div className={styles.typingIndicator}>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noMessages}>
            <div className={styles.noMessagesIcon}>💬</div>
            <h4>Start a conversation</h4>
            <p>Say hello to {currentChat.userInfo?.name}!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button className={styles.scrollToBottom} onClick={scrollToBottom}>
          <KeyboardArrowDownIcon />
        </button>
      )}

      {/* ── Input ── */}
      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
          id="chat-image-upload"
        />
        <label htmlFor="chat-image-upload" className={styles.attachButton}>
          <AttachFileIcon />
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            disabled={isSending}
            className={styles.messageInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isSending || !message.trim()}
          className={styles.sendButton}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
