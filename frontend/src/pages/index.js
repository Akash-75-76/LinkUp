import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import UserLayout from "@/layout/userLayout";
import React, { useEffect } from "react"; // ✅ Import React and useEffect

export default function Home() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);

  // Redirect to dashboard if already logged in
  useEffect(() => { // ✅ Use useEffect directly, not React.useEffect
    if (authState.loggedIn && authState.profileFetched) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, authState.profileFetched, router]);

  return (
    <>
      <Head>
        <title>LinkUP - Connect With Professionals</title>
        <meta name="description" content="A professional networking platform to connect with friends and colleagues" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <UserLayout>
        <div className={styles.container}>
          <div className={styles.mainContainer}>
            <div className={styles.mainContainer_left}>
              <h1 className={styles.heroTitle}>Connect With Professionals</h1>
              <p className={styles.heroSubtitle}>A true professional networking platform, authentic connections without the noise</p>
              <div
                onClick={() => {
                  router.push(authState.loggedIn ? "/dashboard" : "/login");
                }}
                className={styles.buttonJoin}
              >
                <p>{authState.loggedIn ? "Go to Dashboard" : "Join Now"}</p>
              </div>
              {!authState.loggedIn && (
                <p className={styles.loginHint}>
                  Already have an account?{" "}
                  <span 
                    className={styles.loginLink} 
                    onClick={() => router.push("/login")}
                  >
                    Sign In
                  </span>
                </p>
              )}
            </div>
            <div className={styles.mainContainer_right}>
              <img 
                src="/connections.jpg" 
                alt="Professional networking connections" 
                className={styles.heroImage}
              />
            </div>
          </div>

          {/* Features Section */}
          <div className={styles.featuresSection}>
            <h2 className={styles.featuresTitle}>Why Choose LinkUP?</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>👥</div>
                <h3>Build Your Network</h3>
                <p>Connect with professionals in your industry and expand your professional circle</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>💼</div>
                <h3>Career Opportunities</h3>
                <p>Discover new job opportunities and career growth possibilities</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📊</div>
                <h3>Share Insights</h3>
                <p>Post updates, share industry insights, and engage with your network</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🔍</div>
                <h3>Discover Talent</h3>
                <p>Find and connect with talented professionals across various industries</p>
              </div>
            </div>
          </div>
        </div>
      </UserLayout>
    </>
  );
}