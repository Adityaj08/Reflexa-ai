import { colors } from './colors';

export type Theme = {
  background: string;
  card: string;
  cardDark: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  border: string;
  highlight: string;
  shadow: string;
  overlay: string;
  error: string;
};

export const themes = {
  default: {
    background: colors.background,
    card: colors.card,
    cardDark: colors.cardDark,
    text: colors.text,
    textSecondary: colors.textSecondary,
    primary: colors.primary,
    secondary: colors.secondary,
    border: colors.border,
    highlight: colors.highlight,
    shadow: colors.shadow,
    overlay: colors.overlay,
    error: colors.error,
  },
  dark: {
    background: '#000000',
    card: '#121212',
    cardDark: '#0a0a0a',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    primary: '#7b68ee',
    secondary: '#6a5acd',
    border: '#2a2a2a',
    highlight: '#8a7cff',
    shadow: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    error: '#f87171',
  },
  light: {
    background: '#ffffff',
    card: '#f5f5f5',
    cardDark: '#e8e8e8',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#7b68ee',
    secondary: '#6a5acd',
    border: '#e0e0e0',
    highlight: '#8a7cff',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.3)',
    error: '#dc2626',
  },
} as const;

export type ThemeType = keyof typeof themes; 