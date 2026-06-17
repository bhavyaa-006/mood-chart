import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  me as apiMe,
  signup as apiSignup,
} from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!accessToken;

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        if (!accessToken) {
          if (active) setUser(null);
          return;
        }
        const me = await apiMe(accessToken);
        if (active) setUser(me);
      } catch (e) {
        localStorage.removeItem('access_token');
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [accessToken]);

  const value = useMemo(() => {
    return {
      user,
      accessToken,
      isAuthenticated,
      loading,
      login: async ({ email, password, rememberMe = false }) => {
        const res = await apiLogin({ email, password, rememberMe });
        localStorage.setItem('access_token', res.access_token);
        setAccessToken(res.access_token);
        const me = await apiMe(res.access_token);
        setUser(me);
        return res;
      },
      signup: async ({ name, email, password, confirmPassword }) => {
        await apiSignup({ name, email, password, confirmPassword });
        // Caller will typically redirect to login
      },
      logout: async () => {
        try {
          await apiLogout(accessToken);
        } finally {
          localStorage.removeItem('access_token');
          setAccessToken(null);
          setUser(null);
        }
      },
    };
  }, [accessToken, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
