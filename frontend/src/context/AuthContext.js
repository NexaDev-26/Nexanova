import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage immediately (synchronous)
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false); // Start with false - render immediately

  // Verify token in background (non-blocking)
  useEffect(() => {
    if (token && user && navigator.onLine) {
      // Background verification - don't block rendering
      api.get('/user/profile')
        .then(response => {
          if (response.data.success && response.data.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        })
        .catch(error => {
          // Only clear if token is actually invalid (401/403)
          // Don't clear on network errors - user might be offline
          if (error.response?.status === 401 || error.response?.status === 403) {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          // Network errors are ignored - user can continue with cached data
        });
    }
  }, [token, user]); // Run when token or user changes

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      // Clean up the data before sending
      const registrationData = {
        email: userData.email,
        password: userData.password,
        nickname: userData.nickname || null,
        path: userData.path,
        ai_personality: userData.ai_personality,
        anonymous_mode: userData.anonymous_mode || false,
        offline_mode: userData.offline_mode !== false,
        store_chat: userData.store_chat !== false,
        mood_score: userData.mood_score || 5 // Include mood score if provided
      };

      console.log('📤 Sending registration request to /auth/register');
      console.log('📤 Registration data:', { ...registrationData, password: '***' });
      
      const response = await api.post('/auth/register', registrationData);
      if (response.data.success) {
        setToken(response.data.token);
        const user = response.data.user || { id: response.data.user_id, ...registrationData };
        setUser(user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Response status:', error.response?.status);
      console.error('   Response data:', error.response?.data);
      console.error('   Request URL:', error.config?.url);
      console.error('   Full URL:', error.config?.baseURL + error.config?.url);
      
      // Re-throw network errors so they can be handled in the component
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw error; // Re-throw to be caught in handleComplete
      }
      
      // Handle 404 specifically
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Registration endpoint not found. Please check if the backend server is running and the route is registered.',
          details: error.response?.data?.hint || 'The /api/auth/register endpoint could not be found.'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData) => {
    setUser({ ...user, ...userData });
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateUser,
        loading,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

