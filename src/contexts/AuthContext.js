import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyToken } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Function to sync auth state from localStorage
  const syncAuthFromStorage = React.useCallback(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const currentPath = window.location.pathname;
    
    // Get current values to compare
    const currentToken = token;
    const currentUser = user;
    
    if (storedToken && storedToken !== currentToken) {
      console.log('Token changed, updating auth state');
      setToken(storedToken);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // If we have auth data and we're on login page, redirect to home
        if (currentPath === '/login') {
          console.log('Auth detected, redirecting to home from login page');
          navigate('/', { replace: true });
        }
      }
    } else if (!storedToken && currentToken) {
      // No token in storage but we have one in state - logout
      console.log('No token found, clearing auth state');
      setToken(null);
      setUser(null);
      if (currentPath !== '/login' && currentPath !== '/signup') {
        console.log('No auth token, redirecting to login');
        navigate('/login', { replace: true });
      }
    }
    
    // Update user data if it changed
    if (storedUser && !currentUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } else if (!storedUser && currentUser) {
      setUser(null);
    }
  }, [token, user, navigate]);

  // Function to trigger sync across all tabs
  const triggerAuthSync = () => {
    localStorage.setItem('auth-sync-trigger', Date.now().toString());
  };

  // Initial load from localStorage
  useEffect(() => {
    console.log('AuthProvider mounted, checking initial auth state');
    syncAuthFromStorage();
    setLoading(false);
  }, [syncAuthFromStorage]);

  // Continuous polling to sync auth state - this is the most reliable method
  useEffect(() => {
    const interval = setInterval(() => {
      syncAuthFromStorage();
    }, 1000); // Check every 1 second
    
    return () => clearInterval(interval);
  }, [syncAuthFromStorage]); // Only depend on syncAuthFromStorage callback

  // Listen for storage events (works when localStorage is changed from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user' || e.key === 'auth-sync-trigger') {
        console.log('Storage event detected:', e.key);
        syncAuthFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [syncAuthFromStorage]);

  // Listen for page focus (check when user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focus detected, syncing auth');
      syncAuthFromStorage();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncAuthFromStorage]);

  // Listen for page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible, syncing auth');
        syncAuthFromStorage();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncAuthFromStorage]);

  // Handle magic link verification
  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token && email && !user) {
      console.log('Magic link detected, verifying token...');
      setLoading(true);
      verifyToken(token, email)
        .then(data => {
          if (data.access_token && data.user) {
            console.log('Token verified successfully, saving auth data');
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setToken(data.access_token);
            setUser(data.user);
            
            // Trigger sync across all tabs
            triggerAuthSync();
            
            // Clear the URL parameters and navigate to home
            navigate('/', { replace: true });
          }
        })
        .catch(error => {
          console.error('Verification failed:', error);
          setError('Invalid or expired magic link. Please try logging in again.');
          // Clear URL parameters even on error
          navigate('/login', { replace: true });
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams, user, navigate]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    triggerAuthSync();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    triggerAuthSync();
    navigate('/login');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    error,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};