// 💰 Minha Conta - Theme Context

import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

export type ThemeType = 'default' | 'masculine' | 'feminine';
export type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  colorMode: ColorMode;
  setTheme: (theme: ThemeType) => void;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('default');
  const [colorMode, setColorModeState] = useState<ColorMode>('light');

  // Load theme from storage on mount
  useEffect(() => {
    const savedTheme = storage.getThemeSettings();
    if (savedTheme) {
      setThemeState(savedTheme.theme);
      setColorModeState(savedTheme.colorMode);
    }
  }, []);

  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-default', 'theme-masculine', 'theme-feminine', 'dark');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    // Add dark mode class if needed
    if (colorMode === 'dark') {
      root.classList.add('dark');
    }
  }, [theme, colorMode]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    storage.saveThemeSettings({ theme: newTheme, colorMode });
  };

  const setColorMode = (newColorMode: ColorMode) => {
    setColorModeState(newColorMode);
    storage.saveThemeSettings({ theme, colorMode: newColorMode });
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      colorMode,
      setTheme,
      setColorMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};