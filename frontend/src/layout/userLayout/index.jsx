import Navbar from '@/Components/Navbar'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUserAndProfile } from '@/config/redux/action/authAction'
import CircularProgress from '@mui/material/CircularProgress'
import ChatWidget from '@/Components/Chat/ChatWidget'
import ChatWindow from '@/Components/Chat/ChatWindow'
import { useUserStatus } from '@/hooks/useUserStatus'
const UserLayout = ({children}) => {
  const dispatch = useDispatch()
  const authState = useSelector((state) => state.auth)
  const [hasFetched, setHasFetched] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  useUserStatus();
  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (token && !authState.profileFetched && !hasFetched) {
      console.log('Fetching user profile...')
      setIsLoading(true)
      dispatch(getUserAndProfile({ token }))
        .unwrap()
        .then(() => {
          setHasFetched(true)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Failed to fetch profile:', error)
          // Clear invalid token
          localStorage.removeItem('token')
          setHasFetched(true)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [dispatch, authState.profileFetched, hasFetched])

  if (isLoading) {
    return (
      <div className="loading-screen">
        <CircularProgress size={60} thickness={4} />
        <p>Loading your profile...</p>
        <style jsx>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          p {
            margin-top: 20px;
            font-size: 1.1rem;
            font-weight: 500;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '70px', minHeight: 'calc(100vh - 70px)' }}>
        {children}
      </main>
      {/* Add Chat Widget to all authenticated pages */}
      <ChatWidget />
      <ChatWindow />
    </div>
  )
}

export default UserLayout