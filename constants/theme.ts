export const colors = {
  // Brand Colors
  primary: {
    blue: '#2196F3',
    cyan: '#00BCD4',
    purple: '#9C27B0',
    magenta: '#E91E63',
    green: '#4CAF50',
    red: '#F44336',
  },
  
  // Background
  background: {
    primary: '#0A0E27',
    secondary: '#1A1F3A',
    tertiary: '#252B48',
    card: '#1E2139',
  },
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#B8BCC8',
    tertiary: '#8B90A0',
    disabled: '#5A5F73',
  },
  
  // Status
  status: {
    active: '#4CAF50',
    paused: '#FF9800',
    draft: '#9E9E9E',
    completed: '#2196F3',
    error: '#F44336',
  },
  
  // Functional
  border: '#2D3250',
  overlay: 'rgba(0, 0, 0, 0.7)',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

export const gradients = {
  primary: ['#2196F3', '#9C27B0'],
  secondary: ['#00BCD4', '#E91E63'],
  success: ['#4CAF50', '#2196F3'],
  danger: ['#F44336', '#E91E63'],
  purple: ['#9C27B0', '#E91E63'],
  blue: ['#2196F3', '#00BCD4'],
  chart1: ['#2196F3', '#9C27B0'],
  chart2: ['#E91E63', '#F44336'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
