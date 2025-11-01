import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getAuthData, clearAuthData, saveAuthData } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    // Load auth data from localStorage on mount
    const { user: savedUser } = getAuthData();
    if (savedUser) {
      setUserState(savedUser);
    }
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  const login = (token: string, userData: User) => {
    saveAuthData(token, userData);
    setUserState(userData);
  };

  const logout = () => {
    clearAuthData();
    setUserState(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    setUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

