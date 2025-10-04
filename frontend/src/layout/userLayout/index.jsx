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
    console.log('UserLayout token check:', token)
    
    if (token && !authState.profileFetched && !hasFetched) {
      console.log('Dispatching getUserAndProfile with token')
      dispatch(getUserAndProfile({ token }))
      setHasFetched(true)
    }
  }, [dispatch, authState.profileFetched, hasFetched])

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '100px' }}>
        {children}
      </main>
    </div>
  )
}

export default UserLayout