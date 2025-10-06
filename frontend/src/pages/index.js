import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import UserLayout from "@/layout/userLayout";
import React, { useEffect } from "react";
import {
  People,
  Business,
  Link,
  Work,
  Article,
  Search,
  TrendingUp,
  Public,
  ArrowForward,
  CheckCircle,
  Groups,
  ConnectWithoutContact,
  RocketLaunch,
  EmojiPeople
} from "@mui/icons-material";

export default function Home() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (authState.loggedIn && authState.profileFetched) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, authState.profileFetched, router]);

  const handleCTAClick = () => {
    router.push(authState.loggedIn ? "/dashboard" : "/register");
  };

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <>
      <Head>
        <title>LinkUP - Connect With Professionals</title>
        <meta name="description" content="A professional networking platform to connect with professionals and build your career" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <UserLayout>
        <div className={styles.container}>
          {/* Hero Section */}
          <section className={styles.heroSection}>
            <div className={styles.heroContainer}>
              <div className={styles.heroContent}>
                <div className={styles.heroText}>
                  <h1 className={styles.heroTitle}>
                    Build Your 
                    <span className={styles.highlight}> Professional</span> 
                    Network
                  </h1>
                  <p className={styles.heroSubtitle}>
                    Connect with industry professionals, discover career opportunities, and grow your professional presence in a platform designed for meaningful connections.
                  </p>
                  <div className={styles.heroActions}>
                    <button 
                      onClick={handleCTAClick}
                      className={styles.primaryButton}
                    >
                      <span className={styles.buttonText}>
                        {authState.loggedIn ? "Go to Dashboard" : "Start Your Journey"}
                      </span>
                      <ArrowForward className={styles.buttonArrow} />
                    </button>
                    {!authState.loggedIn && (
                      <button 
                        onClick={handleLoginClick}
                        className={styles.secondaryButton}
                      >
                        Sign In to Your Account
                      </button>
                    )}
                  </div>
                  {!authState.loggedIn && (
                    <div className={styles.heroStats}>
                      <div className={styles.stat}>
                        <People className={styles.statIcon} />
                        <span className={styles.statNumber}>10K+</span>
                        <span className={styles.statLabel}>Professionals</span>
                      </div>
                      <div className={styles.stat}>
                        <Business className={styles.statIcon} />
                        <span className={styles.statNumber}>5K+</span>
                        <span className={styles.statLabel}>Companies</span>
                      </div>
                      <div className={styles.stat}>
                        <Link className={styles.statIcon} />
                        <span className={styles.statNumber}>50K+</span>
                        <span className={styles.statLabel}>Connections</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.heroVisual}>
                  <div className={styles.heroImageContainer}>
                    <img 
                      src="/connections.jpg" 
                      alt="Professional networking connections" 
                      className={styles.heroImage}
                    />
                    <div className={styles.floatingCard}>
                      <div className={styles.cardHeader}>
                        <div className={styles.cardAvatar}></div>
                        <div className={styles.cardInfo}>
                          <span className={styles.cardName}>Kshitij Walke</span>
                          <span className={styles.cardTitle}>Intern</span>
                        </div>
                        <CheckCircle className={styles.verifiedIcon} />
                      </div>
                      <p className={styles.cardText}>
                        <EmojiPeople className={styles.quoteIcon} />
                        Just landed my dream job through LinkUP!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className={styles.featuresSection}>
            <div className={styles.featuresContainer}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Why Professionals Choose LinkUP</h2>
                <p className={styles.sectionSubtitle}>
                  Built for professionals who want to make meaningful connections and advance their careers
                </p>
              </div>
              
              <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconContainer}>
                    <Groups className={styles.featureIcon} />
                  </div>
                  <h3 className={styles.featureTitle}>Build Meaningful Connections</h3>
                  <p className={styles.featureDescription}>
                    Connect with professionals in your industry and expand your network with authentic relationships that matter.
                  </p>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIconContainer}>
                    <Work className={styles.featureIcon} />
                  </div>
                  <h3 className={styles.featureTitle}>Career Opportunities</h3>
                  <p className={styles.featureDescription}>
                    Discover new job opportunities, career growth possibilities, and connect with companies looking for your skills.
                  </p>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIconContainer}>
                    <Article className={styles.featureIcon} />
                  </div>
                  <h3 className={styles.featureTitle}>Share Professional Insights</h3>
                  <p className={styles.featureDescription}>
                    Post updates, share industry insights, articles, and engage with your network through meaningful content.
                  </p>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIconContainer}>
                    <Search className={styles.featureIcon} />
                  </div>
                  <h3 className={styles.featureTitle}>Discover Talent</h3>
                  <p className={styles.featureDescription}>
                    Find and connect with talented professionals across various industries and expand your professional horizons.
                  </p>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIconContainer}>
                    <TrendingUp className={styles.featureIcon} />
                  </div>
                  <h3 className={styles.featureTitle}>Professional Growth</h3>
                  <p className={styles.featureDescription}>
                    Access resources, mentorship opportunities, and industry insights to accelerate your professional development.
                  </p>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIconContainer}>
                    <Public className={styles.featureIcon} />
                  </div>
                  <h3 className={styles.featureTitle}>Global Network</h3>
                  <p className={styles.featureDescription}>
                    Connect with professionals worldwide and build a global network that transcends geographical boundaries.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          {!authState.loggedIn && (
            <section className={styles.ctaSection}>
              <div className={styles.ctaContainer}>
                <div className={styles.ctaContent}>
                  <RocketLaunch className={styles.ctaIcon} />
                  <h2 className={styles.ctaTitle}>Ready to Transform Your Professional Journey?</h2>
                  <p className={styles.ctaSubtitle}>
                    Join thousands of professionals who are already building their networks and advancing their careers on LinkUP.
                  </p>
                  <div className={styles.ctaActions}>
                    <button 
                      onClick={handleCTAClick}
                      className={styles.ctaButton}
                    >
                      Create Your Profile
                      <ArrowForward className={styles.ctaButtonArrow} />
                    </button>
                    <button 
                      onClick={handleLoginClick}
                      className={styles.ctaSecondaryButton}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className={styles.footer}>
            <div className={styles.footerContainer}>
              <div className={styles.footerContent}>
                <div className={styles.footerBrand}>
                  <ConnectWithoutContact className={styles.footerLogoIcon} />
                  <h3 className={styles.footerLogo}>LinkUP</h3>
                  <p className={styles.footerDescription}>
                    Connecting professionals, building careers, and creating opportunities since 2024.
                  </p>
                </div>
                <div className={styles.footerLinks}>
                  <div className={styles.footerColumn}>
                    <h4>Platform</h4>
                    <a href="#">About</a>
                    <a href="#">Features</a>
                    <a href="#">Pricing</a>
                    <a href="#">Careers</a>
                  </div>
                  <div className={styles.footerColumn}>
                    <h4>Resources</h4>
                    <a href="#">Help Center</a>
                    <a href="#">Blog</a>
                    <a href="#">Community</a>
                    <a href="#">Events</a>
                  </div>
                  <div className={styles.footerColumn}>
                    <h4>Legal</h4>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Cookie Policy</a>
                    <a href="#">Security</a>
                  </div>
                </div>
              </div>
              <div className={styles.footerBottom}>
                <p>&copy; 2024 LinkUP. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </UserLayout>
    </>
  );
}