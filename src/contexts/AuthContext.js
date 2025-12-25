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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token && email && !user) {
      setLoading(true);
      verifyToken(token, email)
        .then(data => {
          if (data.access_token && data.user) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setToken(data.access_token);
            setUser(data.user);
            navigate('/');
          }
        })
        .catch(error => {
          console.error('Verification failed:', error);
          setError('Invalid or expired magic link. Please try logging in again.');
          navigate('/login');
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams, user, navigate]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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