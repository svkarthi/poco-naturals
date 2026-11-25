export const COLORS = {
  // Brand Palette — Tamil Nadu Heritage Organics
  primary: '#1E4D32',        // Deep Palm Forest Green
  primaryLight: '#2E6B47',   // Fresh Leaf Green
  primaryTint: '#E9F2EC',    // Soft Sage Tint
  accent: '#B85D2A',         // Traditional Jaggery / Terracotta
  accentTint: '#F9EDE5',     // Warm Terracotta Wash
  gold: '#C98A1C',           // Raw Forest Honey Gold
  goldTint: '#FDF5E6',       // Honey Cream Tint

  // Neutrals — Sun-warmed organic canvas
  background: '#FAF6F0',     // Warm Parchment Cream
  surface: '#FFFFFF',        // Crisp Card Surface
  surfaceMuted: '#F3EDE3',   // Subtle Sand Fill
  border: '#E8DFD1',         // Warm Hairline Border
  borderStrong: '#D5C8B5',

  // Typography
  text: '#1C241E',           // Deep Forest Charcoal
  textSecondary: '#59635B',  // Muted Olive Slate
  textMuted: '#8B948C',      // Subtle Stone
  textOnPrimary: '#FFFFFF',

  // Semantic
  success: '#1E7A45',
  danger: '#C23B2B',
  dangerTint: '#FDECEB',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const STORE_INFO = {
  brandName: 'POCO Naturals',
  tagline: 'Traditional Tamil Nadu Foods for Modern Homes',
  baseUrl: 'https://poconaturals.in',
  storeApiBase: 'https://poconaturals.in/wp-json/wc/store/v1',
  phonePrimary: '+91 99943 69555',
  phoneSecondary: '+91 88258 47388',
  whatsappNumber: '919994369555',
  email: 'poconaturalsudt@gmail.com',
  address: '118, Palani Road, Udumalaipettai, Tiruppur, Tamil Nadu - 642126, India',
  freeShippingThreshold: 499,
} as const;
