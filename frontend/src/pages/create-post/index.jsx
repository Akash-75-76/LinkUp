import UserLayout from '@/layout/userLayout';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '@/config/redux/action/postAction';
import { useRouter } from 'next/router';
import Close from '@mui/icons-material/Close';
import AddPhotoAlternate from '@mui/icons-material/AddPhotoAlternate';
import Videocam from '@mui/icons-material/Videocam';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './create-post.module.css';

function CreatePostPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [postText, setPostText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim() || !user?.token) {
      alert('Please write something to post!');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createPost({
        token: user.token,
        body: postText,
        media: mediaFile
      })).unwrap();
      
      alert('Post created successfully!');
      if (window.opener) {
        window.close();
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
      const maxSize = 10 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image or video file (JPEG, PNG, GIF, MP4)');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }

      setMediaFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setMediaPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setMediaPreview(null);
      }
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    const fileInput = document.getElementById('media-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      router.back();
    }
  };

  return (
    <UserLayout>
      <div className={styles.createPostPage}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <button onClick={handleClose} className={styles.closeButton}>
              <Close className={styles.closeIcon} />
            </button>
            <div className={styles.headerText}>
              <h1>Create New Post</h1>
              <p>Share your thoughts with your professional network</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.postForm}>
          <div className={styles.authorSection}>
            <img 
              src={
                user?.profilePicture && user.profilePicture !== "default.jpg"
                  ? `https://linkup-o722.onrender.com/uploads/${user.profilePicture}`
                  : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjgiIGZpbGw9IiM5QjlCOUIiLz4KPHBhdGggZD0iTTAgMzRDMCAyOC4yNTYgNC4yNTYgMjQgMTAgMjRIMzBDMzUuNzQ0IDI0IDQwIDI4LjI1NiA0MCAzNFY0MEgwVjM0WiIgZmlsbD0iIzlCOUI5QiIvPgo8L3N2Zz4="
              }
              alt="Your profile"
              className={styles.authorAvatar}
            />
            <div className={styles.authorInfo}>
              <h4>{user?.name || 'User'}</h4>
              <p>Posting to your network</p>
            </div>
          </div>

          <div className={styles.textareaContainer}>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind? Share your professional insights, updates, or achievements..."
              className={styles.postTextarea}
              rows="6"
              maxLength="1000"
            />
            <div className={styles.charCount}>
              {postText.length}/1000 characters
            </div>
          </div>

          {/* Media Preview */}
          {mediaPreview && (
            <div className={styles.mediaPreview}>
              <div className={styles.previewContainer}>
                <img src={mediaPreview} alt="Preview" className={styles.previewImage} />
                <button 
                  type="button" 
                  onClick={removeMedia} 
                  className={styles.removeMediaButton}
                >
                  <Close className={styles.buttonIcon} />
                  Remove
                </button>
              </div>
            </div>
          )}

          {mediaFile && !mediaPreview && (
            <div className={styles.fileInfo}>
              <div className={styles.fileDetails}>
                <Videocam className={styles.fileIcon} />
                <span className={styles.fileName}>{mediaFile.name}</span>
              </div>
              <button 
                type="button" 
                onClick={removeMedia} 
                className={styles.removeMediaButton}
              >
                <Close className={styles.buttonIcon} />
                Remove
              </button>
            </div>
          )}

          <div className={styles.postActions}>
            <div className={styles.mediaUpload}>
              <label htmlFor="media-upload" className={styles.uploadLabel}>
                <AddPhotoAlternate className={styles.uploadIcon} />
                Add Photo/Video
              </label>
              <input
                id="media-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className={styles.uploadInput}
              />
            </div>
            
            <div className={styles.actionButtons}>
              <button 
                type="button"
                onClick={handleClose}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!postText.trim() || isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={16} className={styles.spinner} />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}

export default CreatePostPage;