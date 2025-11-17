import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import '../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLocale();

  const isProfilePage = location.pathname === '/profile';

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-logo">🌱 NexaNova</h1>
        </div>
        
        <div className="header-right">
          <LanguageSelector />
          <ThemeToggle />
          <button
            className={`header-profile-btn ${isProfilePage ? 'active' : ''}`}
            onClick={() => navigate('/profile')}
            title={t('navigation.profile')}
          >
            <span className="profile-icon">👤</span>
            {user?.nickname && (
              <span className="profile-name">{user.nickname}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

