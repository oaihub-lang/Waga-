import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { subscribeToPurse } from '../../services/firebase';

const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

// Mock paid members list — in prod comes from Firestore
const MOCK_PAID = [
  { uid: '1', name: 'Chidi O.', amount: 15000, fund: 'carnival', date: '2024-10-01' },
  { uid: '2', name: 'Ngozi A.', amount: 15000, fund: 'carnival', date: '2024-10-03' },
  { uid: '3', name: 'Emeka I.', amount: 5000, fund: 'medical', date: '2024-10-05' },
  { uid: '4', name: 'Adaeze C.', amount: 15000, fund: 'carnival', date: '2024-10-07' },
  { uid: '5', name: 'Kelechi N.', amount: 15000, fund: 'carnival', date: '2024-10-09' },
];

const FUND_GOALS = {
  carnival: { goal: 720 * 15000, label: 'Carnival 2024', color: COLORS.gold, icon: 'musical-notes' },
  medical: { goal: 500000, label: 'Medical Outreach', color: '#EF4444', icon: 'heart' },
};

const ThePurseScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { profile, isVerified, isAdmin } = useAuth();

  const [purseStats, setPurseStats] = useState({
    carnivalTotal: 315000,
    medicalTotal: 45000,
    paidMembers: MOCK_PAID.map((m) => m.uid),
  });
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'carnival' | 'medical'

  useEffect(() => {
    const unsub = subscribeToPurse((data) => setPurseStats(data));
    return unsub;
  }, []);

  const filteredPaid = activeFilter === 'all'
    ? MOCK_PAID
    : MOCK_PAID.filter((p) => p.fund === activeFilter);

  const carnivalPct = Math.min((purseStats.carnivalTotal / FUND_GOALS.carnival.goal) * 100, 100);
  const medicalPct = Math.min((purseStats.medicalTotal / FUND_GOALS.medical.goal) * 100, 100);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>The Purse</Text>
          <Text style={styles.subtitle}>OPP Financial Ledger 2024/2025</Text>
        </View>
        {isVerified && (
          <TouchableOpacity
            style={styles.contributeBtn}
            onPress={() => navigation.navigate('DuesPayment')}
            activeOpacity={0.8}
          >
            <LinearGradient colors={COLORS.gradientGold} style={styles.contributeBtnGrad}>
              <Ionicons name="add" size={18} color={COLORS.background} />
              <Text style={styles.contributeBtnText}>Contribute</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.gold} />}
      >
        {/* Fund cards */}
        <View style={styles.fundsSection}>
          {/* Carnival Fund */}
          <View style={styles.fundCard}>
            <LinearGradient colors={['#1A1200', COLORS.card]} style={styles.fundCardGrad}>
              <View style={styles.fundHeader}>
                <View style={[styles.fundIcon, { backgroundColor: COLORS.gold + '20' }]}>
                  <Ionicons name="musical-notes" size={22} color={COLORS.gold} />
                </View>
                <View>
                  <Text style={styles.fundLabel}>Carnival 2024 Fund</Text>
                  <Text style={styles.fundDate}>Dec 14th · Villa Toscana, Enugu</Text>
                </View>
              </View>

              <Text style={styles.fundAmount}>{formatNaira(purseStats.carnivalTotal)}</Text>
              <Text style={styles.fundGoal}>Goal: {formatNaira(FUND_GOALS.carnival.goal)}</Text>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${carnivalPct}%`, backgroundColor: COLORS.gold }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.pctLabel}>{carnivalPct.toFixed(1)}% funded</Text>
                <Text style={styles.pctLabel}>
                  {formatNaira(FUND_GOALS.carnival.goal - purseStats.carnivalTotal)} remaining
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Medical Fund */}
          <View style={styles.fundCard}>
            <View style={styles.fundCardInner}>
              <View style={styles.fundHeader}>
                <View style={[styles.fundIcon, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                  <Ionicons name="heart" size={22} color="#EF4444" />
                </View>
                <View>
                  <Text style={styles.fundLabel}>Medical Outreach Fund</Text>
                  <Text style={styles.fundDate}>Community Health Mission</Text>
                </View>
              </View>

              <Text style={[styles.fundAmount, { color: '#EF4444' }]}>{formatNaira(purseStats.medicalTotal)}</Text>
              <Text style={styles.fundGoal}>Goal: {formatNaira(FUND_GOALS.medical.goal)}</Text>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${medicalPct}%`, backgroundColor: '#EF4444' }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.pctLabel}>{medicalPct.toFixed(1)}% funded</Text>
                <Text style={styles.pctLabel}>
                  {formatNaira(FUND_GOALS.medical.goal - purseStats.medicalTotal)} remaining
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Summary stats */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Total Raised', value: formatNaira(purseStats.carnivalTotal + purseStats.medicalTotal), color: COLORS.gold, icon: 'cash' },
            { label: 'Paid Members', value: String(purseStats.paidMembers?.length || MOCK_PAID.length), color: COLORS.green, icon: 'people' },
            { label: 'Pending', value: String(720 - (purseStats.paidMembers?.length || MOCK_PAID.length)), color: COLORS.warning, icon: 'time' },
          ].map((stat) => (
            <View key={stat.label} style={styles.summaryItem}>
              <Ionicons name={stat.icon} size={16} color={stat.color} />
              <Text style={[styles.summaryValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.summaryLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Paid Members list */}
        <View style={styles.ledgerSection}>
          <View style={styles.ledgerHeader}>
            <Text style={styles.sectionTitle}>PAID MEMBERS LEDGER</Text>
            <Text style={styles.ledgerCount}>{MOCK_PAID.length} entries</Text>
          </View>

          {/* Filter chips */}
          <View style={styles.filterRow}>
            {[
              { key: 'all', label: 'All' },
              { key: 'carnival', label: 'Carnival' },
              { key: 'medical', label: 'Medical' },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredPaid.map((entry, i) => (
            <View key={i} style={styles.ledgerEntry}>
              <Avatar name={entry.name} size="sm" />
              <View style={styles.ledgerEntryInfo}>
                <Text style={styles.ledgerName}>{entry.name}</Text>
                <Text style={styles.ledgerDate}>{entry.date}</Text>
              </View>
              <View style={styles.ledgerRight}>
                <Text style={[
                  styles.ledgerAmount,
                  { color: entry.fund === 'carnival' ? COLORS.gold : '#EF4444' }
                ]}>
                  {formatNaira(entry.amount)}
                </Text>
                <View style={[
                  styles.fundTag,
                  { backgroundColor: entry.fund === 'carnival' ? COLORS.goldMuted : 'rgba(239,68,68,0.1)' }
                ]}>
                  <Text style={[
                    styles.fundTagText,
                    { color: entry.fund === 'carnival' ? COLORS.gold : '#EF4444' }
                  ]}>
                    {entry.fund}
                  </Text>
                </View>
              </View>
              <View style={styles.paidCheck}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
              </View>
            </View>
          ))}
        </View>

        {/* CTA for unverified */}
        {!isVerified && (
          <View style={styles.unverifyCTA}>
            <Ionicons name="lock-closed" size={20} color={COLORS.gold} />
            <Text style={styles.unverifyCTAText}>
              Get Verified to contribute to OPP funds and appear on the ledger.
            </Text>
            <Button
              title="LEARN MORE"
              onPress={() => navigation.navigate('DuesPayment')}
              variant="outline"
              size="sm"
              style={{ marginTop: SPACING.sm, alignSelf: 'center' }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  title: { color: COLORS.textPrimary, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.black },
  subtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  contributeBtn: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  contributeBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  contributeBtnText: { color: COLORS.background, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  fundsSection: { padding: SPACING.base, gap: SPACING.md },
  fundCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  fundCardGrad: { padding: SPACING.lg },
  fundCardInner: {
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
  },
  fundHeader: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center', marginBottom: SPACING.base },
  fundIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundLabel: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold },
  fundDate: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
  fundAmount: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.black,
    marginBottom: 2,
  },
  fundGoal: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: SPACING.md },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.divider,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pctLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  summaryRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: COLORS.divider,
    gap: 3,
  },
  summaryValue: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold },
  summaryLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  ledgerSection: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.xxl,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 2,
  },
  ledgerCount: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  filterRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldMuted },
  filterChipText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.gold },
  ledgerEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  ledgerEntryInfo: { flex: 1 },
  ledgerName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  ledgerDate: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  ledgerRight: { alignItems: 'flex-end', gap: 3 },
  ledgerAmount: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  fundTag: {
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  fundTagText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
  paidCheck: { marginLeft: SPACING.xs },
  unverifyCTA: {
    margin: SPACING.base,
    backgroundColor: COLORS.goldMuted,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  unverifyCTAText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ThePurseScreen;
