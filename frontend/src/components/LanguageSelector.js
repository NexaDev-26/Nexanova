import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from '../context/LocaleContext';
import { soundEffects } from '../utils/soundEffects';
import '../styles/LanguageSelector.css';

const LanguageSelector = () => {
  const { language, languages, updateLanguage } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode) => {
    if (langCode !== language) {
      soundEffects.click();
      updateLanguage(langCode);
      setIsOpen(false);
    }
  };

  const currentLanguage = languages[language] || languages.en;

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-selector-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          soundEffects.click();
        }}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="language-flag">{currentLanguage.flag}</span>
        <span className="language-name">{currentLanguage.nativeName}</span>
        <span className="language-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {Object.entries(languages).map(([code, lang]) => (
            <button
              key={code}
              className={`language-option ${code === language ? 'active' : ''}`}
              onClick={() => handleLanguageChange(code)}
            >
              <span className="language-flag">{lang.flag}</span>
              <div className="language-info">
                <span className="language-native">{lang.nativeName}</span>
                <span className="language-english">{lang.name}</span>
              </div>
              {code === language && <span className="language-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

