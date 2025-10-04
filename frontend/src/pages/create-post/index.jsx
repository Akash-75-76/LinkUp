import UserLayout from '@/layout/userLayout'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createPost } from '@/config/redux/action/postAction'
import { useRouter } from 'next/router'
import styles from './create-post.module.css'

function CreatePostPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [postText, setPostText] = useState('')
  const [mediaFile, setMediaFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaPreview, setMediaPreview] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!postText.trim() || !user?.token) {
      alert('Please write something to post!')
      return
    }

    setIsSubmitting(true)
    try {
      await dispatch(createPost({
        token: user.token,
        body: postText,
        media: mediaFile
      })).unwrap()
      
      // Success - close the window and show success message
      alert('Post created successfully!')
      window.close() // This will close the popup window
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMediaChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
      const maxSize = 10 * 1024 * 1024 // 10MB

      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image or video file (JPEG, PNG, GIF, MP4)')
        return
      }

      if (file.size > maxSize) {
        alert('File size must be less than 10MB')
        return
      }

      setMediaFile(file)

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setMediaPreview(e.target.result)
        }
        reader.readAsDataURL(file)
      } else {
        setMediaPreview(null)
      }
    }
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    const fileInput = document.getElementById('media-upload')
    if (fileInput) fileInput.value = ''
  }

  const handleClose = () => {
    window.close() // Close the window
  }

  return (
    <UserLayout>
      <div className={styles.createPostPage}>
        <div className={styles.header}>
          <button onClick={handleClose} className={styles.closeButton}>
            ✕
          </button>
          <h1>Create New Post</h1>
          <p>Share your thoughts with your network</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.postForm}>
          <div className={styles.textareaContainer}>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind? Share your thoughts, ideas, or updates..."
              className={styles.postTextarea}
              rows="6"
            />
            <div className={styles.charCount}>
              {postText.length}/1000
            </div>
          </div>

          {/* Media Preview */}
          {mediaPreview && (
            <div className={styles.mediaPreview}>
              <img src={mediaPreview} alt="Preview" className={styles.previewImage} />
              <button type="button" onClick={removeMedia} className={styles.removeMediaButton}>
                Remove
              </button>
            </div>
          )}

          {mediaFile && !mediaPreview && (
            <div className={styles.fileInfo}>
              <span>File selected: {mediaFile.name}</span>
              <button type="button" onClick={removeMedia} className={styles.removeMediaButton}>
                Remove
              </button>
            </div>
          )}

          <div className={styles.postActions}>
            <div className={styles.mediaUpload}>
              <label htmlFor="media-upload" className={styles.uploadLabel}>
                <span className={styles.uploadIcon}>📷</span>
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
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!postText.trim() || isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </UserLayout>
  )
}

export default CreatePostPage