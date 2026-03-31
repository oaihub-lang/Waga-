import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SCREEN } from '../../constants/theme';
import GoldInput from '../../components/common/GoldInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { updateUserProfile } from '../../services/firebase';

const STEPS = [
  {
    key: 'intro',
    title: 'OPP Intro Format',
    subtitle: 'Complete your profile to enter the community. Read-only mode until finished.',
    icon: 'person-circle',
  },
  {
    key: 'details',
    title: 'Your Details',
    subtitle: 'Tell the OPP family who you are',
    icon: 'id-card',
  },
  {
    key: 'socials',
    title: 'Connect Socials',
    subtitle: 'Let members find and connect with you',
    icon: 'share-social',
  },
  {
    key: 'done',
    title: 'You\'re In!',
    subtitle: 'Welcome to OPP Lifestyle',
    icon: 'checkmark-circle',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast } = useApp();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    birthday: '',
    location: '',
    bio: '',
    handwork: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
  });

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const animateProgress = (step) => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / STEPS.length,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const nextStep = () => {
    const next = currentStep + 1;
    setCurrentStep(next);
    animateProgress(next);
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        birthday: form.birthday,
        location: form.location,
        bio: form.bio,
        handwork: form.handwork || null,
        socials: {
          instagram: form.instagram,
          twitter: form.twitter,
          whatsapp: form.whatsapp,
        },
        onboardingComplete: true,
      });
      showToast('Welcome to OPP Lifestyle!', 'success');
    } catch {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const step = STEPS[currentStep];
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0A0A0A', COLORS.background]} style={StyleSheet.absoluteFill} />

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      {/* Step counter */}
      <View style={styles.stepCounter}>
        {STEPS.map((s, i) => (
          <View
            key={s.key}
            style={[
              styles.stepDot,
              i <= currentStep && styles.stepDotActive,
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.stepHeader}>
            <View style={styles.stepIcon}>
              <Ionicons name={step.icon} size={36} color={COLORS.gold} />
            </View>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
          </View>

          {/* Step 0: Intro / read-only notice */}
          {currentStep === 0 && (
            <View style={styles.introSection}>
              <View style={styles.readonlyBanner}>
                <Ionicons name="eye" size={18} color={COLORS.warning} />
                <Text style={styles.readonlyText}>
                  You are currently in <Text style={{ color: COLORS.warning, fontWeight: '700' }}>Read-Only Mode</Text>.
                  Complete this format to unlock the full OPP experience.
                </Text>
              </View>

              <Text style={styles.sectionLabel}>What you'll set up:</Text>
              {['Your birthday & location', 'A short bio', 'Your "Handwork" (business/skill)', 'Social media links'].map((item, i) => (
                <View key={i} style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.gold} />
                  <Text style={styles.checkItemText}>{item}</Text>
                </View>
              ))}

              <Button title="START INTRO FORMAT" onPress={nextStep} variant="gold" size="lg" style={{ marginTop: SPACING.xl }} />
            </View>
          )}

          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <View>
              <GoldInput
                label="Birthday"
                placeholder="DD/MM/YYYY"
                value={form.birthday}
                onChangeText={(v) => updateField('birthday', v)}
                icon="calendar-outline"
                keyboardType="numeric"
              />
              <GoldInput
                label="Location"
                placeholder="City, Country (e.g. Lagos, Nigeria)"
                value={form.location}
                onChangeText={(v) => updateField('location', v)}
                autoCapitalize="words"
                icon="location-outline"
              />
              <GoldInput
                label="Bio"
                placeholder="Tell OPP who you are in a few words..."
                value={form.bio}
                onChangeText={(v) => updateField('bio', v)}
                multiline
                numberOfLines={3}
                icon="chatbubble-outline"
                autoCapitalize="sentences"
              />
              <GoldInput
                label="Your Handwork (optional)"
                placeholder="e.g. Hair Stylist, Real Estate, Engineer"
                value={form.handwork}
                onChangeText={(v) => updateField('handwork', v)}
                autoCapitalize="words"
                icon="briefcase-outline"
              />
              <Button title="CONTINUE" onPress={nextStep} variant="gold" size="lg" style={{ marginTop: SPACING.base }} />
            </View>
          )}

          {/* Step 2: Socials */}
          {currentStep === 2 && (
            <View>
              <GoldInput
                label="Instagram"
                placeholder="@yourusername"
                value={form.instagram}
                onChangeText={(v) => updateField('instagram', v)}
                icon="logo-instagram"
              />
              <GoldInput
                label="Twitter / X"
                placeholder="@yourusername"
                value={form.twitter}
                onChangeText={(v) => updateField('twitter', v)}
                icon="logo-twitter"
              />
              <GoldInput
                label="WhatsApp Number"
                placeholder="+234 xxx xxx xxxx"
                value={form.whatsapp}
                onChangeText={(v) => updateField('whatsapp', v)}
                keyboardType="phone-pad"
                icon="logo-whatsapp"
              />
              <Button title="ALMOST THERE" onPress={nextStep} variant="gold" size="lg" style={{ marginTop: SPACING.base }} />
              <Button title="SKIP FOR NOW" onPress={nextStep} variant="ghost" size="md" style={{ marginTop: SPACING.sm }} />
            </View>
          )}

          {/* Step 3: Done */}
          {currentStep === 3 && (
            <View style={styles.doneSection}>
              <LinearGradient
                colors={[COLORS.gold + '20', COLORS.green + '10']}
                style={styles.doneBadge}
              >
                <Text style={styles.doneEmoji}>🏆</Text>
                <Text style={styles.doneTitle}>Oringo Is Real!</Text>
                <Text style={styles.doneSubtitle}>
                  Your profile is set up. Contact an Admin to pay your dues and get Verified.
                </Text>
              </LinearGradient>

              <View style={styles.nextSteps}>
                <Text style={styles.nextStepsTitle}>Next Steps:</Text>
                {[
                  'Pay your annual dues to an OPP Admin',
                  'Get Verified — unlock Business Hub, Matchmaker & more',
                  'Build your Reputation Score through community activity',
                  'Attend the Carnival on Dec 14th at Villa Toscana, Enugu',
                ].map((step, i) => (
                  <View key={i} style={styles.nextStepItem}>
                    <View style={styles.nextStepNum}>
                      <Text style={styles.nextStepNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.nextStepText}>{step}</Text>
                  </View>
                ))}
              </View>

              <Button
                title={loading ? 'ENTERING...' : 'ENTER OPP LIFESTYLE'}
                onPress={handleFinish}
                loading={loading}
                variant="gold"
                size="lg"
                style={{ marginTop: SPACING.xl }}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  progressTrack: {
    height: 3,
    backgroundColor: COLORS.divider,
    marginHorizontal: 0,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  stepCounter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.divider,
  },
  stepDotActive: { backgroundColor: COLORS.gold },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
  },
  stepTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    textAlign: 'center',
  },
  stepSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  introSection: {},
  readonlyBanner: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    marginBottom: SPACING.xl,
    alignItems: 'flex-start',
  },
  readonlyText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, flex: 1, lineHeight: 18 },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  checkItemText: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base },
  doneSection: { alignItems: 'center' },
  doneBadge: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    marginBottom: SPACING.xl,
  },
  doneEmoji: { fontSize: 48, marginBottom: SPACING.md },
  doneTitle: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    marginBottom: SPACING.sm,
  },
  doneSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  nextSteps: { width: '100%', marginBottom: SPACING.base },
  nextStepsTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  nextStepItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  nextStepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.goldMuted,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepNumText: { color: COLORS.gold, fontSize: 11, fontWeight: FONT_WEIGHT.black },
  nextStepText: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, flex: 1, lineHeight: 18 },
});

export default OnboardingScreen;
