import UserLayout from "@/layout/userLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import styles from "./register.module.css";
import { registerUser } from "@/config/redux/action/authAction";

function RegisterComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // For multi-step form

  // Basic Info
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile Info
  const [bio, setBio] = useState("");
  const [currentPost, setCurrentPost] = useState("");
  
  // Education
  const [education, setEducation] = useState([
    { school: "", degree: "", fieldOfStudy: "" }
  ]);
  
  // Work Experience
  const [workExperience, setWorkExperience] = useState([
    { company: "", position: "", years: "" }
  ]);

  // Redirect if already logged in
  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

  const handleAddEducation = () => {
    setEducation([...education, { school: "", degree: "", fieldOfStudy: "" }]);
  };

  const handleRemoveEducation = (index) => {
    if (education.length > 1) {
      const newEducation = education.filter((_, i) => i !== index);
      setEducation(newEducation);
    }
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = education.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    );
    setEducation(newEducation);
  };

  const handleAddWorkExperience = () => {
    setWorkExperience([...workExperience, { company: "", position: "", years: "" }]);
  };

  const handleRemoveWorkExperience = (index) => {
    if (workExperience.length > 1) {
      const newWork = workExperience.filter((_, i) => i !== index);
      setWorkExperience(newWork);
    }
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const newWork = workExperience.map((work, i) => 
      i === index ? { ...work, [field]: value } : work
    );
    setWorkExperience(newWork);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Validation
    if (!name || !username || !email || !password) {
      alert("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Filter out empty education and work entries
      const filteredEducation = education.filter(edu => 
        edu.school.trim() || edu.degree.trim() || edu.fieldOfStudy.trim()
      );
      
      const filteredWork = workExperience.filter(work => 
        work.company.trim() || work.position.trim() || work.years.trim()
      );

      await dispatch(registerUser({ 
        // Basic info
        name, 
        username, 
        email, 
        password,
        // Profile info
        bio,
        currentPost,
        education: filteredEducation,
        pastWork: filteredWork
      })).unwrap();
      
      // Registration successful - will redirect via useEffect
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!name || !username || !email || !password || !confirmPassword)) {
      alert("Please fill in all basic information fields");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          {/* Left Card - Form */}
          <div className={styles.cardContainer_left}>
            <p className={styles.cardLeft_heading}>
              Create Your Account
              <br />
              <span className={styles.messageText}>
                {authState.message || ""}
              </span>
            </p>

            {/* Step Indicator */}
            <div className={styles.stepIndicator}>
              <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                <span>1</span>
                <label>Basic Info</label>
              </div>
              <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                <span>2</span>
                <label>Profile</label>
              </div>
            </div>

            <div className={styles.inputContainers}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <>
                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label>Full Name *</label>
                      <input
                        onChange={(e) => setName(e.target.value)}
                        className={styles.inputField}
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Username *</label>
                      <input
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.inputField}
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Email Address *</label>
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.inputField}
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                    />
                  </div>

                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label>Password *</label>
                      <input
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.inputField}
                        type="password"
                        placeholder="Create a password"
                        value={password}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Confirm Password *</label>
                      <input
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.inputField}
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Profile Information */}
              {step === 2 && (
                <>
                  <div className={styles.inputGroup}>
                    <label>Bio</label>
                    <textarea
                      onChange={(e) => setBio(e.target.value)}
                      className={styles.textareaField}
                      placeholder="Tell us about yourself..."
                      value={bio}
                      rows="3"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Current Position</label>
                    <input
                      onChange={(e) => setCurrentPost(e.target.value)}
                      className={styles.inputField}
                      type="text"
                      placeholder="e.g., Software Engineer at ABC Company"
                      value={currentPost}
                    />
                  </div>

                  {/* Education Section */}
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <h4>Education</h4>
                      <button type="button" onClick={handleAddEducation} className={styles.addButton}>
                        + Add Education
                      </button>
                    </div>
                    {education.map((edu, index) => (
                      <div key={index} className={styles.dynamicFieldGroup}>
                        <div className={styles.inputRow}>
                          <div className={styles.inputGroup}>
                            <label>School/University</label>
                            <input
                              onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                              className={styles.inputField}
                              type="text"
                              placeholder="School name"
                              value={edu.school}
                            />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Degree</label>
                            <input
                              onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                              className={styles.inputField}
                              type="text"
                              placeholder="e.g., Bachelor's Degree"
                              value={edu.degree}
                            />
                          </div>
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Field of Study</label>
                          <input
                            onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                            className={styles.inputField}
                            type="text"
                            placeholder="e.g., Computer Science"
                            value={edu.fieldOfStudy}
                          />
                        </div>
                        {education.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveEducation(index)}
                            className={styles.removeButton}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Work Experience Section */}
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <h4>Work Experience</h4>
                      <button type="button" onClick={handleAddWorkExperience} className={styles.addButton}>
                        + Add Experience
                      </button>
                    </div>
                    {workExperience.map((work, index) => (
                      <div key={index} className={styles.dynamicFieldGroup}>
                        <div className={styles.inputRow}>
                          <div className={styles.inputGroup}>
                            <label>Company</label>
                            <input
                              onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                              className={styles.inputField}
                              type="text"
                              placeholder="Company name"
                              value={work.company}
                            />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Position</label>
                            <input
                              onChange={(e) => handleWorkExperienceChange(index, 'position', e.target.value)}
                              className={styles.inputField}
                              type="text"
                              placeholder="Your position"
                              value={work.position}
                            />
                          </div>
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Years/Duration</label>
                          <input
                            onChange={(e) => handleWorkExperienceChange(index, 'years', e.target.value)}
                            className={styles.inputField}
                            type="text"
                            placeholder="e.g., 2020-2022 or 2 years"
                            value={work.years}
                          />
                        </div>
                        {workExperience.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveWorkExperience(index)}
                            className={styles.removeButton}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className={styles.buttonGroup}>
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className={styles.backButton}
                >
                  Back
                </button>
              )}
              
              {step < 2 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className={styles.nextButton}
                >
                  Next
                </button>
              ) : (
                <button 
                  className={styles.submitBtn} 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              )}
            </div>

            <p
              className={styles.switchText}
              onClick={() => router.push("/login")}
            >
              Already have an account? Sign In
            </p>
          </div>

          {/* Right Card */}
          <div className={styles.cardContainer_right}>
            <h2>Welcome to LinkUP!</h2>
            <p>Join our professional network and connect with amazing people.</p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>👥</span>
                <span>Build your professional network</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>💼</span>
                <span>Discover career opportunities</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📊</span>
                <span>Share your insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default RegisterComponent;