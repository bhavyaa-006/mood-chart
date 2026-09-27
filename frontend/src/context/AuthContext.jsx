import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { profileApi } from '../api/profile';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError, showInfo } = useToast();

  const loadUserData = useCallback(async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);

      try {
        const profileData = await profileApi.getProfile();
        setProfile(profileData);
      } catch {
        // Profile not found or couldn't load, ignore
      }
    } catch {
      clearTokens();
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize and restore session on mount
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      loadUserData();
    } else {
      setIsLoading(false);
    }

    const handleAuthExpired = () => {
      setUser(null);
      setProfile(null);
      showError('Session expired. Please log in again.');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [loadUserData, showError]);

  const login = async (email, password) => {
    try {
      const data = await authApi.login({ email, password });
      setTokens(data.access_token, data.refresh_token);
      await loadUserData();
      showSuccess('Welcome back!');
      return true;
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      await authApi.register(userData);
      // Automatically log in after registration
      await login(userData.email, userData.password);
      showSuccess('Account created successfully! Welcome to Mood Cockpit.');
      return true;
    } catch (err) {
      showError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Logout on backend failed or already revoked, continue clearing local state
      }
    }
    clearTokens();
    setUser(null);
    setProfile(null);
    showInfo('You have been logged out.');
  };

  const refreshProfile = async () => {
    try {
      const updated = await profileApi.getProfile();
      setProfile(updated);
      return updated;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const isAuthenticated = !!user;
  const isOnboarded = !!profile?.onboarding_completed;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated,
        isOnboarded,
        login,
        register,
        logout,
        refreshProfile,
        loadUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
