import UserLayout from "@/layout/userLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import styles from "./style.module.css";
import { loginUser } from "@/config/redux/action/authAction";

// Material-UI Icons
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import LoginIcon from "@mui/icons-material/Login";
import GoogleIcon from "@mui/icons-material/Google";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GroupsIcon from "@mui/icons-material/Groups";
import WorkIcon from "@mui/icons-material/Work";
import InsightsIcon from "@mui/icons-material/Insights";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await dispatch(loginUser({ email, password, rememberMe })).unwrap();
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterRedirect = () => {
    router.push("/register");
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          {/* Left Card - Form */}
          <div className={styles.cardContainer_left}>
            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>
                Welcome Back
              </h1>
              <p className={styles.formSubtitle}>
                Sign in to your professional network
              </p>
              {authState.message && (
                <div className={styles.messageBanner}>
                  {authState.message}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  <EmailIcon className={styles.inputIcon} />
                  Email Address
                </label>
                <input
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className={styles.inputField}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  <LockIcon className={styles.inputIcon} />
                  Password
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.inputField}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  required
                />
              </div>

              <div className={styles.rememberMe}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={styles.checkbox}
                  />
                  {rememberMe ? (
                    <CheckBoxIcon className={styles.checkboxIcon} />
                  ) : (
                    <CheckBoxOutlineBlankIcon className={styles.checkboxIcon} />
                  )}
                  <span className={styles.checkboxText}>Remember me</span>
                </label>
                <a href="#" className={styles.forgotPassword}>
                  Forgot password?
                </a>
              </div>

              <button 
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || !email || !password}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LoginIcon className={styles.buttonIcon} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className={styles.authSwitch}>
              <p className={styles.switchText}>
                Don't have an account?
                <button 
                  type="button"
                  onClick={handleRegisterRedirect}
                  className={styles.switchButton}
                  disabled={isSubmitting}
                >
                  <PersonAddIcon className={styles.buttonIcon} />
                  Sign Up
                </button>
              </p>
            </div>

            <div className={styles.socialAuth}>
              <div className={styles.divider}>
                <span>Or continue with</span>
              </div>
              <div className={styles.socialButtons}>
                <button type="button" className={styles.socialButton}>
                  <GoogleIcon className={styles.socialIcon} />
                  Google
                </button>
                <button type="button" className={styles.socialButton}>
                  <LinkedInIcon className={styles.socialIcon} />
                  LinkedIn
                </button>
              </div>
            </div>
          </div>

          {/* Right Card - Info */}
          <div className={styles.cardContainer_right}>
            <div className={styles.infoContent}>
              <h2>Connect with Professionals</h2>
              <p>Join thousands of professionals building their careers on LinkUP</p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <GroupsIcon className={styles.featureIcon} />
                  <span>Build your professional network</span>
                </div>
                <div className={styles.feature}>
                  <WorkIcon className={styles.featureIcon} />
                  <span>Discover career opportunities</span>
                </div>
                <div className={styles.feature}>
                  <InsightsIcon className={styles.featureIcon} />
                  <span>Share your insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default LoginComponent;