import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import GoldInput from '../../components/common/GoldInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      showToast('Welcome back, Oringo!', 'success');
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found' ? 'No account found with this email.' :
        err.code === 'auth/wrong-password' ? 'Incorrect password.' :
        err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.' :
        'Login failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0A0A0A', COLORS.background]} style={StyleSheet.absoluteFill} />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your OPP Lifestyle account</Text>
          </View>

          {/* Decorative badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>OPP VERIFIED PORTAL</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <GoldInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="mail-outline"
              error={errors.email}
            />
            <GoldInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />

            <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title={loading ? 'SIGNING IN...' : 'SIGN IN'}
              onPress={handleLogin}
              loading={loading}
              variant="gold"
              size="lg"
              style={{ marginTop: SPACING.lg }}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Not a member yet? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Register')}>
              <Text style={styles.footerLink}>Join OPP</Text>
            </TouchableOpacity>
          </View>

          {/* Laws reminder */}
          <View style={styles.lawsBox}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.gold} />
            <Text style={styles.lawsText}>
              By signing in, you agree to uphold the 6 Laws of OPP
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: SPACING.base,
    zIndex: 10,
    padding: SPACING.sm,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl + SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  header: { marginBottom: SPACING.xl },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.base,
    marginTop: SPACING.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.gold + '50',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginBottom: SPACING.xl,
  },
  badgeText: {
    color: COLORS.gold + '90',
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 3,
  },
  form: { marginBottom: SPACING.xl },
  forgotBtn: { alignSelf: 'flex-end', marginTop: SPACING.xs },
  forgotText: { color: COLORS.gold, fontSize: FONT_SIZE.sm },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.divider },
  dividerText: { color: COLORS.textMuted, marginHorizontal: SPACING.md, fontSize: FONT_SIZE.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  footerText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.base },
  footerLink: { color: COLORS.gold, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold },
  lawsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.goldMuted,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  lawsText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, flex: 1 },
});

export default LoginScreen;
