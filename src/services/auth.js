import { API_BASE_URL } from '../utils/constants';

export const getAuthHeaders = (token) => {
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const sendMagicLink = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/magic_links/request_magic_link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to send magic link');
  }

  return response.json();
};

export const verifyToken = async (token, email) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/magic_links/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Invalid token or email');
  }

  return response.json();
};

export const signup = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create account');
  }

  return response.json();
};