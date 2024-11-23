import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  test('renders login form by default', () => {
    renderLoginPage();
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\? register/i)).toBeInTheDocument();
  });

  test('switches to registration form', () => {
    renderLoginPage();
    
    fireEvent.click(screen.getByText(/don't have an account\? register/i));
    
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account\? login/i)).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    const mockUser = { username: 'testuser' };
    mockFetchSuccess({ 
      access_token: 'mock-token',
      user: mockUser
    });

    renderLoginPage();
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
    });
  });

  test('handles failed login', async () => {
    mockFetchError('Invalid credentials');

    renderLoginPage();
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('handles successful registration', async () => {
    mockFetchSuccess({ message: 'User registered successfully' });

    renderLoginPage();
    
    fireEvent.click(screen.getByText(/don't have an account\? register/i));
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'newuser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' }
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText('Registration successful! Please log in.')).toBeInTheDocument();
    });
  });

  test('handles failed registration', async () => {
    mockFetchError('Username already exists');

    renderLoginPage();
    
    fireEvent.click(screen.getByText(/don't have an account\? register/i));
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'existinguser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' }
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    renderLoginPage();
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });

  test('handles account lockout', async () => {
    mockFetchError('Account is locked', 403);

    renderLoginPage();
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/account is locked/i)).toBeInTheDocument();
    });
  });
});
