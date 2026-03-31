import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // Tagline fade in
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }),
      // Buttons slide up
      Animated.parallel([
        Animated.timing(buttonsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonsTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    // Glow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0A0A0A', '#1A1200', '#0A0A0A']} style={StyleSheet.absoluteFill} />

      {/* Background glow effect */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      {/* Decorative lines */}
      <View style={styles.lineTop} />
      <View style={styles.lineBottom} />

      <Animated.View
        style={[styles.logoSection, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <View style={styles.oLabel}>
          <Text style={styles.oText}>ORINGO PEOPLE'S PARTY</Text>
        </View>
        <Text style={styles.oppText}>OPP</Text>
        <View style={styles.taglineRow}>
          <View style={styles.line} />
          <Text style={styles.tagline}>LIFESTYLE</Text>
          <View style={styles.line} />
        </View>
      </Animated.View>

      <Animated.Text style={[styles.motto, { opacity: taglineOpacity }]}>
        "Oringo Must Continue"
      </Animated.Text>

      <Animated.View
        style={[
          styles.buttonSection,
          { opacity: buttonsOpacity, transform: [{ translateY: buttonsTranslateY }] },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={COLORS.gradientGold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={styles.primaryBtnText}>ENTER THE COMMUNITY</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>JOIN OPP</Text>
        </TouchableOpacity>

        <Text style={styles.memberCount}>720+ Verified Members · Worldwide</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.gold,
    top: height * 0.2,
    alignSelf: 'center',
    transform: [{ scaleY: 0.3 }],
  },
  lineTop: {
    position: 'absolute',
    top: 80,
    left: SPACING.xl,
    right: SPACING.xl,
    height: 1,
    backgroundColor: COLORS.gold + '30',
  },
  lineBottom: {
    position: 'absolute',
    bottom: 160,
    left: SPACING.xl,
    right: SPACING.xl,
    height: 1,
    backgroundColor: COLORS.gold + '30',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  oLabel: {
    borderWidth: 1,
    borderColor: COLORS.gold + '60',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    marginBottom: SPACING.lg,
  },
  oText: {
    color: COLORS.gold + 'AA',
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 4,
  },
  oppText: {
    fontSize: 96,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.gold,
    letterSpacing: 20,
    lineHeight: 96,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  line: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.green,
  },
  tagline: {
    color: COLORS.green,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 8,
  },
  motto: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.base,
    fontStyle: 'italic',
    marginBottom: SPACING.xxxl + SPACING.xl,
    letterSpacing: 1,
  },
  buttonSection: {
    position: 'absolute',
    bottom: SPACING.xxxl + SPACING.base,
    left: SPACING.xl,
    right: SPACING.xl,
    alignItems: 'center',
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: COLORS.background,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 3,
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.gold + '60',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  secondaryBtnText: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 3,
  },
  memberCount: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 1,
  },
});

export default SplashScreen;
