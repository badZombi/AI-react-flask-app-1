import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccountSettings = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <h1>Account Settings</h1>
      
      <div style={styles.content}>
        <div style={styles.userInfo}>
          <h2>User Information</h2>
          <p>Username: {user.username}</p>
          <p>Account Created: {new Date(user.created_at).toLocaleDateString()}</p>
        </div>

        <div style={styles.actions}>
          <h2>Account Actions</h2>
          <Link to="/change-password" style={styles.button}>
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginTop: '20px',
  },
  userInfo: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  actions: {
    marginTop: '20px',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
  },
};

export default AccountSettings;
