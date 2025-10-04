import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '@/config/redux/action/postAction';
import styles from './CreatePost.module.css';

const CreatePost = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [postText, setPostText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim() || !user?.token) return;

    setIsSubmitting(true);
    try {
      await dispatch(createPost({
        token: user.token,
        body: postText,
        media: mediaFile
      })).unwrap();
      
      setPostText('');
      setMediaFile(null);
      // Reset file input
      const fileInput = document.getElementById('media-upload');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image or video file');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }

      setMediaFile(file);
    }
  };

  return (
    <div className={styles.createPost}>
      <h3>Create a Post</h3>
      <form onSubmit={handleSubmit} className={styles.postForm}>
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="What's on your mind?"
          className={styles.postTextarea}
          rows="4"
        />
        
        <div className={styles.postActions}>
          <div className={styles.mediaUpload}>
            <label htmlFor="media-upload" className={styles.uploadLabel}>
              📷 Add Media
            </label>
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className={styles.uploadInput}
            />
            {mediaFile && (
              <span className={styles.fileName}>{mediaFile.name}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={!postText.trim() || isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;