import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRequirements, setPasswordRequirements] = useState(null);
  const navigate = useNavigate();

  // Check authentication status when component mounts
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Fetch password requirements
        await fetchPasswordRequirements();
        
        // Check token and authentication
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const decoded = jwt_decode(token);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp > currentTime) {
              // Token is still valid, verify with backend
              const authResult = await checkAuthStatus();
              if (!authResult) {
                // If backend check fails, clear auth state
                handleLogout('Session expired. Please log in again.');
              }
            } else {
              // Token is expired
              handleLogout('Session expired. Please log in again.');
            }
          } catch (error) {
            // Token is invalid
            handleLogout('Invalid session. Please log in again.');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
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
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await fetch('http://localhost:5002/api/auth/check-auth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
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

  // Provide a method to refresh the auth state
  const refreshAuth = async () => {
    return await checkAuthStatus();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      changePassword,
      passwordRequirements,
      loading,
      refreshAuth
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
