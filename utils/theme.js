import { createContext, useContext, useState, useCallback } from 'react';

const COLORS = {
  light: {
    bg: '#F1F5FE',
    card: '#FFFFFF',
    text: '#1A1F36',
    sub: '#6B7494',
    border: '#E2E8F5',
    inputBg: '#F8F9FF',
    primary: '#4F6EF7',
    primaryLight: '#EEF2FF',
    primaryDark: '#3B55D9',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    purple: '#7C5CF6',
    pink: '#EC4899',
    tabBar: '#FFFFFF',
    tabBorder: '#E2E8F5',
    statusBar: 'dark-content',
    gradientStart: '#4F6EF7',
    gradientEnd: '#7C5CF6',
    cardShadow: 'rgba(79, 110, 247, 0.08)',
    overlay: 'rgba(0,0,0,0.05)',
  },
  dark: {
    bg: '#0B0F1A',
    card: '#151A2D',
    text: '#F0F0FF',
    sub: '#7B82A0',
    border: '#1E2640',
    inputBg: '#1A2035',
    primary: '#6B8AFF',
    primaryLight: '#1A2550',
    primaryDark: '#5070E8',
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#451A03',
    danger: '#F87171',
    dangerLight: '#450A0A',
    purple: '#A78BFA',
    pink: '#F472B6',
    tabBar: '#151A2D',
    tabBorder: '#1E2640',
    statusBar: 'light-content',
    gradientStart: '#1A2550',
    gradientEnd: '#0B0F1A',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(255,255,255,0.03)',
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  const toggle = useCallback(() => setDark((d) => !d), []);
  const colors = dark ? COLORS.dark : COLORS.light;

  return (
    <ThemeContext.Provider value={{ dark, toggle, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { COLORS };
