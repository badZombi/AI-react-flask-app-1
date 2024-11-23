import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedPage = () => {
  const { user, logout } = useAuth();

  return (
    <div style={styles.container}>
      <h1>Protected Page</h1>
      <div style={styles.content}>
        <p>Welcome to the protected page, {user.username}!</p>
        <p>This page is only accessible to authenticated users.</p>
        
        <div style={styles.navigation}>
          <Link to="/" style={styles.link}>Back to Home</Link>
          <button onClick={logout} style={styles.button}>Logout</button>
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
    textAlign: 'center',
  },
  content: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    padding: '10px 20px',
    border: '1px solid #007bff',
    borderRadius: '5px',
    transition: 'all 0.3s ease',
  },
  button: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
  }
};

export default ProtectedPage;
