import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      api.get('/auth/profile')
        .then(res => {
          if (res.data.success) setUser(res.data.user);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      return res.data;
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
        setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
