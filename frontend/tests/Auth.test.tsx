import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from '../src/components/auth/AuthForm';
import { BrowserRouter } from 'react-router-dom';
import * as authService from '../src/services/auth.service';
import { AuthProvider } from '../src/contexts/AuthContext';

// Mock auth service
vi.mock('../src/services/auth.service');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AuthForm', () => {
  it('renders signup form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthForm mode="signup" />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
  });

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthForm mode="login" />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
  });

  it('validates email input', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthForm mode="signup" />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    await waitFor(() => {
      expect(emailInput).toBeInvalid();
    });
  });

  it('shows error message on auth failure', async () => {
    vi.mocked(authService.signup).mockRejectedValue({
      response: {
        data: { error: 'User already exists' },
      },
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthForm mode="signup" />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/User already exists/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    vi.mocked(authService.signup).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              message: 'Success',
              token: 'mock-token',
              user: { id: 1, email: 'test@example.com' },
            });
          }, 100);
        })
    );

    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthForm mode="signup" />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Processing/i)).toBeInTheDocument();
  });
});

