import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../constants/theme';

const SIZES = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 80,
  xxl: 100,
};

const Avatar = ({
  uri,
  name,
  size = 'md',
  isVerified = false,
  isAdmin = false,
  isOnline = false,
  style,
}) => {
  const dim = typeof size === 'number' ? size : SIZES[size] || SIZES.md;
  const fontSize = dim * 0.36;
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <View style={[{ width: dim, height: dim }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: dim, height: dim, borderRadius: dim / 2 }]}
        />
      ) : (
        <LinearGradient
          colors={isAdmin ? [COLORS.adminRed, '#AA0000'] : [COLORS.gold, COLORS.goldDark]}
          style={[styles.placeholder, { width: dim, height: dim, borderRadius: dim / 2 }]}
        >
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </LinearGradient>
      )}

      {/* Verified ring */}
      {isVerified && (
        <View
          style={[
            styles.verifiedRing,
            {
              width: dim + 4,
              height: dim + 4,
              borderRadius: (dim + 4) / 2,
              top: -2,
              left: -2,
            },
          ]}
        />
      )}

      {/* Online indicator */}
      {isOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: dim * 0.28,
              height: dim * 0.28,
              borderRadius: (dim * 0.28) / 2,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}

      {/* Admin star */}
      {isAdmin && (
        <View style={styles.adminBadge}>
          <Text style={{ fontSize: dim * 0.2, color: COLORS.background }}>★</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: COLORS.background,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 1,
  },
  verifiedRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  adminBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.adminRed,
    borderRadius: 9999,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Avatar;
