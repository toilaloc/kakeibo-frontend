import React, { useState, useEffect, useCallback } from 'react';
import { sendMagicLink } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { UI_MESSAGES, VALIDATION_RULES } from '../../utils/constants';
import useFormValidation from '../../hooks/useFormValidation';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import styles from '../../styles/Login.module.css';

function Login() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { error, clearError } = useAuth();

  const { values, errors, touched, handleChange, handleBlur, resetForm } = useFormValidation({
    email: ''
  });

  useEffect(() => {
    if (error) {
      setMessage(error);
      clearError();
    }
  }, [error, clearError]);

  const validateEmail = useCallback((email) => {
    if (!email) return 'Email is required';
    if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
      return VALIDATION_RULES.EMAIL.MESSAGE;
    }
    return '';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const emailError = validateEmail(values.email);
    if (emailError) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await sendMagicLink(values.email);
      setMessage(UI_MESSAGES.MAGIC_LINK_SENT);
      resetForm();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = values.email && !errors.email && VALIDATION_RULES.EMAIL.PATTERN.test(values.email);

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard} shadow="large" rounded="large">
        <div className={styles.loginHeader}>
          <div className={styles.logo}>
            <img src="/nya-emoji/nyaan-nya.png" alt="Kakeibo" className={styles.logoImage} />
          </div>
          <h1 className={styles.title}>Welcome to Kakeibo</h1>
          <p className={styles.subtitle}>Sign in with your magic link</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <Input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your email address"
            label="Email Address"
            error={touched.email ? errors.email : ''}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={loading || !isFormValid}
            loading={loading}
            className={styles.submitButton}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </form>

        {message && (
          <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
            {message.includes('Error') ? '❌' : '✅'} {message}
          </div>
        )}

        <div className={styles.footer}>
          <p>We'll send you a secure link to access your account</p>
        </div>
      </Card>
    </div>
  );
}

export default Login;