export const COLORS = {
  // Brand
  brand:        '#0D1F4E',
  brandMid:     '#1251AA',
  brandLight:   '#EBF2FF',

  // Incident type accents (full-saturation for colored cards)
  red:          '#B91C1C',
  redDark:      '#7F1D1D',
  redLight:     '#FEF2F2',

  teal:         '#0F766E',
  tealDark:     '#134E4A',
  tealLight:    '#F0FDFA',

  amber:        '#D97706',
  amberDark:    '#92400E',
  amberLight:   '#FFFBEB',

  purple:       '#6D28D9',
  purpleDark:   '#3B0764',
  purpleLight:  '#F5F3FF',

  // Semantic
  success:      '#059669',
  successLight: '#ECFDF5',
  danger:       '#DC2626',
  dangerLight:  '#FEF2F2',
  warning:      '#D97706',
  warningLight: '#FFFBEB',

  // Surfaces
  background:   '#F4F6FB',
  surface:      '#FFFFFF',
  elevated:     '#FFFFFF',

  // Text
  text:         '#0D1629',
  textSecondary:'#475569',
  textMuted:    '#94A3B8',

  // Chrome
  border:       '#E2E8F0',
  separator:    '#F1F5F9',
  overlay:      'rgba(13,31,78,0.55)',

  // Legacy aliases — keep old names resolving so existing screens don't break
  primary:      '#1251AA',
  primaryDark:  '#0D1F4E',
  primaryLight: '#EBF2FF',
  dangerDark:   '#7F1D1D',
} as const;

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  36,
  xxl: 56,
} as const;

export const RADIUS = {
  sm:   6,
  md:   12,
  lg:   18,
  xl:   24,
  full: 999,
} as const;

export const FONT = {
  label:   12,
  caption: 13,
  body:    15,
  bodyLg:  17,
  heading: 22,
  display: 30,
  hero:    38,
} as const;

export const FONTS = {
  regular:   'Poppins_400Regular',
  medium:    'Poppins_500Medium',
  semibold:  'Poppins_600SemiBold',
  bold:      'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
  black:     'Poppins_900Black',
} as const;

export const SHADOW = {
  sm: {
    shadowColor: '#0D1F4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0D1F4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0D1F4E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
