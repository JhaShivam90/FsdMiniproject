/**
 * context/ThemeContext.jsx — Global light/dark mode state
 * Persists preference to localStorage. Applies 'dark' class on <html>.
 */

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Default: use saved preference, else light mode
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
