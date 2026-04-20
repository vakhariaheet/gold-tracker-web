import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeToken = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const token = value.trim();
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
  };

  const persistAuth = (data: any) => {
    const accessToken = normalizeToken(data?.accessToken ?? data?.token ?? data?.tokens?.accessToken);
    const refreshToken = normalizeToken(data?.refreshToken ?? data?.tokens?.refreshToken);
    if (!accessToken) {
      throw new Error('Authentication token was not returned by the server.');
    }

    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }

    if (data?.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await apiClient.post<any>(
        '/api/auth/login',
        { email, password }
      );
      persistAuth(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await apiClient.post<any>(
        '/api/auth/register',
        { name, email, password }
      );
      persistAuth(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await apiClient.post('/api/auth/forgot-password-otp', { email });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string): Promise<string> => {
    setError(null);
    try {
      const data = await apiClient.post<{ resetToken: string }>('/api/auth/verify-otp', { email, otp });
      return data.resetToken;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    setError(null);
    try {
      await apiClient.post('/api/auth/reset-password-otp', { token, password });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to reset password.';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const updateProfile = useCallback(async (name: string, email: string) => {
    setError(null);
    try {
      const data = await apiClient.put<{ user: User }>('/api/auth/update-profile', { name, email });
      const updated = { ...user!, ...data.user };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setError(msg);
      throw new Error(msg);
    }
  }, [user]);

  const deleteAccount = useCallback(async () => {
    setError(null);
    try {
      await apiClient.delete('/api/auth/delete-account');
      await logout();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete account.';
      setError(msg);
      throw new Error(msg);
    }
  }, [logout]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      error,
      login,
      register,
      logout,
      forgotPassword,
      verifyOtp,
      resetPassword,
      updateProfile,
      deleteAccount,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
