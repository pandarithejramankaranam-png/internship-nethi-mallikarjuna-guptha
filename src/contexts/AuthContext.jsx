import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { isOfflineError } from '../services/api';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile if token is present
  const loadUser = async () => {
    const token = localStorage.getItem('gym_auth_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Handshake fallback if it is a mock token
    if (token.startsWith('mock-jwt-token-')) {
      const role = token.split('-')[3] || 'Admin';
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
      const name = capitalizedRole === 'Admin' ? 'Dev Admin' : capitalizedRole === 'Manager' ? 'Sarah Manager' : 'Robert Staff';
      const email = capitalizedRole === 'Admin' ? 'admin@ironforge.com' : capitalizedRole === 'Manager' ? 'sarah@ironforge.com' : 'robert@ironforge.com';
      setUser({ id: 1, name, email, role: capitalizedRole });
      setLoading(false);
      return;
    }

    try {
      // Attempt to fetch current user profile from /auth/me or /auth/profile
      let response;
      try {
        response = await api.get('/auth/me');
      } catch (e) {
        if (isOfflineError(e)) {
          throw e;
        }
        // Fallback to /auth/profile if /auth/me isn't defined
        response = await api.get('/auth/profile');
      }
      setUser(response.data.user || response.data);
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Backend offline. Retaining local fallback session.");
        setUser({ id: 1, name: 'Dev Admin', email: 'admin@ironforge.com', role: 'Admin' });
      } else {
        console.error("Failed to load user profile:", err);
        // In case of invalid/expired token, clear token and state
        localStorage.removeItem('gym_auth_token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for unauthorized events dispatched by Axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      // Expected response: { token, user }
      if (data.token) {
        localStorage.setItem('gym_auth_token', data.token);
      }
      setUser(data.user || null);
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    refreshUser: loadUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
