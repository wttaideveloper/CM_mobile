export const designTokens = {
  colors: {
    primary: '#1F5D4E',
    primaryDark: '#163D34',
    primaryLight: '#EAF4EC',
    primarySoft: '#F1F7F3',
    background: '#F5F7F5',
    backgroundAlt: '#F7F9F7',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F3',
    textPrimary: '#111827',
    textSecondary: '#475467',
    textMuted: '#5A7A70',
    border: '#E3EAE5',
    borderStrong: '#CFE1D8',
    success: '#2F8F5B',
    warning: '#D97706',
    error: '#DC2626',
    errorSoft: '#FEE2E2',
    disabled: '#B9C6BF',
    white: '#FFFFFF',
    black: '#111111',
    shadow: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  typography: {
    display: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '800' as const,
    },
    title: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '800' as const,
    },
    screenTitle: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '800' as const,
    },
    sectionTitle: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700' as const,
      letterSpacing: 0.7,
    },
    cardTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700' as const,
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
    },
    bodyStrong: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as const,
    },
    secondary: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '500' as const,
    },
    label: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600' as const,
    },
    button: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '700' as const,
    },
  },
} as const;

export const appColors = designTokens.colors;
export const appSpacing = designTokens.spacing;
export const appRadius = designTokens.radius;
export const appTypography = designTokens.typography;
