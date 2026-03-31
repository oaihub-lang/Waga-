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
import { OPP_LAWS } from '../../constants/theme';

const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { showToast } = useApp();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToLaws, setAgreeToLaws] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showLaws, setShowLaws] = useState(false);

  const validate = () => {
    const errs = {};
    if (!displayName.trim()) errs.displayName = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Minimum 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!agreeToLaws) errs.laws = 'You must agree to the 6 Laws of OPP';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, displayName.trim());
      showToast('Account created! Welcome to OPP.', 'success');
      navigation.navigate('Onboarding');
    } catch (err) {
      const msg =
        err.code === 'auth/email-already-in-use' ? 'Email already registered.' :
        err.code === 'auth/weak-password' ? 'Password too weak.' :
        'Registration failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0A0A0A', COLORS.background]} style={StyleSheet.absoluteFill} />

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Join OPP</Text>
            <Text style={styles.subtitle}>
              Create your account and begin your Oringo journey
            </Text>
          </View>

          {/* Unverified notice */}
          <View style={styles.notice}>
            <Ionicons name="information-circle" size={16} color={COLORS.info} />
            <Text style={styles.noticeText}>
              After registration, an Admin must approve your dues payment to grant Verified status.
            </Text>
          </View>

          <View style={styles.form}>
            <GoldInput
              label="Full Name"
              placeholder="Enter your full name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              icon="person-outline"
              error={errors.displayName}
            />
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
              placeholder="Minimum 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />
            <GoldInput
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.confirmPassword}
            />

            {/* 6 Laws Agreement */}
            <View style={styles.lawsSection}>
              <TouchableOpacity
                style={styles.lawsHeader}
                onPress={() => setShowLaws(!showLaws)}
                activeOpacity={0.7}
              >
                <Text style={styles.lawsTitle}>The 6 Laws of OPP</Text>
                <Ionicons
                  name={showLaws ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={COLORS.gold}
                />
              </TouchableOpacity>

              {showLaws && (
                <View style={styles.lawsList}>
                  {OPP_LAWS.map((law) => (
                    <View key={law.number} style={styles.lawItem}>
                      <Text style={styles.lawNumber}>Law {law.number}</Text>
                      <View style={styles.lawContent}>
                        <Text style={styles.lawTitle}>{law.title}</Text>
                        <Text style={styles.lawDesc}>{law.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setAgreeToLaws(!agreeToLaws)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agreeToLaws && styles.checkboxChecked]}>
                  {agreeToLaws && <Ionicons name="checkmark" size={12} color={COLORS.background} />}
                </View>
                <Text style={styles.checkText}>
                  I agree to uphold the 6 Laws of OPP and respect all members
                </Text>
              </TouchableOpacity>
              {errors.laws && <Text style={styles.error}>{errors.laws}</Text>}
            </View>

            <Button
              title={loading ? 'CREATING ACCOUNT...' : 'JOIN OPP'}
              onPress={handleRegister}
              loading={loading}
              variant="gold"
              size="lg"
              style={{ marginTop: SPACING.base }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already a member? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  subtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.base, marginTop: SPACING.xs },
  notice: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
    marginBottom: SPACING.xl,
    alignItems: 'flex-start',
  },
  noticeText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, flex: 1 },
  form: { marginBottom: SPACING.xl },
  lawsSection: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    padding: SPACING.base,
    marginBottom: SPACING.base,
  },
  lawsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  lawsTitle: { color: COLORS.gold, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  lawsList: { marginBottom: SPACING.md },
  lawItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  lawNumber: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    width: 40,
  },
  lawContent: { flex: 1 },
  lawTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semiBold },
  lawDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: COLORS.gold },
  checkText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, flex: 1, lineHeight: 18 },
  error: { color: COLORS.error, fontSize: FONT_SIZE.xs, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.base },
  footerLink: { color: COLORS.gold, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold },
});

export default RegisterScreen;
