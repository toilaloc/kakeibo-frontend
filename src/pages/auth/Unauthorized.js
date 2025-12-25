import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import styles from '../../styles/Unauthorized.module.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className={styles.unauthorizedContainer}>
      <Card className={styles.unauthorizedCard}>
        <div className={styles.unauthorizedContent}>
          <div className={styles.unauthorizedIcon}>🚫</div>
          <h1 className={styles.unauthorizedTitle}>Unauthorized Access</h1>
          <p className={styles.unauthorizedMessage}>
            You don't have permission to access this resource. Please log in to continue.
          </p>
          <Button onClick={handleLoginRedirect} className={styles.loginButton}>
            Go to Login
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized;