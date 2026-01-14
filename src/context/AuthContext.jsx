import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authClient';
import { decodeJWT, isTokenExpired } from '../utils/jwt';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Decode JWT from localStorage (mocked)
          if (isTokenExpired(token)) {
            throw new Error('Token expired');
          }

          const decoded = decodeJWT(token);
          if (decoded) {
            // Try to get full user data from API, fallback to decoded token
            try {
              const userData = await authApi.getCurrentUser();
              setUser(userData);
            } catch (err) {
              console.error('Failed to verify token with server:', err);
              // If server rejects token (e.g. 403 Forbidden due to secret change), 
              // we must clear it and force login.
              // Throwing here will be caught by the outer catch block which clears tokens.
              throw err;
            }
          } else {
            throw new Error('Invalid token');
          }
        } catch (err) {
          // Token invalid, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    initAuth().catch(() => {
      // If initialization fails, just set loading to false
      setLoading(false);
    });
  }, []);

  const login = async (email, password, role = 'user') => {
    try {
      setError(null);
      const response = await authApi.login(email, password, role);
      setUser(response.user);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (formData, role) => {
    try {
      setError(null);
      const response = await authApi.register(formData, role);
      setUser(response.user);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await authApi.refreshToken(refreshToken);
      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      return response.accessToken;
    } catch (err) {
      // Refresh failed, logout user
      await logout();
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshAccessToken,
    isAuthenticated: !!user,
    isUser: user?.role === 'user',
    isRestaurant: user?.role === 'restaurant',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

