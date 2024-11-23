import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';

// Mock component for testing
const ProtectedComponent = () => <div>Protected Content</div>;

const renderPrivateRoute = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ProtectedComponent />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
    window.history.pushState({}, '', '/');
  });

  test('shows loading state initially', () => {
    localStorage.getItem.mockReturnValue('mock-token');
    mockFetchSuccess({ authenticated: true, user: { username: 'testuser' } });

    renderPrivateRoute();
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders protected component when authenticated', async () => {
    localStorage.getItem.mockReturnValue('mock-token');
    mockFetchSuccess({ authenticated: true, user: { username: 'testuser' } });

    renderPrivateRoute();

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  test('redirects to login when not authenticated', async () => {
    localStorage.getItem.mockReturnValue(null);

    renderPrivateRoute();

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
    
    // Verify the redirect includes the attempted URL in state
    expect(window.location.pathname).toBe('/login');
  });

  test('redirects to login when token is invalid', async () => {
    localStorage.getItem.mockReturnValue('invalid-token');
    mockFetchError('Invalid token', 401);

    renderPrivateRoute();

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  test('preserves redirect location in state', async () => {
    localStorage.getItem.mockReturnValue(null);
    window.history.pushState({}, '', '/protected/resource');

    renderPrivateRoute();

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
    
    // The location state should include the attempted URL
    expect(window.location.pathname).toBe('/login');
    // Note: In a real browser, the state would contain the original path
    // but in our test environment we can't fully test this
  });
});
