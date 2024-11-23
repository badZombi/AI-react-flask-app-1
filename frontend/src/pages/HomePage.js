import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div style={styles.container}>
      <h1>Welcome to the Auth Demo</h1>
      
      <div style={styles.content}>
        {user ? (
          <>
            <p>Hello, {user.username}!</p>
            <div style={styles.links}>
              <Link to="/protected" style={styles.link}>Go to Protected Page</Link>
              <Link to="/account-settings" style={styles.link}>Account Settings</Link>
              <button onClick={logout} style={styles.button}>Logout</button>
            </div>
          </>
        ) : (
          <div style={styles.links}>
            <Link to="/login" style={styles.link}>Login</Link>
          </div>
        )}
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
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    padding: '10px 20px',
    border: '1px solid #007bff',
    borderRadius: '5px',
    transition: 'all 0.3s ease',
    width: '200px',
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
    width: '200px',
  }
};

export default HomePage;
