import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();

  const navItems = [
    { path: '/dashboard', icon: '🏠', labelKey: 'navigation.home' },
    { path: '/journal', icon: '📔', labelKey: 'navigation.journal' },
    { path: '/habits', icon: '✨', labelKey: 'navigation.habits' },
    { path: '/finance', icon: '💰', labelKey: 'navigation.finance' }
  ];

  return (
    <>
      <nav className="nav-tabs">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-tab ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-tab-icon">{item.icon}</span>
            <span>{t(item.labelKey)}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Navigation;

