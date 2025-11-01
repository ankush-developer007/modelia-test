import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup as signupService, login as loginService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../types';

interface AuthFormProps {
  mode: 'signup' | 'login';
}

export function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const authFn = mode === 'signup' ? signupService : loginService;
      const response = await authFn({ email, password });
      
      login(response.token, response.user);
      navigate('/studio');
    } catch (err: any) {
      const apiError: ApiError = err.response?.data || { error: 'An error occurred' };
      setError(apiError.error || apiError.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto mt-8 space-y-6"
      aria-label={mode === 'signup' ? 'Sign up form' : 'Login form'}
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-required="true"
          aria-invalid={error ? 'true' : 'false'}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-required="true"
          aria-invalid={error ? 'true' : 'false'}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />
        {mode === 'signup' && (
          <p className="mt-1 text-sm text-gray-500">Minimum 6 characters</p>
        )}
      </div>

      {error && (
        <div
          className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Processing...' : mode === 'signup' ? 'Sign Up' : 'Login'}
      </button>

      <p className="text-center text-sm text-gray-600">
        {mode === 'signup' ? (
          <>
            Already have an account?{' '}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Login
            </a>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <a
              href="/signup"
              className="text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Sign Up
            </a>
          </>
        )}
      </p>
    </form>
  );
}

