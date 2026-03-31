import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const Badge = ({ label, icon, color = COLORS.gold, size = 'sm', style }) => {
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: color,
          backgroundColor: `${color}20`,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 7 : 10,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isSmall ? 10 : 13}
          color={color}
          style={{ marginRight: 4 }}
        />
      )}
      <Text style={[styles.text, { color, fontSize: isSmall ? 10 : 12 }]}>
        {label}
      </Text>
    </View>
  );
};

const VerifiedBadge = ({ style }) => (
  <View style={[styles.verified, style]}>
    <Ionicons name="checkmark-circle" size={12} color={COLORS.gold} />
    <Text style={styles.verifiedText}>Verified</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.verifiedBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.verifiedBorder,
    paddingHorizontal: 7,
    paddingVertical: 2,
    gap: 3,
  },
  verifiedText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '700',
  },
});

Badge.Verified = VerifiedBadge;

export default Badge;
