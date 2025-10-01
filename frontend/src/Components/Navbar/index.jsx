import React from 'react'
import styles from "./styles.module.css"
import { useRouter } from 'next/router'

const Navbar = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <h1 style={{cursor:'pointer'}} onClick={()=>{
            router.push("/login")
        }}>LinkUP</h1>
        <div className={styles.navBarOptionContainer}>
          <div 
            onClick={() => {
              router.push("/login")
            }} 
            className={styles.buttonJoin}
          >
            Be a part
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
