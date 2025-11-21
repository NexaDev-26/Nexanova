import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  const [loading, setLoading] = useState(true);

  // Load theme from backend if available
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await api.get('/theme');
        if (res.data?.theme) {
          setTheme(res.data.theme);
          localStorage.setItem('theme', res.data.theme);
        }
      } catch (err) {
        console.error('Failed to fetch theme:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    // Optional: send updated theme to backend here
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};
