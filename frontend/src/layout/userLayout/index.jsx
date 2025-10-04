import Navbar from '@/Components/Navbar'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUserAndProfile } from '@/config/redux/action/authAction'

const UserLayout = ({children}) => {
  const dispatch = useDispatch()
  const authState = useSelector((state) => state.auth)
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (token && !authState.profileFetched && !hasFetched) {
      console.log('Fetching user profile...')
      dispatch(getUserAndProfile({ token }))
        .unwrap()
        .then(() => {
          setHasFetched(true)
        })
        .catch((error) => {
          console.error('Failed to fetch profile:', error)
          // Clear invalid token
          localStorage.removeItem('token')
          setHasFetched(true)
        })
    } else if (!token && hasFetched) {
      // Token was removed, reset fetched state
      setHasFetched(false)
    }
  }, [dispatch, authState.profileFetched, hasFetched])

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '70px', minHeight: 'calc(100vh - 70px)' }}>
        {children}
      </main>
    </div>
  )
}

export default UserLayout