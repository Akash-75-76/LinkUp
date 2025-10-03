import DashboardLayout from '@/layout/Dashboardlayout'
import UserLayout from '@/layout/userLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllUsers } from '@/config/redux/action/authAction'
import styles from "./index.module.css"
function DiscoverPage() {
  const dispatch = useDispatch()
  const authState = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(getAllUsers())
  }, [dispatch])

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1>Discover People</h1>
          
          {authState.all_profiles_fetching ? (
            <div>Loading users...</div>
          ) : authState.isError ? (
            <div>Error loading users: {authState.message}</div>
          ) : (
            <div className={styles.usersGrid}>
              {authState.all_users?.length > 0 ? (
                authState.all_users.map((user) => (
                  <div key={user._id} className={styles.userCard}>
                    <div className={styles.userAvatar}>
                      {user.profile_pic ? (
                        <img src={user.profile_pic} alt={user.name} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={styles.userInfo}>
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                      <p className={styles.username}>@{user.username}</p>
                    </div>
                    <button className={styles.connectButton}>
                      Connect
                    </button>
                  </div>
                ))
              ) : (
                <div>No users found</div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  )
}

export default DiscoverPage