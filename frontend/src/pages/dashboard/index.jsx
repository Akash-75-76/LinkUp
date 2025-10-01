import React, { useEffect } from 'react'
import { useRouter } from 'next/router';
const Dashboard = () => {

    const router=useRouter();

    useEffect(()=>{
        if(localStorage.getItem('token')===null){
            router.push('/login');
        }
    })
  return (
    <div>
      hello from dashboard
    </div>
  )
}

export default Dashboard
