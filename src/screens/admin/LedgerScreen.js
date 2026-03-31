import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import ScreenHeader from '../../components/common/ScreenHeader';
import Avatar from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

// Mock pending contributions awaiting admin approval
const MOCK_PENDING = [
  { id: '1', name: 'Obiora M.', amount: 15000, fund: 'carnival', ref: 'PSK-2024-001', submittedAt: '2024-10-10', status: 'pending' },
  { id: '2', name: 'Ifeoma N.', amount: 10000, fund: 'dues', ref: 'FW-2024-042', submittedAt: '2024-10-11', status: 'pending' },
  { id: '3', name: 'Uche O.', amount: 5000, fund: 'medical', ref: 'BANK-TRANS-09', submittedAt: '2024-10-12', status: 'pending' },
];

const MOCK_APPROVED = [
  { id: '4', name: 'Chidi O.', amount: 15000, fund: 'carnival', ref: 'PSK-2024-001', approvedAt: '2024-10-01', status: 'approved' },
  { id: '5', name: 'Ngozi A.', amount: 15000, fund: 'carnival', ref: 'FW-2024-009', approvedAt: '2024-10-03', status: 'approved' },
];

const ContributionRow = ({ item, onApprove, onReject, isAdmin }) => (
  <View style={[styles.row, item.status === 'pending' && styles.rowPending]}>
    <Avatar name={item.name} size="sm" />
    <View style={styles.rowInfo}>
      <Text style={styles.rowName}>{item.name}</Text>
      <Text style={styles.rowRef}>Ref: {item.ref}</Text>
      <Text style={styles.rowDate}>
        {item.submittedAt || item.approvedAt}
      </Text>
    </View>
    <View style={styles.rowRight}>
      <Text style={[
        styles.rowAmount,
        { color: item.fund === 'carnival' ? COLORS.gold : item.fund === 'medical' ? '#EF4444' : COLORS.green }
      ]}>
        {formatNaira(item.amount)}
      </Text>
      <View style={[
        styles.fundTag,
        { backgroundColor: item.fund === 'carnival' ? COLORS.goldMuted : 'rgba(239,68,68,0.1)' }
      ]}>
        <Text style={[
          styles.fundTagText,
          { color: item.fund === 'carnival' ? COLORS.gold : '#EF4444' }
        ]}>
          {item.fund}
        </Text>
      </View>
    </View>
    {isAdmin && item.status === 'pending' && (
      <View style={styles.approvalBtns}>
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => onApprove(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={14} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => onReject(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    )}
    {item.status === 'approved' && (
      <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
    )}
  </View>
);

const LedgerScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const { showToast } = useApp();

  const [pending, setPending] = useState(MOCK_PENDING);
  const [approved, setApproved] = useState(MOCK_APPROVED);
  const [activeTab, setActiveTab] = useState('pending');

  const totalRaised = approved.reduce((sum, c) => sum + c.amount, 0);
  const pendingTotal = pending.reduce((sum, c) => sum + c.amount, 0);

  const handleApprove = (item) => {
    Alert.alert(
      'Approve Payment',
      `Approve ${formatNaira(item.amount)} from ${item.name} for ${item.fund}?\n\nRef: ${item.ref}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            setPending((prev) => prev.filter((p) => p.id !== item.id));
            setApproved((prev) => [...prev, { ...item, status: 'approved', approvedAt: new Date().toISOString().split('T')[0] }]);
            showToast(`${item.name}'s payment approved!`, 'success');
          },
        },
      ]
    );
  };

  const handleReject = (item) => {
    Alert.alert(
      'Reject Payment',
      `Reject ${item.name}'s payment of ${formatNaira(item.amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setPending((prev) => prev.filter((p) => p.id !== item.id));
            showToast(`${item.name}'s payment rejected.`, 'warning');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Financial Ledger" subtitle="OPP Admin View" onBack={() => navigation.goBack()} />

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="cash" size={20} color={COLORS.gold} />
          <Text style={styles.summaryValue}>{formatNaira(totalRaised)}</Text>
          <Text style={styles.summaryLabel}>Total Approved</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="time" size={20} color={COLORS.warning} />
          <Text style={[styles.summaryValue, { color: COLORS.warning }]}>{formatNaira(pendingTotal)}</Text>
          <Text style={styles.summaryLabel}>Pending ({pending.length})</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="people" size={20} color={COLORS.green} />
          <Text style={[styles.summaryValue, { color: COLORS.green }]}>{approved.length}</Text>
          <Text style={styles.summaryLabel}>Paid Members</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'pending', label: `Pending (${pending.length})` },
          { key: 'approved', label: `Approved (${approved.length})` },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={activeTab === 'pending' ? pending : approved}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ContributionRow
            item={item}
            onApprove={handleApprove}
            onReject={handleReject}
            isAdmin={isAdmin}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>
              {activeTab === 'pending' ? 'No pending payments' : 'No approved payments yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  summaryRow: {
    flexDirection: 'row',
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  summaryValue: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  summaryLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, textAlign: 'center' },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  tabActive: { backgroundColor: COLORS.goldMuted },
  tabText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  tabTextActive: { color: COLORS.gold },
  list: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.xxxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  rowPending: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    paddingLeft: SPACING.sm,
  },
  rowInfo: { flex: 1 },
  rowName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  rowRef: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  rowDate: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  rowRight: { alignItems: 'flex-end', gap: 3 },
  rowAmount: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  fundTag: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  fundTagText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
  approvalBtns: { flexDirection: 'row', gap: 6 },
  approveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.adminRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZE.base, marginTop: SPACING.md },
});

export default LedgerScreen;
