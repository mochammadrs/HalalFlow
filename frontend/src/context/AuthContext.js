import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import axios from 'axios';

// 1. Setup Axios Interceptors globally
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Buat Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Logout helper
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Response interceptor for 401 Unauthorized (expired token)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn('⚠️ 401 Unauthorized - token expired or invalid. Logging out.');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check token on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (storedToken && savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          } catch (parseErr) {
            console.error('Error parsing user data:', parseErr);
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error('AuthContext: Error checking token', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token: receivedToken, user: receivedUser } = response.data;

      setToken(receivedToken);
      localStorage.setItem('token', receivedToken);

      if (receivedUser) {
        localStorage.setItem('user', JSON.stringify(receivedUser));
        setUser(receivedUser);
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      return response;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;