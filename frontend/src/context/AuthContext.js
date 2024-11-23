import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRequirements, setPasswordRequirements] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch password requirements
    fetchPasswordRequirements();

    // Check if token exists and is valid on app load
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        if (decoded.exp * 1000 < Date.now()) {
          handleLogout('Session expired. Please log in again.');
        } else {
          checkAuthStatus();
        }
      } catch (error) {
        handleLogout('Invalid session. Please log in again.');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = (message = null) => {
    localStorage.removeItem('token');
    setUser(null);
    if (message) {
      navigate('/login', { state: { message } });
    } else {
      navigate('/login');
    }
  };

  const fetchPasswordRequirements = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/auth/password-requirements');
      if (response.ok) {
        const data = await response.json();
        setPasswordRequirements(data);
      }
    } catch (error) {
      console.error('Failed to fetch password requirements:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/auth/check-auth', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        const data = await response.json();
        handleLogout(data.error || 'Authentication failed');
      }
    } catch (error) {
      handleLogout('Connection error. Please try again.');
    }
  };

  const register = async (username, password, confirmPassword) => {
    try {
      const response = await fetch('http://localhost:5002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5002/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword, 
          confirmPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout('Session expired. Please log in again.');
          return { success: false, error: 'Session expired' };
        }
        throw new Error(data.error || 'Password change failed');
      }

      // On successful password change, log out the user
      handleLogout('Password changed successfully. Please log in with your new password.');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    handleLogout();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      changePassword,
      passwordRequirements,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
