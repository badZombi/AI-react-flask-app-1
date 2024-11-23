import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch before tests
beforeEach(() => {
  // Reset fetch mock and localStorage before each test
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
});

// Test component that uses the auth context
const TestComponent = () => {
  const { user, login, logout, register } = useAuth();
  
  return (
    <div>
      {user ? (
        <>
          <div data-testid="user-info">Welcome {user.username}</div>
          <button onClick={logout} data-testid="logout-button">Logout</button>
        </>
      ) : (
        <>
          <button 
            onClick={() => login('testuser', 'password')} 
            data-testid="login-button"
          >
            Login
          </button>
          <button 
            onClick={() => register('newuser', 'password')} 
            data-testid="register-button"
          >
            Register
          </button>
        </>
      )}
    </div>
  );
};

const renderWithAuth = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  test('provides initial unauthenticated state', () => {
    renderWithAuth(<TestComponent />);
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });

  test('handles successful login', async () => {
    const mockUser = { username: 'testuser' };
    mockFetchSuccess({ 
      access_token: 'mock-token',
      user: mockUser
    });

    renderWithAuth(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome testuser');
      expect(fetch).toHaveBeenCalledWith('http://localhost:5002/api/auth/login', expect.any(Object));
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
  });

  test('handles failed login', async () => {
    mockFetchError('Invalid credentials');

    renderWithAuth(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith('http://localhost:5002/api/auth/login', expect.any(Object));
    });
    
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  test('handles successful registration', async () => {
    mockFetchSuccess({ message: 'User registered successfully' });

    renderWithAuth(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('register-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith('http://localhost:5002/api/auth/register', expect.any(Object));
    });
  });

  test('handles logout', async () => {
    // Setup initial authenticated state
    localStorage.setItem('token', 'mock-token');
    mockFetchSuccess({ 
      authenticated: true,
      user: { username: 'testuser' }
    });

    renderWithAuth(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  test('checks auth status on mount with valid token', async () => {
    localStorage.getItem.mockReturnValue('valid-token');
    mockFetchSuccess({ 
      authenticated: true,
      user: { username: 'testuser' }
    });

    renderWithAuth(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome testuser');
      expect(fetch).toHaveBeenCalledWith('http://localhost:5002/api/auth/check-auth', expect.any(Object));
    });
  });

  test('handles invalid token on mount', async () => {
    localStorage.getItem.mockReturnValue('invalid-token');
    mockFetchError('Invalid token', 401);

    renderWithAuth(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith('http://localhost:5002/api/auth/check-auth', expect.any(Object));
    });
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });
});
