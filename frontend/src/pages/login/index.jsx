import UserLayout from "@/layout/userLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import styles from "./style.module.css";
import { loginUser, registerUser } from "@/config/redux/action/authAction";

function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [isLoginMethod, setIsLoginMethod] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  // ✅ Simplified redirect - only check loggedIn
  useEffect(() => {
    console.log('🔍 Auth State:', authState);
    if (authState.loggedIn) {
      console.log('🚀 Redirecting to dashboard...');
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    console.log("Form values:", { username, name, email, password, isLoginMethod });

    setIsSubmitting(true);
    
    try {
      if (isLoginMethod) {
        await dispatch(loginUser({ email, password })).unwrap();
      } else {
        await dispatch(registerUser({ username, password, email, name })).unwrap();
      }
      // ✅ After successful login/register, the useEffect above should trigger redirect
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          {/* Left Card */}
          <div className={styles.cardContainer_left}>
            <p className={styles.cardLeft_heading}>
              {isLoginMethod ? "Sign In" : "Sign Up"}
              <br />
              <span className={styles.messageText}>
                {authState.message || ""}
              </span>
            </p>

            <div className={styles.inputContainers}>
              {!isLoginMethod && (
                <div className={styles.inputRow}>
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.inputField}
                    type="text"
                    placeholder="username"
                    value={username}
                  />
                  <input
                    onChange={(e) => setName(e.target.value)}
                    className={styles.inputField}
                    type="text"
                    placeholder="name"
                    value={name}
                  />
                </div>
              )}
              <input
                onChange={(e) => setEmailAddress(e.target.value)}
                className={styles.inputField}
                type="email"
                placeholder="email"
                value={email}
              />
              <input
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                type="password"
                placeholder="password"
                value={password}
              />
            </div>

            <button 
              className={styles.submitBtn} 
              onClick={handleSubmit}
              disabled={isSubmitting || !email || !password || (!isLoginMethod && (!username || !name))}
            >
              {isSubmitting ? "Processing..." : isLoginMethod ? "Login" : "Register"}
            </button>

            <p
              className={styles.switchText}
              onClick={() => {
                if (!isSubmitting) {
                  setIsLoginMethod(!isLoginMethod);
                  setEmailAddress("");
                  setPassword("");
                  setUsername("");
                  setName("");
                }
              }}
            >
              {isLoginMethod
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </p>
          </div>

          {/* Right Card */}
          <div className={styles.cardContainer_right}>
            <h2>Welcome!</h2>
            <p>{isLoginMethod ? "Login to continue" : "Create your account"}</p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default LoginComponent;