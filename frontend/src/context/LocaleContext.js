import React, { createContext, useContext, useState } from 'react';

const LocaleContext = createContext();

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState('en'); // default locale

  // Optional: function to change locale
  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    // optional: save locale to API/localStorage
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale: changeLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};
