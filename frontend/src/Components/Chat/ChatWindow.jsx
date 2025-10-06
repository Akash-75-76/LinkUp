import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  sendMessage,
  sendImageMessage,
  getChatHistory,
  markMessagesAsRead,
} from "@/config/redux/action/chatAction"; // All from actions
import { clearCurrentChat } from "@/config/redux/reducer/chatReducer"; // Only reducer functions from reducer
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CircleIcon from "@mui/icons-material/Circle";
import styles from "./ChatWindow.module.css";

const DEFAULT_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0wIDg1QzAgNzAuNjQgMTEuNjY0IDU5IDI2IDU5SDc0Qzg4LjMzNiA1OSAxMDAgNzAuNjQgMTAwIDg1VjEwMEgwVjg1WiIgZmlsbD0iIzlCOUI5QiIvPgo8L3N2Zz4=";

const ChatWindow = () => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { currentChat, isSending: isSendingMessage } = useSelector(
    (state) => state.chat
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentChat.userId && currentUser?.token) {
      dispatch(
        getChatHistory({
          token: currentUser.token,
          otherUserId: currentChat.userId,
        })
      );
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
  // Add this helper function inside the ChatWindow component
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "recently";

    try {
      const lastSeenDate = new Date(lastSeen);
      if (isNaN(lastSeenDate.getTime())) {
        return "recently";
      }

      const now = new Date();
      const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

      if (diffInMinutes < 1) return "just now";
      if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
      if (diffInMinutes < 1440)
        return `${Math.floor(diffInMinutes / 60)} hours ago`;
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    } catch (error) {
      return "recently";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentUser?.token || !currentChat.userId) return;

    setIsSending(true);
    try {
      await dispatch(
        sendMessage({
          token: currentUser.token,
          receiverId: currentChat.userId,
          message: message.trim(),
        })
      ).unwrap();
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser?.token || !currentChat.userId) return;

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
      e.target.value = ""; // Reset file input
    }
  };

  const handleClose = () => {
    dispatch(clearCurrentChat());
  };

  if (!currentChat.userId) return null;

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <div className={styles.userInfo}>
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
          <div className={styles.userDetails}>
            <h4>{currentChat.userInfo?.name}</h4>
            <span className={styles.userStatus}>
              <CircleIcon
                className={`${styles.statusDot} ${
                  currentChat.userInfo?.isOnline
                    ? styles.online
                    : styles.offline
                }`}
              />
              {currentChat.userInfo?.isOnline
                ? "Online"
                : `Last seen ${formatLastSeen(currentChat.userInfo?.lastSeen)}`}
            </span>
          </div>
        </div>
        <button onClick={handleClose} className={styles.closeButton}>
          <CloseIcon />
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {currentChat.messages?.length > 0 ? (
          currentChat.messages.map((msg) => (
            <div
              key={msg._id}
              className={`${styles.message} ${
                msg.senderId === currentUser._id ? styles.sent : styles.received
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
              <span className={styles.messageTime}>
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        ) : (
          <div className={styles.noMessages}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

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
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending || isSendingMessage}
          className={styles.messageInput}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={isSending || isSendingMessage || !message.trim()}
          className={styles.sendButton}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
