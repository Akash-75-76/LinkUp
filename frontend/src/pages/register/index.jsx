import UserLayout from "@/layout/userLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import styles from "./register.module.css";
import { registerUser } from "../../config/redux/action/authAction/index.js";

// Material-UI Icons
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import InsightsIcon from "@mui/icons-material/Insights";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import LoginIcon from "@mui/icons-material/Login";

function RegisterComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // Basic Info
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile Info
  const [bio, setBio] = useState("");
  const [currentPost, setCurrentPost] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  
  // Education
  const [education, setEducation] = useState([
    { school: "", degree: "", fieldOfStudy: "", years: "" }
  ]);
  
  // Work Experience
  const [workExperience, setWorkExperience] = useState([
    { company: "", position: "", years: "", description: "" }
  ]);

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      setProfilePicture(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePreview("");
    const fileInput = document.getElementById('profile-picture');
    if (fileInput) fileInput.value = '';
  };

  const handleAddEducation = () => {
    setEducation([...education, { school: "", degree: "", fieldOfStudy: "", years: "" }]);
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
    setWorkExperience([...workExperience, { company: "", position: "", years: "", description: "" }]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
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
      const filteredEducation = education.filter(edu => 
        edu.school.trim() || edu.degree.trim() || edu.fieldOfStudy.trim()
      );
      
      const filteredWork = workExperience.filter(work => 
        work.company.trim() || work.position.trim() || work.years.trim()
      );

      await dispatch(registerUser({ 
        name, 
        username, 
        email, 
        password,
        bio,
        currentPost,
        profilePicture,
        education: filteredEducation,
        pastWork: filteredWork
      })).unwrap();
      
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

  const isStep1Valid = name && username && email && password && confirmPassword && password === confirmPassword;

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          {/* Left Card - Form */}
          <div className={styles.cardContainer_left}>
            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>Create Your Professional Profile</h1>
              <p className={styles.formSubtitle}>
                {step === 1 ? "Step 1: Basic Information" : "Step 2: Professional Details"}
              </p>
            </div>

            {/* Progress Bar */}
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: step === 1 ? '50%' : '100%' }}
              ></div>
              <div className={styles.progressSteps}>
                <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                  <PersonIcon className={styles.stepIcon} />
                </div>
                <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                  <DescriptionIcon className={styles.stepIcon} />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.registrationForm}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className={styles.formStep}>
                  {/* Profile Picture Upload */}
                  <div className={styles.profilePictureSection}>
                    <label className={styles.sectionLabel}>Profile Picture (Optional)</label>
                    <div className={styles.profilePictureContainer}>
                      {profilePreview ? (
                        <div className={styles.profilePreview}>
                          <img 
                            src={profilePreview} 
                            alt="Profile preview" 
                            className={styles.profilePreviewImage}
                          />
                          <button 
                            type="button" 
                            onClick={removeProfilePicture}
                            className={styles.removeProfileButton}
                          >
                            <DeleteIcon className={styles.buttonIcon} />
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className={styles.profileUploadArea}>
                          <label htmlFor="profile-picture" className={styles.uploadLabel}>
                            <AddPhotoAlternateIcon className={styles.uploadIcon} />
                            <span>Upload Profile Picture</span>
                            <span className={styles.uploadHint}>JPEG, PNG, GIF • Max 5MB</span>
                          </label>
                          <input
                            id="profile-picture"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className={styles.uploadInput}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        <PersonIcon className={styles.inputIcon} />
                        Full Name *
                      </label>
                      <input
                        onChange={(e) => setName(e.target.value)}
                        className={styles.inputField}
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        <PersonIcon className={styles.inputIcon} />
                        Username *
                      </label>
                      <input
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.inputField}
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      <EmailIcon className={styles.inputIcon} />
                      Email Address *
                    </label>
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.inputField}
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      required
                    />
                  </div>

                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        <LockIcon className={styles.inputIcon} />
                        Password *
                      </label>
                      <input
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.inputField}
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        required
                        minLength="6"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        <LockIcon className={styles.inputIcon} />
                        Confirm Password *
                      </label>
                      <input
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.inputField}
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        required
                      />
                    </div>
                  </div>

                  {password && confirmPassword && password !== confirmPassword && (
                    <div className={styles.errorMessage}>
                      Passwords do not match
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Profile Information */}
              {step === 2 && (
                <div className={styles.formStep}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      <PersonIcon className={styles.inputIcon} />
                      Professional Bio
                    </label>
                    <textarea
                      onChange={(e) => setBio(e.target.value)}
                      className={styles.textareaField}
                      placeholder="Tell us about your professional background, skills, and interests..."
                      value={bio}
                      rows="4"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      <WorkIcon className={styles.inputIcon} />
                      Current Position
                    </label>
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
                      <h4>
                        <SchoolIcon className={styles.sectionIcon} />
                        Education
                      </h4>
                      <button type="button" onClick={handleAddEducation} className={styles.addButton}>
                        <AddIcon className={styles.buttonIcon} />
                        Add Education
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
                        <div className={styles.inputRow}>
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
                          <div className={styles.inputGroup}>
                            <label>Years</label>
                            <input
                              onChange={(e) => handleEducationChange(index, 'years', e.target.value)}
                              className={styles.inputField}
                              type="text"
                              placeholder="e.g., 2018-2022"
                              value={edu.years}
                            />
                          </div>
                        </div>
                        {education.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveEducation(index)}
                            className={styles.removeButton}
                          >
                            <RemoveIcon className={styles.buttonIcon} />
                            Remove Education
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Work Experience Section */}
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <h4>
                        <BusinessCenterIcon className={styles.sectionIcon} />
                        Work Experience
                      </h4>
                      <button type="button" onClick={handleAddWorkExperience} className={styles.addButton}>
                        <AddIcon className={styles.buttonIcon} />
                        Add Experience
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
                        <div className={styles.inputRow}>
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
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Description (Optional)</label>
                          <textarea
                            onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                            className={styles.textareaField}
                            placeholder="Describe your responsibilities and achievements..."
                            value={work.description}
                            rows="3"
                          />
                        </div>
                        {workExperience.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveWorkExperience(index)}
                            className={styles.removeButton}
                          >
                            <RemoveIcon className={styles.buttonIcon} />
                            Remove Experience
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            <div className={styles.buttonGroup}>
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className={styles.backButton}
                  disabled={isSubmitting}
                >
                  <ArrowBackIcon className={styles.buttonIcon} />
                  Back
                </button>
              )}
              
              {step < 2 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className={styles.nextButton}
                  disabled={!isStep1Valid}
                >
                  Continue
                  <ArrowForwardIcon className={styles.buttonIcon} />
                </button>
              ) : (
                <button 
                  type="submit"
                  onClick={handleSubmit}
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinner}></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Complete Registration
                    </>
                  )}
                </button>
              )}
            </div>

            <div className={styles.authSwitch}>
              <p className={styles.switchText}>
                Already have an account?
                <button 
                  type="button"
                  onClick={() => router.push("/login")}
                  className={styles.switchButton}
                >
                  <LoginIcon className={styles.buttonIcon} />
                  Sign In
                </button>
              </p>
            </div>
          </div>

          {/* Right Card - Info */}
          <div className={styles.cardContainer_right}>
            <div className={styles.infoContent}>
              <h2>Join Our Professional Network</h2>
              <p>Connect with professionals and grow your career</p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <GroupsIcon className={styles.featureIcon} />
                  <div className={styles.featureText}>
                    <strong>Build Your Network</strong>
                    <span>Connect with professionals in your industry</span>
                  </div>
                </div>
                <div className={styles.feature}>
                  <BusinessCenterIcon className={styles.featureIcon} />
                  <div className={styles.featureText}>
                    <strong>Career Opportunities</strong>
                    <span>Discover new job opportunities</span>
                  </div>
                </div>
                <div className={styles.feature}>
                  <InsightsIcon className={styles.featureIcon} />
                  <div className={styles.featureText}>
                    <strong>Share Insights</strong>
                    <span>Post updates and engage with your network</span>
                  </div>
                </div>
                <div className={styles.feature}>
                  <SearchIcon className={styles.featureIcon} />
                  <div className={styles.featureText}>
                    <strong>Discover Talent</strong>
                    <span>Find and connect with professionals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default RegisterComponent;