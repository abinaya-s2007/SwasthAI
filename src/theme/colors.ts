export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  tabBar: string;
  tabBarInactive: string;
  overlay: string;
  chartGrid: string;
  inputBg: string;
};

export const lightColors: ThemeColors = {
  background: '#F4F7F6',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF5F2',
  card: '#FFFFFF',
  border: '#E3E9E7',
  text: '#0F1E1B',
  textSecondary: '#4A5C58',
  textMuted: '#8A9A96',
  primary: '#0FA968',
  primaryText: '#FFFFFF',
  accent: '#2F9BFF',
  success: '#1EAE6B',
  warning: '#F0A82A',
  danger: '#E5484D',
  info: '#2F9BFF',
  tabBar: '#FFFFFF',
  tabBarInactive: '#9AABA6',
  overlay: 'rgba(15,30,27,0.45)',
  chartGrid: '#E3E9E7',
  inputBg: '#F4F7F6',
};

export const darkColors: ThemeColors = {
  background: '#0B1B18',
  surface: '#122A25',
  surfaceAlt: '#0E211C',
  card: '#15302A',
  border: '#1F3B34',
  text: '#EAF6F1',
  textSecondary: '#A9C4BC',
  textMuted: '#6F8B84',
  primary: '#18D888',
  primaryText: '#052A1C',
  accent: '#4FB4FF',
  success: '#23C97F',
  warning: '#F5B94A',
  danger: '#FF6B6F',
  info: '#4FB4FF',
  tabBar: '#0E211C',
  tabBarInactive: '#5B7A72',
  overlay: 'rgba(0,0,0,0.6)',
  chartGrid: '#1F3B34',
  inputBg: '#0E211C',
};

export const riskColor = (level: 'low' | 'normal' | 'caution' | 'high', c: ThemeColors) => {
  switch (level) {
    case 'low':
    case 'normal':
      return c.success;
    case 'caution':
      return c.warning;
    case 'high':
      return c.danger;
    default:
      return c.textMuted;
  }
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };
