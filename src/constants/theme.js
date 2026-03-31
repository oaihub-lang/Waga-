import { Dimensions, Platform } from 'react-native';
import COLORS from './colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 48,
};

export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const SHADOW = {
  gold: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  green: {
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
};

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';

// Badge definitions
export const BADGES = {
  ORINGO_KING: { label: 'Oringo King', icon: 'crown', color: COLORS.gold },
  ORINGO_QUEEN: { label: 'Oringo Queen', icon: 'crown', color: COLORS.gold },
  HIGH_VALUE_VENDOR: { label: 'High-Value Vendor', icon: 'briefcase', color: COLORS.green },
  VERIFIED_MEMBER: { label: 'Verified Member', icon: 'check-circle', color: COLORS.goldLight },
  TOP_CONTRIBUTOR: { label: 'Top Contributor', icon: 'star', color: COLORS.warning },
  CARNIVAL_PATRON: { label: 'Carnival Patron', icon: 'music', color: '#FF6B9D' },
  MEDICAL_HERO: { label: 'Medical Hero', icon: 'heart', color: '#EF4444' },
};

// Reputation thresholds
export const REPUTATION = {
  MAX_POINTS: 1000,
  LEVELS: [
    { min: 0, max: 199, stars: 1, label: 'Newcomer' },
    { min: 200, max: 399, stars: 2, label: 'Member' },
    { min: 400, max: 599, stars: 3, label: 'Active' },
    { min: 600, max: 799, stars: 4, label: 'Trusted' },
    { min: 800, max: 1000, stars: 5, label: 'Legend' },
  ],
};

// OPP 6 Laws
export const OPP_LAWS = [
  { number: 1, title: 'Respect All Members', description: 'Treat every OPP member with dignity and respect at all times.' },
  { number: 2, title: 'No Fighting', description: 'Physical or verbal altercations are strictly prohibited within OPP.' },
  { number: 3, title: 'No-Tag Rule', description: 'Do not tag members without their consent in public posts.' },
  { number: 4, title: 'Pay Your Dues', description: 'Annual dues must be paid on time to maintain Verified status.' },
  { number: 5, title: 'Oringo First', description: 'Lifestyle and community enjoyment are the foundation of OPP.' },
  { number: 6, title: 'Confidentiality', description: 'What happens in OPP, stays in OPP. Protect member privacy.' },
];

// Carnival event details
export const CARNIVAL_EVENT = {
  date: '2024-12-14',
  venue: 'Villa Toscana, Enugu',
  theme: 'OPP Lifestyle Carnival 2024',
  dressCode: 'All White + Gold',
  ticketPrice: 15000,
};

export default {
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  SHADOW,
  SCREEN,
  BADGES,
  REPUTATION,
  OPP_LAWS,
  CARNIVAL_EVENT,
};
