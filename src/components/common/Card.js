import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import COLORS from '../../constants/colors';
import { BORDER_RADIUS, SPACING } from '../../constants/theme';

const Card = ({
  children,
  onPress,
  style,
  padding = 'md',
  variant = 'default', // 'default' | 'elevated' | 'bordered' | 'gold'
  activeOpacity = 0.8,
}) => {
  const paddingValues = {
    none: 0,
    sm: SPACING.sm,
    md: SPACING.base,
    lg: SPACING.xl,
  };

  const variantStyles = {
    default: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
    elevated: { backgroundColor: COLORS.surfaceElevated, borderWidth: 0, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    bordered: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.cardBorder },
    gold: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.gold + '40' },
  };

  const containerStyle = [
    styles.card,
    { padding: paddingValues[padding] },
    variantStyles[variant],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={containerStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
});

export default Card;
