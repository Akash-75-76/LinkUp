import UserLayout from '@/layout/userLayout'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import styles from './style.module.css'
import { useRouter } from 'next/router'
import { useState } from 'react'

function LoginComponent() {
  const authState = useSelector((state) => state.auth)
  const router = useRouter()
  const [isLoginMethod, setIsLoginMethod] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authState.loggedIn) {
      router.push('/dashboard')
    }
  }, [authState.loggedIn, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Add your authentication logic here
      console.log('Form submitted:', formData)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAuthMethod = () => {
    setIsLoginMethod(!isLoginMethod)
    // Reset form when switching between login/signup
    setFormData({
      username: '',
      name: '',
      email: '',
      password: ''
    })
  }

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer_left}>
            <div className={styles.header}>
              <h1 className={styles.heading}>
                {isLoginMethod ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className={styles.subheading}>
                {isLoginMethod 
                  ? 'Sign in to your account to continue' 
                  : 'Sign up to get started'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputContainer}>
                {!isLoginMethod && (
                  <>
                    <div className={styles.inputRow}>
                      <input
                        className={styles.inputField}
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        className={styles.inputField}
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required={!isLoginMethod}
                      />
                    </div>
                    <input
                      className={styles.inputField}
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required={!isLoginMethod}
                    />
                  </>
                )}
                
                {isLoginMethod && (
                  <input
                    className={styles.inputField}
                    type="text"
                    name="username"
                    placeholder="Username or Email"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                )}
                
                <input
                  className={styles.inputField}
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.loadingText}>Processing...</span>
                ) : (
                  isLoginMethod ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <p className={styles.switchText}>
                {isLoginMethod ? "Don't have an account?" : "Already have an account?"}
                <button 
                  type="button" 
                  className={styles.switchButton}
                  onClick={toggleAuthMethod}
                >
                  {isLoginMethod ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          <div className={styles.cardContainer_right}>
            <div className={styles.illustration}>
              <div className={styles.illustrationContent}>
                <h2 className={styles.illustrationTitle}>
                  {isLoginMethod ? 'Welcome Back!' : 'Join Us Today!'}
                </h2>
                <p className={styles.illustrationText}>
                  {isLoginMethod
                    ? 'Access your personalized dashboard and continue your journey with us.'
                    : 'Create your account and unlock all the features we have to offer.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}

export default LoginComponent