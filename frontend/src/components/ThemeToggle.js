import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { soundEffects } from '../utils/soundEffects';
import '../styles/ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    soundEffects.click();
    toggleTheme();
  };

  return (
    <button className="theme-toggle" onClick={handleToggle} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? (
        <span className="theme-icon">🌙</span>
      ) : (
        <span className="theme-icon">☀️</span>
      )}
    </button>
  );
};

export default ThemeToggle;

