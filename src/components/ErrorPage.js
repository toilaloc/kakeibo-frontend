import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import styles from '../styles/ErrorPage.module.css';

const ErrorPage = ({ statusCode, title, message, showHomeButton = true }) => {
  const navigate = useNavigate();

  const handleHomeRedirect = () => {
    navigate('/');
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className={styles.errorContainer}>
      <Card className={styles.errorCard}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            {statusCode === 404 && '🔍'}
            {statusCode === 403 && '🚫'}
            {statusCode === 500 && '💥'}
            {statusCode === 422 && '⚠️'}
            {statusCode === 400 && '❌'}
            {!statusCode && '⚠️'}
          </div>
          <h1 className={styles.errorTitle}>{title}</h1>
          <div className={styles.errorCode}>{statusCode && `Error ${statusCode}`}</div>
          <p className={styles.errorMessage}>{message}</p>
          <div className={styles.errorActions}>
            {showHomeButton && (
              <Button onClick={handleHomeRedirect} className={styles.homeButton}>
                Go to Home
              </Button>
            )}
            <Button onClick={handleLoginRedirect} variant="secondary" className={styles.loginButton}>
              Go to Login
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ErrorPage;