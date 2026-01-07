import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Navigation.module.css';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
    if (user?.avatar_url) {
      console.log('Avatar URL loaded:', user.avatar_url);
    }
  }, [user?.avatar_url]);

  const handleAvatarError = () => {
    console.warn('Avatar image failed to load (likely CORS issue):', user?.avatar_url);
    setAvatarError(true);
  };

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: '/nya-emoji/juutai-nya.gif'
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: '/nya-emoji/think-nya.png'
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: '/nya-emoji/gohan-nya.png'
    },
    {
      path: '/diaries',
      label: 'Diaries',
      icon: '/nya-emoji/memo-nya.png'
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

        <div className={styles.navUser} ref={dropdownRef}>
          {user && (
            <>
              <button
                className={styles.userButton}
                onClick={() => setShowDropdown(!showDropdown)}
                title="User menu"
              >
                <div className={styles.userAvatar}>
                  {user.avatar_url && !avatarError ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.display_name} 
                      className={styles.avatarImage}
                      onError={handleAvatarError}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.display_name ? user.display_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <span className={styles.userName}>{user.display_name || user.email}</span>
                <svg className={`${styles.dropdownIcon} ${showDropdown ? styles.dropdownIconOpen : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownAvatar}>
                      {user.avatar_url && !avatarError ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.display_name} 
                          className={styles.avatarImage}
                          onError={handleAvatarError}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {user.display_name ? user.display_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    <div className={styles.dropdownUserInfo}>
                      <div className={styles.dropdownName}>{user.display_name || 'User'}</div>
                      <div className={styles.dropdownEmail}>{user.email}</div>
                      {(user.first_name || user.last_name) && (
                        <div className={styles.dropdownFullName}>
                          {user.first_name} {user.last_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.dropdownDivider}></div>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className={styles.dropdownLogout}
                  >
                    <img src="/nya-emoji/byebye-nya.gif" alt="Logout" className={styles.dropdownLogoutIcon} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;