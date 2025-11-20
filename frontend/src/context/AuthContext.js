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
      // optional: fetch profile
      api.get('/user/profile').then(r => { if (r.data.success) setUser(r.data.user); }).catch(()=>{}).finally(()=>setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    delete api.defaults.headers.common.Authorization;
  };

  return <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, register, login, logout }}>{children}</AuthContext.Provider>;
};
