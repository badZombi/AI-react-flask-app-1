import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, passwordRequirements } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from password change
  React.useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const renderPasswordRequirements = () => {
    if (!passwordRequirements || !isRegistering) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const result = await register(username, password, confirmPassword);
      if (result.success) {
        setIsRegistering(false);
        setSuccess('Registration successful! Please log in.');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(result.error);
      }
    } else {
      const result = await login(username, password);
      if (result.success) {
        // Redirect to the protected page they tried to visit, or home
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        
        {renderPasswordRequirements()}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          {isRegistering && (
            <div style={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          )}
          
          <button type="submit" style={styles.button}>
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        
        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
            setSuccess('');
            setUsername('');
            setPassword('');
            setConfirmPassword('');
          }}
          style={styles.toggleButton}
        >
          {isRegistering
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
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
  toggleButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#007bff',
    marginTop: '20px',
    cursor: 'pointer',
    fontSize: '14px',
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

export default LoginPage;
