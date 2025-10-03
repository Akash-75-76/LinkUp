import Navbar from '@/Components/Navbar'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getUserAndProfile } from '@/config/redux/action/authAction'

const UserLayout = ({children}) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('UserLayout token check:', token) // Debug log
    
    if (token) {
      console.log('Dispatching getUserAndProfile with token') // Debug log
      dispatch(getUserAndProfile({ token }))
    }
  }, [dispatch])

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '100px' }}> {/* Add this padding */}
        {children}
      </main>
    </div>
  )
}

export default UserLayout