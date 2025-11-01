import React from 'react';
import { AuthForm } from '../components/auth/AuthForm';

export function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900">AI Studio</h1>
          <h2 className="mt-6 text-center text-xl text-gray-600">Create your account</h2>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}

