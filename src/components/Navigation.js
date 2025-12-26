import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Navigation.module.css';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: '/nya-emoji/juutai-nya.gif'
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: '/nya-emoji/memo-nya.png'
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: '/nya-emoji/medetai-nya.gif'
    },
    {
      path: '/diaries',
      label: 'Diaries',
      icon: '/nya-emoji/nyaan-nya.png'
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.navContainer}>
        <div className={styles.navBrand}>
          <Link to="/" className={styles.brandLink}>
            <img src="/nya-emoji/nyaan-nya.png" alt="Nyaan" className={styles.brandIcon} />
            Kakeibo
          </Link>
        </div>

        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>
                <img src={item.icon} alt={item.label} className={styles.navIconImage} />
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className={styles.navUser}>
          {user && (
            <div className={styles.userInfo}>
              <span className={styles.userEmail}>{user.display_name}</span>
              <button
                onClick={logout}
                className={styles.logoutButton}
                title="Logout"
              >
                <img src="/nya-emoji/byebye-nya.gif" alt="Logout" className={styles.logoutIcon} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;