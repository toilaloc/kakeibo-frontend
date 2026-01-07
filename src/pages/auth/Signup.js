import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { UI_MESSAGES, VALIDATION_RULES } from '../../utils/constants';
import useFormValidation from '../../hooks/useFormValidation';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import styles from '../../styles/Signup.module.css';

function Signup() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { error, clearError } = useAuth();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState('');

  const { values, errors, touched, handleChange, setFieldValue, setFieldError, resetForm } = useFormValidation({
    display_name: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  useEffect(() => {
    if (error) {
      setMessage(error);
      clearError();
    }
  }, [error, clearError]);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'display_name':
        if (!value.trim()) return 'Display name is required';
        if (value.trim().length < 2) return 'Display name must be at least 2 characters';
        if (value.trim().length > 50) return 'Display name must be less than 50 characters';
        return '';
      case 'first_name':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (value.trim().length > 50) return 'First name must be less than 50 characters';
        return '';
      case 'last_name':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (value.trim().length > 50) return 'Last name must be less than 50 characters';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!VALIDATION_RULES.EMAIL.PATTERN.test(value)) {
          return VALIDATION_RULES.EMAIL.MESSAGE;
        }
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain uppercase, lowercase, and number';
        }
        return '';
      case 'password_confirmation':
        if (!value) return 'Password confirmation is required';
        if (value !== values.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  }, [values.password]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setFieldError(name, error);
    }
  }, [validateField, setFieldError]);

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files[0];
    setAvatarError('');

    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setAvatarError('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('File must be PNG, JPG, GIF, or WebP');
      e.target.value = '';
      return;
    }

    setAvatarFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeAvatar = useCallback(() => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError('');
    // Reset file input
    const fileInput = document.getElementById('avatar-input');
    if (fileInput) fileInput.value = '';
  }, []);

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z\d]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 3) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 4) return { level: 3, label: 'Good', color: '#3b82f6' };
    return { level: 4, label: 'Strong', color: '#10b981' };
  };

  const isStepValid = (step) => {
    if (step === 1) {
      return values.first_name && values.last_name && values.display_name &&
             !errors.first_name && !errors.last_name && !errors.display_name;
    }
    if (step === 2) {
      return values.email && !errors.email;
    }
    if (step === 3) {
      return values.password && values.password_confirmation &&
             !errors.password && !errors.password_confirmation;
    }
    return false;
  };

  const nextStep = () => {
    if (currentStep < 3 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const fieldErrors = {};
    Object.keys(values).forEach(key => {
      const error = validateField(key, values[key]);
      if (error) fieldErrors[key] = error;
    });

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Use FormData for multipart/form-data when avatar is present
      let signupData;
      
      if (avatarFile) {
        signupData = new FormData();
        signupData.append('user[display_name]', values.display_name.trim());
        signupData.append('user[first_name]', values.first_name.trim());
        signupData.append('user[last_name]', values.last_name.trim());
        signupData.append('user[email]', values.email);
        signupData.append('user[password]', values.password);
        signupData.append('user[password_confirmation]', values.password_confirmation);
        signupData.append('user[avatar]', avatarFile);
      } else {
        signupData = {
          user: {
            display_name: values.display_name.trim(),
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim(),
            email: values.email,
            password: values.password,
            password_confirmation: values.password_confirmation
          }
        };
      }

      await signup(signupData);
      setMessage(UI_MESSAGES.SIGNUP_SUCCESS);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Object.keys(values).every(key =>
    values[key] && !errors[key] && touched[key]
  ) && values.password === values.password_confirmation;

  return (
    <div className={styles.signupContainer}>
      <Card className={styles.signupCard} shadow="large" rounded="large">
        <div className={styles.signupHeader}>
          <div className={styles.logo}>
            <img src="/nya-emoji/nyaan-nya.png" alt="Kakeibo" className={styles.logoImage} />
          </div>
          <h1 className={styles.title}>Join Kakeibo</h1>
          <p className={styles.subtitle}>Create your account to start tracking finances</p>

          {/* Progress indicator */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
            <div className={styles.stepIndicators}>
              {[1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`${styles.stepIndicator} ${currentStep >= step ? styles.active : ''}`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.signupForm}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Personal Information</h3>
              <div className={styles.nameRow}>
                <div className={styles.inputGroup}>
                  <Input
                    type="text"
                    name="first_name"
                    value={values.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your first name"
                    label="First Name"
                    error={touched.first_name ? errors.first_name : ''}
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <div className={styles.inputGroup}>
                  <Input
                    type="text"
                    name="last_name"
                    value={values.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your last name"
                    label="Last Name"
                    error={touched.last_name ? errors.last_name : ''}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <Input
                  type="text"
                  name="display_name"
                  value={values.display_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="How others will see you"
                  label="Display Name"
                  error={touched.display_name ? errors.display_name : ''}
                  required
                  disabled={loading}
                />
              </div>

              {/* Avatar Upload */}
              <div className={styles.avatarSection}>
                <label className={styles.avatarLabel}>Profile Picture (Optional)</label>
                
                <div className={styles.avatarUploadContainer}>
                  {/* Avatar Preview */}
                  <div className={styles.avatarPreview}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className={styles.avatarImage} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <svg className={styles.avatarIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className={styles.avatarControls}>
                    <input
                      id="avatar-input"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      disabled={loading}
                      className={styles.avatarInput}
                    />
                    <label htmlFor="avatar-input" className={styles.avatarUploadButton}>
                      <svg className={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {avatarFile ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className={styles.avatarRemoveButton}
                        disabled={loading}
                      >
                        <svg className={styles.removeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {avatarError && (
                  <div className={styles.avatarError}>
                    {avatarError}
                  </div>
                )}

                <small className={styles.avatarHelp}>
                  PNG, JPG, GIF or WebP. Max size 5MB.
                </small>
              </div>
            </div>
          )}

          {/* Step 2: Account Information */}
          {currentStep === 2 && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Account Information</h3>
              <div className={styles.inputGroup}>
                <Input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="your.email@example.com"
                  label="Email Address"
                  error={touched.email ? errors.email : ''}
                  required
                  disabled={loading}
                  autoFocus
                />
                <small className={styles.inputHelp}>
                  We'll use this to send you important updates and receipts
                </small>
              </div>
            </div>
          )}

          {/* Step 3: Security */}
          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Create Password</h3>
              <div className={styles.inputGroup}>
                <Input
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Create a strong password"
                  label="Password"
                  error={touched.password ? errors.password : ''}
                  required
                  disabled={loading}
                  autoFocus
                />
                {values.password && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthMeter}>
                      <div
                        className={styles.strengthFill}
                        style={{
                          width: `${(getPasswordStrength(values.password).level / 4) * 100}%`,
                          backgroundColor: getPasswordStrength(values.password).color
                        }}
                      />
                    </div>
                    <span
                      className={styles.strengthLabel}
                      style={{ color: getPasswordStrength(values.password).color }}
                    >
                      {getPasswordStrength(values.password).label}
                    </span>
                  </div>
                )}
                <small className={styles.inputHelp}>
                  Use at least 8 characters with uppercase, lowercase, and numbers
                </small>
              </div>
              <div className={styles.inputGroup}>
                <Input
                  type="password"
                  name="password_confirmation"
                  value={values.password_confirmation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                  label="Confirm Password"
                  error={touched.password_confirmation ? errors.password_confirmation : ''}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className={styles.formActions}>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={prevStep}
                disabled={loading}
                className={styles.backButton}
              >
                Back
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                variant="primary"
                onClick={nextStep}
                disabled={!isStepValid(currentStep) || loading}
                className={styles.nextButton}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={loading || !isStepValid(3)}
                loading={loading}
                className={styles.submitButton}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            )}
          </div>
        </form>

        {message && (
          <div className={`${styles.message} ${message.includes('Error') || message.includes('fix') ? styles.error : styles.success}`}>
            <div className={styles.messageIcon}>
              {message.includes('Error') || message.includes('fix') ? '⚠️' : '✅'}
            </div>
            <div className={styles.messageContent}>
              {message}
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.loginLink}>
              Sign in here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Signup;