import DashboardLayout from '@/layout/Dashboardlayout'
import UserLayout from '@/layout/userLayout'
import React from 'react'

export default function MyConnectionspage() {
  return (
  <UserLayout>
    <DashboardLayout>
        <div>
            <h1>My Connections</h1>
        </div>
    </DashboardLayout>
  </UserLayout>
  )
}
