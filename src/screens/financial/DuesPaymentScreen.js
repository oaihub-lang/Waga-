import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import ScreenHeader from '../../components/common/ScreenHeader';
import Button from '../../components/common/Button';
import GoldInput from '../../components/common/GoldInput';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { recordContribution } from '../../services/firebase';

const PAYMENT_OPTIONS = [
  { id: 'dues', label: 'Annual Dues', amount: 10000, description: 'Yearly membership dues — grants Verified status', icon: 'shield-checkmark', color: COLORS.gold },
  { id: 'carnival', label: 'Carnival Contribution', amount: 15000, description: 'Dec 14th Villa Toscana event ticket + contribution', icon: 'musical-notes', color: COLORS.gold },
  { id: 'medical', label: 'Medical Outreach', amount: 5000, description: 'Community health & medical mission fund', icon: 'heart', color: '#EF4444' },
  { id: 'custom', label: 'Custom Amount', amount: null, description: 'Contribute any amount to a fund of your choice', icon: 'cash', color: COLORS.green },
];

const PAYMENT_METHODS = [
  { id: 'paystack', label: 'Paystack', description: 'Card / Bank Transfer / USSD', icon: 'card', available: true },
  { id: 'flutterwave', label: 'Flutterwave', description: 'Multiple payment options', icon: 'globe', available: true },
  { id: 'bank', label: 'Direct Bank Transfer', description: 'Transfer to OPP account directly', icon: 'business', available: true },
];

const BANK_DETAILS = {
  bankName: 'Zenith Bank',
  accountName: 'OPP Lifestyle Community',
  accountNumber: '1234567890',
  sortCode: '057',
};

const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

const DuesPaymentScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, profile, isVerified } = useAuth();
  const { showToast } = useApp();

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1=select, 2=method, 3=confirm

  const selectedAmount = selectedOption?.amount || parseInt(customAmount, 10) || 0;

  const handleSubmitPayment = async () => {
    if (!paymentRef.trim()) {
      showToast('Please enter your payment reference', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await recordContribution(user.uid, selectedAmount, selectedOption?.id, paymentRef.trim());
      Alert.alert(
        'Payment Submitted!',
        'Your contribution has been recorded and is pending Admin verification. You will receive a notification once approved.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch {
      showToast('Failed to submit payment. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Dues & Contributions" onBack={() => navigation.goBack()} />

      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        {['Select', 'Method', 'Confirm'].map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View style={[styles.stepCircle, step > i + 1 && styles.stepCircleDone, step === i + 1 && styles.stepCircleActive]}>
              {step > i + 1 ? (
                <Ionicons name="checkmark" size={12} color={COLORS.background} />
              ) : (
                <Text style={[styles.stepNum, step === i + 1 && styles.stepNumActive]}>{i + 1}</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, step === i + 1 && styles.stepLabelActive]}>{label}</Text>
            {i < 2 && <View style={[styles.stepLine, step > i + 1 && styles.stepLineDone]} />}
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Step 1: Select payment type */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>SELECT PAYMENT TYPE</Text>
            {PAYMENT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionCard, selectedOption?.id === option.id && styles.optionCardSelected]}
                onPress={() => setSelectedOption(option)}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon} size={22} color={option.color} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDesc}>{option.description}</Text>
                  {option.amount && (
                    <Text style={[styles.optionAmount, { color: option.color }]}>
                      {formatNaira(option.amount)}
                    </Text>
                  )}
                </View>
                <View style={[styles.radioOuter, selectedOption?.id === option.id && styles.radioOuterSelected]}>
                  {selectedOption?.id === option.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}

            {selectedOption?.id === 'custom' && (
              <GoldInput
                label="Custom Amount (NGN)"
                placeholder="Enter amount e.g. 20000"
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
                icon="cash-outline"
                style={{ marginTop: SPACING.base }}
              />
            )}

            <Button
              title="CONTINUE"
              onPress={() => selectedOption && setStep(2)}
              variant="gold"
              size="lg"
              disabled={!selectedOption || (selectedOption.id === 'custom' && !customAmount)}
              style={{ marginTop: SPACING.xl }}
            />
          </View>
        )}

        {/* Step 2: Payment method */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>CHOOSE PAYMENT METHOD</Text>
            <View style={styles.amountDisplay}>
              <Text style={styles.amountDisplayLabel}>You're paying</Text>
              <Text style={styles.amountDisplayValue}>{formatNaira(selectedAmount)}</Text>
              <Text style={styles.amountDisplayFor}>for {selectedOption?.label}</Text>
            </View>

            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodCard, selectedMethod?.id === method.id && styles.methodCardSelected]}
                onPress={() => setSelectedMethod(method)}
                activeOpacity={0.8}
              >
                <Ionicons name={method.icon} size={22} color={selectedMethod?.id === method.id ? COLORS.gold : COLORS.textSecondary} />
                <View style={styles.methodInfo}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  <Text style={styles.methodDesc}>{method.description}</Text>
                </View>
                <View style={[styles.radioOuter, selectedMethod?.id === method.id && styles.radioOuterSelected]}>
                  {selectedMethod?.id === method.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}

            {/* Bank details */}
            {selectedMethod?.id === 'bank' && (
              <View style={styles.bankDetails}>
                <Text style={styles.bankDetailsTitle}>Bank Transfer Details</Text>
                {Object.entries(BANK_DETAILS).map(([key, value]) => (
                  <View key={key} style={styles.bankRow}>
                    <Text style={styles.bankKey}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                    <Text style={styles.bankValue}>{value}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.navBtns}>
              <Button title="BACK" onPress={() => setStep(1)} variant="ghost" size="md" fullWidth={false} style={{ flex: 1 }} />
              <Button
                title="CONTINUE"
                onPress={() => selectedMethod && setStep(3)}
                variant="gold"
                size="md"
                disabled={!selectedMethod}
                fullWidth={false}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        )}

        {/* Step 3: Confirm & submit reference */}
        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>CONFIRM PAYMENT</Text>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <LinearGradient colors={[COLORS.gold + '15', 'transparent']} style={styles.summaryCardGrad}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Payment For</Text>
                  <Text style={styles.summaryValue}>{selectedOption?.label}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.gold, fontWeight: FONT_WEIGHT.black }]}>
                    {formatNaira(selectedAmount)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Method</Text>
                  <Text style={styles.summaryValue}>{selectedMethod?.label}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Member</Text>
                  <Text style={styles.summaryValue}>{profile?.displayName}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Reference input */}
            <GoldInput
              label="Payment Reference / Transaction ID"
              placeholder="Enter your payment reference number"
              value={paymentRef}
              onChangeText={setPaymentRef}
              icon="document-text-outline"
            />

            <View style={styles.confirmNote}>
              <Ionicons name="information-circle" size={16} color={COLORS.info} />
              <Text style={styles.confirmNoteText}>
                After submission, an Admin will verify your payment and update your status within 24 hours.
              </Text>
            </View>

            <View style={styles.navBtns}>
              <Button title="BACK" onPress={() => setStep(2)} variant="ghost" size="md" fullWidth={false} style={{ flex: 1 }} />
              <Button
                title={submitting ? 'SUBMITTING...' : 'SUBMIT PAYMENT'}
                onPress={handleSubmitPayment}
                loading={submitting}
                variant="gold"
                size="md"
                disabled={!paymentRef.trim()}
                fullWidth={false}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.base,
    gap: 0,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  stepCircleActive: { borderColor: COLORS.gold },
  stepCircleDone: { borderColor: COLORS.gold, backgroundColor: COLORS.gold },
  stepNum: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  stepNumActive: { color: COLORS.gold },
  stepLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginLeft: 6,
    fontWeight: '600',
  },
  stepLabelActive: { color: COLORS.gold },
  stepLine: { width: 32, height: 1, backgroundColor: COLORS.divider, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: COLORS.gold },
  content: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 2,
    marginBottom: SPACING.base,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  optionCardSelected: { borderColor: COLORS.gold },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: { flex: 1 },
  optionLabel: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semiBold },
  optionDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2, lineHeight: 15 },
  optionAmount: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, marginTop: 3 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: COLORS.gold },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.gold },
  amountDisplay: {
    alignItems: 'center',
    backgroundColor: COLORS.goldMuted,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  amountDisplayLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  amountDisplayValue: { color: COLORS.gold, fontSize: FONT_SIZE.xxxl, fontWeight: FONT_WEIGHT.black },
  amountDisplayFor: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  methodCardSelected: { borderColor: COLORS.gold },
  methodInfo: { flex: 1 },
  methodLabel: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semiBold },
  methodDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 1 },
  bankDetails: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  bankDetailsTitle: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  bankKey: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, textTransform: 'capitalize' },
  bankValue: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  summaryCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    marginBottom: SPACING.base,
  },
  summaryCardGrad: { padding: SPACING.lg },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  summaryLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  summaryValue: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  confirmNote: {
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
  confirmNoteText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, flex: 1, lineHeight: 16 },
  navBtns: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});

export default DuesPaymentScreen;
