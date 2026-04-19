import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getChatRooms } from '@/config/redux/action/chatAction';
import { openChatWithUser } from '@/config/redux/reducer/chatReducer';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CircleIcon from '@mui/icons-material/Circle';
import styles from './ChatWidget.module.css';

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0wIDg1QzAgNzAuNjQgMTEuNjY0IDU5IDI2IDU5SDc0Qzg4LjMzNiA1OSAxMDAgNzAuNjQgMTAwIDg1VjEwMEgwVjg1WiIgZmlsbD0iIzlCOUI5QiIvPgo8L3N2Zz4=";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useSelector((state) => state.auth);
  const { chatRooms, isLoading, typingUsers } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen && user?.token) {
      dispatch(getChatRooms({ token: user.token }));
    }
  }, [isOpen, user?.token, dispatch]);

  const filteredChatRooms = chatRooms?.filter(room => {
    const otherParticipant = room.participants.find(p => p._id !== user?._id);
    return otherParticipant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           otherParticipant?.username?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getOtherParticipant = (participants) => {
    return participants.find(participant => participant._id !== user?._id);
  };

  const handleOpenChat = (otherUser) => {
    dispatch(openChatWithUser(otherUser));
    setIsOpen(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Count total unread messages
  const totalUnread = chatRooms?.reduce((count, room) => {
    if (room.lastMessage && !room.lastMessage.isRead && 
        (room.lastMessage.senderId?._id || room.lastMessage.senderId) !== user?._id) {
      return count + 1;
    }
    return count;
  }, 0) || 0;

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <div className={styles.chatWidget}>
        <button 
          className={`${styles.chatToggle} ${isOpen ? styles.open : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon />}
          {!isOpen && totalUnread > 0 && (
            <span className={styles.notificationBadge}>
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.headerTop}>
              <h3>Messages</h3>
              <span className={styles.roomCount}>
                {chatRooms?.length || 0} conversations
              </span>
            </div>
            <div className={styles.searchContainer}>
              <SearchIcon className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.chatContent}>
            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.loadingDots}>
                  <span></span><span></span><span></span>
                </div>
                <p>Loading conversations...</p>
              </div>
            ) : filteredChatRooms?.length > 0 ? (
              <div className={styles.chatList}>
                {filteredChatRooms.map(room => {
                  const otherUser = getOtherParticipant(room.participants);
                  if (!otherUser) return null;
                  
                  const isTyping = typingUsers[otherUser._id]?.isTyping;
                  const isUnread = room.lastMessage && 
                    !room.lastMessage.isRead && 
                    (room.lastMessage.senderId?._id || room.lastMessage.senderId) !== user._id;
                  
                  return (
                    <div
                      key={room._id}
                      className={`${styles.chatItem} ${isUnread ? styles.unreadItem : ''}`}
                      onClick={() => handleOpenChat(otherUser)}
                    >
                      <div className={styles.userAvatar}>
                        <img 
                          src={otherUser?.profilePicture && otherUser.profilePicture !== 'default.jpg' 
                            ? `https://linkup-o722.onrender.com/uploads/${otherUser.profilePicture}`
                            : DEFAULT_AVATAR
                          }
                          alt={otherUser?.name}
                        />
                        <span className={`${styles.onlineIndicator} ${
                          otherUser?.isOnline ? styles.online : styles.offline
                        }`} />
                      </div>
                      <div className={styles.chatInfo}>
                        <div className={styles.chatInfoTop}>
                          <h4>{otherUser?.name}</h4>
                          <span className={styles.messageTime}>
                            {room.lastMessage && formatTime(room.lastMessage.createdAt || room.updatedAt)}
                          </span>
                        </div>
                        <div className={styles.chatInfoBottom}>
                          <p className={styles.lastMessage}>
                            {isTyping ? (
                              <span className={styles.typingPreview}>typing...</span>
                            ) : room.lastMessage?.messageType === 'image' 
                              ? '📷 Image' 
                              : (room.lastMessage?.message || 'No messages yet')
                            }
                          </p>
                          {isUnread && <span className={styles.unreadDot} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.noChats}>
                <div className={styles.noChatsEmoji}>💬</div>
                <p>No conversations yet</p>
                <span>Start chatting with your connections</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;