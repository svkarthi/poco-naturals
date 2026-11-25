/**
 * Exact design tokens extracted from https://poconaturals.in (Blocksy theme palette).
 */
export const COLORS = {
  // Exact poconaturals.in Blocksy Palette
  primary: '#5A8139',        // --theme-palette-color-1 (Botanical Olive Green)
  primaryDark: '#48682B',    // --theme-palette-color-2 (Deep Leaf Green)
  primaryLight: '#6B9547',   // Highlight Green
  primaryTint: '#E6F0EE',    // --theme-palette-color-5 (Soft Sage Tint)

  // Accents
  accent: '#48682B',         // Brand CTA / Sale Accent
  accentTint: '#E6F0EE',     // Soft Sage Wash
  gold: '#C48B22',           // Honey / Star Accent
  goldTint: '#FBF5E6',

  // Neutrals — Exact poconaturals.in Surfaces & Text
  background: '#FBFCFC',     // --theme-palette-color-7 (Crisp Off-White Canvas)
  surface: '#FFFFFF',        // --theme-palette-color-8 (Pure White Card)
  surfaceMuted: '#F2F7F6',   // --theme-palette-color-6 (Soft Mint Fill)
  border: '#E6F0EE',         // --theme-palette-color-5 (Subtle Mint Hairline)
  borderStrong: '#D1E0DC',

  // Typography
  text: '#192C27',           // --theme-palette-color-4 (Deep Forest Pine Headings)
  textSecondary: '#434F58',  // --theme-palette-color-3 (Cool Slate Body)
  textMuted: '#73828A',      // Muted Slate
  textOnPrimary: '#FFFFFF',

  // Semantic
  success: '#48682B',
  danger: '#CF2E2E',
  dangerTint: '#FDECEC',
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
  xl: 20,
  pill: 999,
} as const;

export const STORE_INFO = {
  brandName: 'POCO Naturals',
  tagline: 'Pure, Traditional & Wholesome Everyday Foods',
  heroHeadline:
    'We are committed to bringing you carefully selected products that meet high standards of quality and care.',
  baseUrl: 'https://poconaturals.in',
  storeApiBase: 'https://poconaturals.in/wp-json/wc/store/v1',
  wpApiBase: 'https://poconaturals.in/wp-json/wp/v2',
  logoUrl:
    'https://poconaturals.in/wp-content/uploads/2026/10/WhatsApp-Image-2026-10-01-at-6.20.56-PM-300x300.jpeg',
  privacyPolicyUrl: 'https://poconaturals.in/privacy-policy-2/',
  aboutUrl: 'https://poconaturals.in/about-us/',
  blogUrl: 'https://poconaturals.in/blog/',
  contactUrl: 'https://poconaturals.in/contact/',
  phonePrimary: '+91 99943 69555',
  phoneSecondary: '+91 88258 47388',
  whatsappNumber: '919994369555',
  email: 'poconaturalsudt@gmail.com',
  address: '118, Palani Road, Udumalaipettai, Tiruppur, Tamil Nadu - 642126, India',
  freeShippingThreshold: 499,
  featuredProductSlugs: [
    'cold-pressed-coconut-oil',
    'palmora-palm-sugar-candy',
    'pearl-millet-chikkies',
    'premium-foxtail-millet-sevai',
  ],
} as const;
