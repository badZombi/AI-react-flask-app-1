import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { changePassword, passwordRequirements } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    const result = await changePassword(currentPassword, newPassword, confirmPassword);
    
    if (result.success) {
      setMessage('Password changed successfully. You will be redirected to login...');
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password changed successfully. Please log in with your new password.' }
        });
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  const renderPasswordRequirements = () => {
    if (!passwordRequirements) return null;

    return (
      <div style={styles.requirements}>
        <h4>Password Requirements:</h4>
        <ul>
          <li>Minimum {passwordRequirements.min_length} characters</li>
          {passwordRequirements.require_mixed_case && (
            <li>Must contain both upper and lower case letters</li>
          )}
          {passwordRequirements.require_special && (
            <li>Must contain at least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)</li>
          )}
          <li>Cannot be the same as your last {passwordRequirements.history_limit} passwords</li>
        </ul>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2>Change Password</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}
        
        {renderPasswordRequirements()}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="currentPassword">Current Password:</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <button type="submit" style={styles.button}>
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    paddingTop: '50px',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  error: {
    color: '#dc3545',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f8d7da',
    borderRadius: '4px',
    textAlign: 'center',
  },
  success: {
    color: '#28a745',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#d4edda',
    borderRadius: '4px',
    textAlign: 'center',
  },
  requirements: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    fontSize: '14px',
  }
};

export default ChangePassword;
