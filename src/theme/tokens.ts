import { Platform } from 'react-native';

// ─── Colors ──────────────────────────────────────────────────────────────────
// Brand palette is intentionally preserved. Only derived surfaces/alpha values
// are added for depth and interaction states.
export const colors = {
  // ── New brand palette ────────────────────────────────────────────────────
  primary: '#F28F6A',
  primaryLight: '#FDF0EA',   // soft tint of primary for icon bg / selected chip
  // ── Semantic status (kept intentionally distinct for readability) ────────
  income: '#16A34A',
  incomeLight: '#F0FDF4',
  expense: '#DC2626',
  expenseLight: '#FEF2F2',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  // ── Surfaces ─────────────────────────────────────────────────────────────
  background: '#FFFFFF',
  surface: '#FEFEFE',
  surfaceAlt: '#EBEBEF',     // pressed states, skeleton, track bg — matches border
  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary: '#1F2433',
  textSecondary: '#7B7D84',
  textDisabled: '#B5B7BE',   // lighter than textSecondary, still readable on surface
  // ── Borders & focus ──────────────────────────────────────────────────────
  border: '#EBEBEF',
  borderFocus: '#F28F6A',    // focus ring matches primary
  // ── Overlay / utility ────────────────────────────────────────────────────
  overlay: 'rgba(31,36,51,0.45)',  // secondary color at 45% opacity
  white: '#FFFFFF',
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// ─── Radius ──────────────────────────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  card: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
export const typography = {
  display: 30,
  title: 24,
  heading: 18,
  body: 16,
  bodySm: 14,
  caption: 12,
  micro: 11,
} as const;

// ─── Font families ───────────────────────────────────────────────────────────
// Loaded via useFonts in _layout; fallback to system until loaded
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  // Urdu — loaded conditionally
  urdu: 'NotoNastaliqUrdu_400Regular',
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const shadows = {
  xs: Platform.select({
    ios: { shadowColor: '#1F2433', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2 },
    android: { elevation: 1 },
    web: { boxShadow: '0 1px 2px rgba(31,36,51,0.04)' },
    default: {},
  }),
  sm: Platform.select({
    ios: { shadowColor: '#1F2433', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
    android: { elevation: 2 },
    web: { boxShadow: '0 1px 3px rgba(31,36,51,0.06)' },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: '#1F2433', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
    android: { elevation: 4 },
    web: { boxShadow: '0 2px 10px rgba(31,36,51,0.08)' },
    default: {},
  }),
  lg: Platform.select({
    ios: { shadowColor: '#1F2433', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16 },
    android: { elevation: 8 },
    web: { boxShadow: '0 8px 24px rgba(31,36,51,0.12)' },
    default: {},
  }),
} as const;

// ─── Layout ──────────────────────────────────────────────────────────────────
export const layout = {
  maxContentWidth: 720,
  gutter: 20,
} as const;

// ─── Motion ──────────────────────────────────────────────────────────────────
export const motion = {
  fast: 120,
  base: 200,
  slow: 600,
} as const;

// ─── Category icon map ────────────────────────────────────────────────────────
// Maps category key → Ionicons name
export const CATEGORY_ICONS: Record<string, string> = {
  food: 'fast-food',
  rent: 'home',
  transport: 'car',
  bills: 'receipt',
  shopping: 'bag-handle',
  health: 'medkit',
  education: 'book',
  other: 'ellipsis-horizontal-circle',
  income: 'arrow-down-circle',
};

export const CATEGORY_COLORS: Record<string, string> = {
  food: '#F59E0B',
  rent: '#8B5CF6',
  transport: '#06B6D4',
  bills: '#EF4444',
  shopping: '#EC4899',
  health: '#10B981',
  education: '#6366F1',
  other: '#64748B',
  income: '#16A34A',
};
