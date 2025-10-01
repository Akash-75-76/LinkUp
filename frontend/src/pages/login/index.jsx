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

  const [email, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

  const handleSubmit = () => {
    console.log("Form values:", {
      username,
      name,
      email,
      password,
      isLoginMethod,
    }); // 🚀 log form values
    if (isLoginMethod) {
      dispatch(loginUser({ email, password }));
    } else {
      dispatch(registerUser({ username, password, email, name }));
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
              <span>
                {typeof authState.message === "string"
                  ? authState.message
                  : authState.message?.message || ""}
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
                  />
                  <input
                    onChange={(e) => setName(e.target.value)}
                    className={styles.inputField}
                    type="text"
                    placeholder="name"
                  />
                </div>
              )}
              <input
                onChange={(e) => setEmailAddress(e.target.value)}
                className={styles.inputField}
                type="email"
                placeholder="email"
              />
              <input
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                type="password"
                placeholder="password"
              />
            </div>

            <button className={styles.submitBtn} onClick={handleSubmit}>
              {isLoginMethod ? "Login" : "Register"}
            </button>

            <p
              className={styles.switchText}
              onClick={() => setIsLoginMethod(!isLoginMethod)}
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
