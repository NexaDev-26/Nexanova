import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../utils/api';

// Import translation files
import enTranslations from '../locales/en.json';
import swTranslations from '../locales/sw.json';
import frTranslations from '../locales/fr.json';
import arTranslations from '../locales/ar.json';
import ptTranslations from '../locales/pt.json';

const LocaleContext = createContext();

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
};

// Language mappings
const LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  sw: { name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' }
};

// Currency mappings with country info
const CURRENCIES = {
  TZS: { name: 'Tanzanian Shilling', symbol: 'TSh', country: 'Tanzania', flag: '🇹🇿' },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh', country: 'Kenya', flag: '🇰🇪' },
  UGX: { name: 'Ugandan Shilling', symbol: 'USh', country: 'Uganda', flag: '🇺🇬' },
  RWF: { name: 'Rwandan Franc', symbol: 'RFr', country: 'Rwanda', flag: '🇷🇼' },
  ETB: { name: 'Ethiopian Birr', symbol: 'Br', country: 'Ethiopia', flag: '🇪🇹' },
  ZAR: { name: 'South African Rand', symbol: 'R', country: 'South Africa', flag: '🇿🇦' },
  NGN: { name: 'Nigerian Naira', symbol: '₦', country: 'Nigeria', flag: '🇳🇬' },
  GHS: { name: 'Ghanaian Cedi', symbol: '₵', country: 'Ghana', flag: '🇬🇭' },
  USD: { name: 'US Dollar', symbol: '$', country: 'United States', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', country: 'European Union', flag: '🇪🇺' }
};

// Country to currency mapping
const COUNTRY_CURRENCY_MAP = {
  'TZ': 'TZS', 'Tanzania': 'TZS',
  'KE': 'KES', 'Kenya': 'KES',
  'UG': 'UGX', 'Uganda': 'UGX',
  'RW': 'RWF', 'Rwanda': 'RWF',
  'ET': 'ETB', 'Ethiopia': 'ETB',
  'ZA': 'ZAR', 'South Africa': 'ZAR',
  'NG': 'NGN', 'Nigeria': 'NGN',
  'GH': 'GHS', 'Ghana': 'GHS'
};

// Country to language mapping
const COUNTRY_LANGUAGE_MAP = {
  'TZ': 'sw', 'Tanzania': 'sw',
  'KE': 'sw', 'Kenya': 'sw',
  'UG': 'en', 'Uganda': 'en',
  'RW': 'en', 'Rwanda': 'en',
  'ET': 'en', 'Ethiopia': 'en',
  'ZA': 'en', 'South Africa': 'en',
  'NG': 'en', 'Nigeria': 'en',
  'GH': 'en', 'Ghana': 'en'
};

// Detect system language
const detectSystemLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Check if we support this language
  if (LANGUAGES[langCode]) {
    return langCode;
  }
  
  // Default to English
  return 'en';
};

// Detect currency from geolocation
const detectCurrencyFromCountry = (countryCode) => {
  return COUNTRY_CURRENCY_MAP[countryCode] || 'TZS'; // Default to TZS
};

// Detect language from geolocation
const detectLanguageFromCountry = (countryCode) => {
  return COUNTRY_LANGUAGE_MAP[countryCode] || 'en'; // Default to English
};

// Get user location via IP (using free API)
const detectLocationByIP = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_code,
      countryName: data.country_name,
      city: data.city,
      region: data.region,
      currency: data.currency || detectCurrencyFromCountry(data.country_code),
      language: detectLanguageFromCountry(data.country_code)
    };
  } catch (error) {
    console.warn('IP geolocation failed:', error);
    return null;
  }
};

// Get user location via GPS (if available)
const detectLocationByGPS = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocoding to get country (using free API)
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          resolve({
            country: data.countryCode,
            countryName: data.countryName,
            city: data.city,
            region: data.principalSubdivision,
            latitude,
            longitude,
            currency: detectCurrencyFromCountry(data.countryCode),
            language: detectLanguageFromCountry(data.countryCode)
          });
        } catch (error) {
          console.warn('GPS geolocation failed:', error);
          resolve(null);
        }
      },
      (error) => {
        console.warn('GPS permission denied or failed:', error);
        resolve(null);
      },
      { timeout: 5000 }
    );
  });
};

export const LocaleProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('nexanova_language');
    return saved || detectSystemLanguage();
  });
  
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('nexanova_currency');
    return saved || 'TZS';
  });

  const [location, setLocation] = useState(null);
  const [detecting, setDetecting] = useState(false);

  const detectLocation = async () => {
    setDetecting(true);
    
    // Try GPS first (more accurate)
    let locationData = await detectLocationByGPS();
    
    // Fallback to IP if GPS fails
    if (!locationData) {
      locationData = await detectLocationByIP();
    }

    if (locationData) {
      setLocation(locationData);
      
      // Auto-set currency and language if not already set
      if (!localStorage.getItem('nexanova_currency')) {
        setCurrency(locationData.currency);
        localStorage.setItem('nexanova_currency', locationData.currency);
      }
      
      if (!localStorage.getItem('nexanova_language')) {
        setLanguage(locationData.language);
        localStorage.setItem('nexanova_language', locationData.language);
      }
    }
    
    setDetecting(false);
  };

  // Load user preferences from server if available
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/user/profile');
          if (response.data.success && response.data.user) {
            const user = response.data.user;
            if (user.language && !localStorage.getItem('nexanova_language')) {
              setLanguage(user.language);
              localStorage.setItem('nexanova_language', user.language);
            }
            if (user.currency && !localStorage.getItem('nexanova_currency')) {
              setCurrency(user.currency);
              localStorage.setItem('nexanova_currency', user.currency);
            }
            if (user.city && user.region && !location) {
              setLocation({
                city: user.city,
                region: user.region,
                country: user.country_code,
                countryName: user.country_code ? `${user.country_code} Country` : 'Unknown'
              });
            }
          }
        }
      } catch (error) {
        // User not logged in or error - continue with defaults
        console.debug('Could not load user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, []);

  // Auto-detect on mount (only if no user preferences)
  useEffect(() => {
    if (!localStorage.getItem('nexanova_language') && !localStorage.getItem('nexanova_currency')) {
      detectLocation();
    }
  }, []);

  const updateLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('nexanova_language', langCode);
    
    // Update user preference on server
    api.patch('/user/preferences', { language: langCode }).catch(err => {
      console.warn('Failed to update language preference:', err);
    });
  };

  const updateCurrency = (currCode) => {
    setCurrency(currCode);
    localStorage.setItem('nexanova_currency', currCode);
    
    // Update user preference on server
    api.patch('/user/preferences', { currency: currCode }).catch(err => {
      console.warn('Failed to update currency preference:', err);
    });
  };

  const formatCurrency = (amount) => {
    const currencyInfo = CURRENCIES[currency] || CURRENCIES.TZS;
    return `${currencyInfo.symbol} ${parseFloat(amount).toLocaleString()}`;
  };

  // Translation files mapping
  const translations = {
    en: enTranslations,
    sw: swTranslations,
    fr: frTranslations,
    ar: arTranslations,
    pt: ptTranslations
  };

  const t = useCallback((key, params = {}) => {
    // Support nested keys like "dashboard.greeting.goodMorning"
    const keys = key.split('.');
    let translation = translations[language] || translations.en;
    
    for (const k of keys) {
      translation = translation?.[k];
      if (translation === undefined) {
        // Fallback to English
        translation = translations.en;
        for (const k2 of keys) {
          translation = translation?.[k2];
          if (translation === undefined) {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }
    
    // If translation is a string, do parameter replacement
    if (typeof translation === 'string') {
      return translation.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
    }
    
    return translation || key;
  }, [language]);

  // Memoize context value to ensure proper re-renders when language changes
  // Only include state values in dependencies - functions are stable
  const contextValue = useMemo(() => ({
    language,
    currency,
    location,
    detecting,
    languages: LANGUAGES,
    currencies: CURRENCIES,
    updateLanguage,
    updateCurrency,
    formatCurrency,
    detectLocation,
    t
  }), [language, currency, location, detecting, t]);

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
};

