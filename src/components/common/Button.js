import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import COLORS from '../../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOW, SPACING } from '../../constants/theme';

const Button = ({
  title,
  onPress,
  variant = 'gold', // 'gold' | 'green' | 'outline' | 'ghost' | 'danger'
  size = 'md',       // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const sizeStyles = {
    sm: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.md },
    md: { paddingVertical: 14, paddingHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.lg },
    lg: { paddingVertical: 18, paddingHorizontal: SPACING.xxl, borderRadius: BORDER_RADIUS.xl },
  };

  const textSizes = {
    sm: FONT_SIZE.sm,
    md: FONT_SIZE.base,
    lg: FONT_SIZE.lg,
  };

  const isGradient = variant === 'gold' || variant === 'green';
  const gradientColors =
    variant === 'gold' ? COLORS.gradientGold : COLORS.gradientGreen;

  const containerStyle = [
    styles.base,
    sizeStyles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.text,
    { fontSize: textSizes[size] },
    variant === 'outline' && { color: COLORS.gold },
    variant === 'ghost' && { color: COLORS.textSecondary },
    variant === 'danger' && { color: COLORS.error },
    variant === 'green' && { color: COLORS.background },
    textStyle,
  ];

  const content = (
    <>
      {icon && !loading && <View style={styles.iconWrap}>{icon}</View>}
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? COLORS.gold : COLORS.background}
          size="small"
        />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </>
  );

  if (isGradient) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[containerStyle, SHADOW.gold]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles[size], fullWidth && styles.fullWidth]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        containerStyle,
        variant === 'outline' && styles.outline,
        variant === 'danger' && styles.danger,
        variant === 'ghost' && styles.ghost,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    color: COLORS.background,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  disabled: {
    opacity: 0.4,
  },
  iconWrap: {
    marginRight: SPACING.sm,
  },
});

export default Button;
