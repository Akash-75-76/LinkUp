import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getChatRooms } from '@/config/redux/action/chatAction'; // Fix import - from actions, not reducer
import { openChatWithUser } from '@/config/redux/reducer/chatReducer'; // This import is correct
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
  const { chatRooms, isLoading, unreadCount } = useSelector((state) => state.chat);
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
    setIsOpen(false); // Close the chat list when opening a chat
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <div className={styles.chatWidget}>
        <button 
          className={styles.chatToggle}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon />}
          {!isOpen && unreadCount > 0 && (
            <span className={styles.notificationBadge}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <h3>Messages</h3>
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
              <div className={styles.loading}>Loading conversations...</div>
            ) : filteredChatRooms?.length > 0 ? (
              <div className={styles.chatList}>
                {filteredChatRooms.map(room => {
                  const otherUser = getOtherParticipant(room.participants);
                  if (!otherUser) return null;
                  
                  return (
                    <div
                      key={room._id}
                      className={styles.chatItem}
                      onClick={() => handleOpenChat(otherUser)}
                    >
                      <div className={styles.userAvatar}>
                        <img 
                          src={otherUser?.profilePicture && otherUser.profilePicture !== 'default.jpg' 
                            ? `http://localhost:5000/uploads/${otherUser.profilePicture}`
                            : DEFAULT_AVATAR
                          }
                          alt={otherUser?.name}
                        />
                        <CircleIcon className={`${styles.onlineIndicator} ${
                          otherUser?.isOnline ? styles.online : styles.offline
                        }`} />
                      </div>
                      <div className={styles.chatInfo}>
                        <h4>{otherUser?.name}</h4>
                        <p className={styles.lastMessage}>
                          {room.lastMessage?.messageType === 'image' 
                            ? '📷 Image' 
                            : (room.lastMessage?.message || 'No messages yet')
                          }
                        </p>
                      </div>
                      <div className={styles.chatMeta}>
                        <span className={styles.messageTime}>
                          {room.lastMessage && new Date(room.lastMessage.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {room.lastMessage && !room.lastMessage?.isRead && room.lastMessage?.senderId !== user._id && (
                          <span className={styles.unreadBadge}></span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.noChats}>
                <ChatIcon className={styles.noChatsIcon} />
                <p>No conversations yet</p>
                <span>Start a conversation with your connections</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;