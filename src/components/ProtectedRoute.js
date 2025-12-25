import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiresAuth = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (requiresAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requiresAuth && user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;