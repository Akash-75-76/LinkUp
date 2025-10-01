import Navbar from '@/Components/Navbar'
import React from 'react'

const UserLayout = ({children}) => {
  return (
    <div>
        <Navbar/>
       {children}
      
    </div>
  )
}

export default UserLayout
