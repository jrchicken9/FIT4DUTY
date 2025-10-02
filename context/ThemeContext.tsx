import React, { createContext, useContext, ReactNode } from 'react';
import { theme, strokeWidth, sizes, shadows, tapAnimation } from '@/constants/designSystem';
import Colors from '@/constants/colors';

interface ThemeContextType {
  // Default tint color for all interactive elements
  tint: string;
  // Default stroke width for borders and dividers
  strokeWidth: typeof strokeWidth;
  // Default sizes for icons and interactive elements
  sizes: typeof sizes;
  // Default elevation for cards
  cardElevation: typeof shadows.level2;
  // Default button elevation
  buttonElevation: typeof shadows.level2;
  // Default animation configuration
  animation: typeof tapAnimation;
  // Colors
  colors: typeof Colors;
  // Shadows
  shadows: typeof shadows;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeValue: ThemeContextType = {
    tint: theme.tint,
    strokeWidth,
    sizes,
    cardElevation: theme.cardElevation,
    buttonElevation: theme.buttonElevation,
    animation: theme.animation,
    colors: Colors,
    shadows,
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};












