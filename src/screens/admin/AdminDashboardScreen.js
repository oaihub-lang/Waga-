import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, OPP_LAWS } from '../../constants/theme';
import ScreenHeader from '../../components/common/ScreenHeader';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getAdminStats } from '../../services/firebase';

const StatCard = ({ label, value, icon, color, onPress }) => (
  <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const AdminDashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { profile, isAdmin } = useAuth();
  const { showToast } = useApp();

  const [stats, setStats] = useState({
    totalMembers: 0,
    verifiedMembers: 0,
    pendingVerification: 0,
    paidDues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigation.goBack();
      return;
    }
    loadStats();
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch {
      showToast('Failed to load admin stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Admin Command Center"
        subtitle="OPP Leadership Panel"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Admin identity badge */}
        <LinearGradient
          colors={['rgba(255,68,68,0.15)', 'transparent']}
          style={styles.adminBanner}
        >
          <View style={styles.adminBannerLeft}>
            <Ionicons name="shield" size={24} color={COLORS.adminRed} />
            <View>
              <Text style={styles.adminBannerTitle}>Admin Access</Text>
              <Text style={styles.adminBannerName}>{profile?.displayName}</Text>
            </View>
          </View>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>COMMUNITY OVERVIEW</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Members"
            value={String(stats.totalMembers)}
            icon="people"
            color={COLORS.gold}
          />
          <StatCard
            label="Verified"
            value={String(stats.verifiedMembers)}
            icon="shield-checkmark"
            color={COLORS.green}
            onPress={() => navigation.navigate('MemberManagement')}
          />
          <StatCard
            label="Pending"
            value={String(stats.pendingVerification)}
            icon="time"
            color={COLORS.warning}
            onPress={() => navigation.navigate('MemberManagement')}
          />
          <StatCard
            label="Dues Paid"
            value={String(stats.paidDues)}
            icon="cash"
            color={COLORS.info}
            onPress={() => navigation.navigate('Ledger')}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>ADMIN ACTIONS</Text>
        <View style={styles.actionsGrid}>
          {[
            {
              title: 'Verify Members',
              subtitle: 'Approve dues payments',
              icon: 'shield-checkmark',
              color: COLORS.green,
              onPress: () => navigation.navigate('MemberManagement'),
            },
            {
              title: 'Financial Ledger',
              subtitle: 'View & manage funds',
              icon: 'cash',
              color: COLORS.gold,
              onPress: () => navigation.navigate('Ledger'),
            },
            {
              title: 'Mute All Mics',
              subtitle: 'Stage control for meetings',
              icon: 'mic-off',
              color: COLORS.adminRed,
              onPress: () => Alert.alert('Mute All', 'This will mute all active microphones in the Lounge. Proceed?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Mute All', style: 'destructive', onPress: () => showToast('All mics muted', 'success') },
              ]),
            },
            {
              title: 'Carnival Hub',
              subtitle: 'Event management',
              icon: 'musical-notes',
              color: '#FF6B9D',
              onPress: () => navigation.navigate('CarnivalHub'),
            },
            {
              title: 'Adjust Reputation',
              subtitle: 'Modify member scores',
              icon: 'star',
              color: COLORS.gold,
              onPress: () => navigation.navigate('MemberManagement'),
            },
            {
              title: 'Notifications',
              subtitle: 'Send community alerts',
              icon: 'notifications',
              color: COLORS.info,
              onPress: () => showToast('Broadcast notifications coming soon', 'info'),
            },
          ].map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionCard}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 6 Laws of OPP */}
        <Text style={styles.sectionTitle}>THE 6 LAWS OF OPP</Text>
        <View style={styles.lawsCard}>
          {OPP_LAWS.map((law) => (
            <View key={law.number} style={styles.lawRow}>
              <View style={styles.lawNumBadge}>
                <Text style={styles.lawNumText}>{law.number}</Text>
              </View>
              <View style={styles.lawContent}>
                <Text style={styles.lawTitle}>{law.title}</Text>
                <Text style={styles.lawDesc}>{law.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Enforcement actions */}
        <View style={styles.enforcementCard}>
          <View style={styles.enforcementHeader}>
            <Ionicons name="gavel" size={18} color={COLORS.adminRed} />
            <Text style={styles.enforcementTitle}>Law Enforcement</Text>
          </View>
          <Text style={styles.enforcementSubtitle}>
            Violators of the 6 Laws can be penalized, suspended, or banned from the platform.
          </Text>
          <Button
            title="MANAGE VIOLATIONS"
            onPress={() => navigation.navigate('MemberManagement')}
            variant="danger"
            size="md"
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.adminRed + '30',
  },
  adminBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  adminBannerTitle: { color: COLORS.adminRed, fontSize: FONT_SIZE.xs, fontWeight: '600', letterSpacing: 1 },
  adminBannerName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold },
  adminBadge: {
    backgroundColor: 'rgba(255,68,68,0.15)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.adminRed + '40',
  },
  adminBadgeText: { color: COLORS.adminRed, fontSize: 10, fontWeight: FONT_WEIGHT.black, letterSpacing: 2 },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 2,
    marginBottom: SPACING.md,
    marginTop: SPACING.base,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.black },
  statLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, textAlign: 'center' },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  actionTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semiBold },
  actionSubtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  lawsCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.base,
  },
  lawRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  lawNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.goldMuted,
    borderWidth: 1,
    borderColor: COLORS.gold + '50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lawNumText: { color: COLORS.gold, fontSize: 12, fontWeight: FONT_WEIGHT.black },
  lawContent: { flex: 1 },
  lawTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semiBold },
  lawDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2, lineHeight: 15 },
  enforcementCard: {
    backgroundColor: 'rgba(255,68,68,0.08)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.2)',
  },
  enforcementHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  enforcementTitle: { color: COLORS.adminRed, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold },
  enforcementSubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, lineHeight: 18 },
});

export default AdminDashboardScreen;
