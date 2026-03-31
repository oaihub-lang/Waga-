import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, BADGES, REPUTATION } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { profile, logout, isVerified, isAdmin } = useAuth();
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'badges' | 'activity'

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const reputationScore = profile?.reputationScore || 0;
  const reputationLevel = REPUTATION.LEVELS.find(
    (l) => reputationScore >= l.min && reputationScore <= l.max
  ) || REPUTATION.LEVELS[0];
  const progressPct = ((reputationScore - reputationLevel.min) / (reputationLevel.max - reputationLevel.min)) * 100;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <LinearGradient
          colors={['#1A1200', COLORS.background]}
          style={styles.heroBanner}
        >
          {/* Settings button */}
          <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Avatar */}
          <Avatar
            uri={profile?.photoURL}
            name={profile?.displayName}
            size="xxl"
            isVerified={isVerified}
            isAdmin={isAdmin}
            isOnline
            style={styles.avatar}
          />

          <Text style={styles.name}>{profile?.displayName || 'OPP Member'}</Text>

          <View style={styles.badgesRow}>
            {isVerified ? (
              <Badge.Verified />
            ) : (
              <View style={styles.unverifiedBadge}>
                <Ionicons name="time-outline" size={10} color={COLORS.textMuted} />
                <Text style={styles.unverifiedText}>Pending Verification</Text>
              </View>
            )}
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield" size={10} color={COLORS.adminRed} />
                <Text style={[styles.unverifiedText, { color: COLORS.adminRed }]}>Admin</Text>
              </View>
            )}
          </View>

          {profile?.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color={COLORS.textMuted} />
              <Text style={styles.location}>{profile.location}</Text>
            </View>
          )}

          {profile?.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}
        </LinearGradient>

        {/* Reputation Card */}
        <View style={styles.reputationCard}>
          <View style={styles.repHeader}>
            <View>
              <Text style={styles.repTitle}>Reputation Score</Text>
              <Text style={styles.repLevel}>{reputationLevel.label}</Text>
            </View>
            <View style={styles.repScore}>
              <Text style={styles.repScoreNum}>{reputationScore}</Text>
              <Text style={styles.repScoreLabel}>pts</Text>
            </View>
          </View>

          <StarRating score={reputationScore} size={20} showLabel />

          <View style={styles.repTrack}>
            <View style={[styles.repFill, { width: `${Math.min(progressPct, 100)}%` }]} />
          </View>
          <Text style={styles.repNext}>
            {reputationLevel.max - reputationScore} pts to next level
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Dues', value: profile?.dues?.status === 'paid' ? 'Paid' : 'Unpaid', color: profile?.dues?.status === 'paid' ? COLORS.green : COLORS.error, icon: 'cash' },
            { label: 'Vouches', value: '—', color: COLORS.gold, icon: 'thumbs-up' },
            { label: 'Attendance', value: '—', color: COLORS.info, icon: 'calendar' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Ionicons name={stat.icon} size={18} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Tab selector */}
        <View style={styles.tabBar}>
          {['info', 'badges', 'activity'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info tab */}
        {activeTab === 'info' && (
          <View style={styles.tabContent}>
            {profile?.handwork && (
              <View style={styles.infoRow}>
                <Ionicons name="briefcase" size={16} color={COLORS.gold} />
                <Text style={styles.infoLabel}>Handwork</Text>
                <Text style={styles.infoValue}>{profile.handwork}</Text>
              </View>
            )}
            {profile?.birthday && (
              <View style={styles.infoRow}>
                <Ionicons name="gift" size={16} color={COLORS.gold} />
                <Text style={styles.infoLabel}>Birthday</Text>
                <Text style={styles.infoValue}>{profile.birthday}</Text>
              </View>
            )}

            {/* Socials */}
            {profile?.socials && Object.entries(profile.socials).some(([, v]) => v) && (
              <View style={styles.socialsSection}>
                <Text style={styles.sectionTitle}>Social Links</Text>
                {profile.socials.instagram && (
                  <TouchableOpacity
                    style={styles.socialRow}
                    onPress={() => Linking.openURL(`https://instagram.com/${profile.socials.instagram.replace('@', '')}`)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-instagram" size={18} color='#E1306C' />
                    <Text style={styles.socialHandle}>{profile.socials.instagram}</Text>
                    <Ionicons name="open-outline" size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
                {profile.socials.twitter && (
                  <TouchableOpacity style={styles.socialRow} activeOpacity={0.7}>
                    <Ionicons name="logo-twitter" size={18} color='#1DA1F2' />
                    <Text style={styles.socialHandle}>{profile.socials.twitter}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Verified actions */}
            {isVerified && (
              <View style={styles.verifiedActions}>
                <Text style={styles.sectionTitle}>Verified Member Actions</Text>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Matchmaker')}
                  activeOpacity={0.7}
                >
                  <LinearGradient colors={[COLORS.gold + '20', 'transparent']} style={styles.actionCardGrad}>
                    <Ionicons name="heart" size={20} color={COLORS.gold} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionCardTitle}>OPP Vibe-Check</Text>
                      <Text style={styles.actionCardSubtitle}>Double-blind matchmaking</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.gold} />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('DuesPayment')}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionCardInner}>
                    <Ionicons name="card" size={20} color={COLORS.green} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionCardTitle}>Dues & Contributions</Text>
                      <Text style={styles.actionCardSubtitle}>Pay annual dues, Carnival & Medical funds</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Unverified CTA */}
            {!isVerified && (
              <View style={styles.unverifyCTA}>
                <Ionicons name="lock-closed" size={24} color={COLORS.gold} />
                <Text style={styles.unverifyCTATitle}>Get Verified</Text>
                <Text style={styles.unverifyCTAText}>
                  Pay your annual dues to an OPP Admin to unlock Matchmaker, Business Hub, and VIP Event access.
                </Text>
                <Button
                  title="PAY DUES"
                  onPress={() => navigation.navigate('DuesPayment')}
                  variant="gold"
                  size="md"
                  style={{ marginTop: SPACING.md }}
                />
              </View>
            )}
          </View>
        )}

        {/* Badges tab */}
        {activeTab === 'badges' && (
          <View style={styles.tabContent}>
            {profile?.badges?.length > 0 ? (
              <View style={styles.badgesGrid}>
                {profile.badges.map((badgeKey) => {
                  const badgeDef = BADGES[badgeKey];
                  if (!badgeDef) return null;
                  return (
                    <View key={badgeKey} style={styles.badgeGridItem}>
                      <View style={[styles.badgeIcon, { backgroundColor: badgeDef.color + '20' }]}>
                        <Ionicons name={badgeDef.icon} size={28} color={badgeDef.color} />
                      </View>
                      <Text style={[styles.badgeGridLabel, { color: badgeDef.color }]}>
                        {badgeDef.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyBadges}>
                <Ionicons name="medal-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No badges yet</Text>
                <Text style={styles.emptySubText}>
                  Pay dues on time, attend events, and contribute to earn badges.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Sign out */}
        <View style={styles.signOutSection}>
          <Button
            title="SIGN OUT"
            onPress={handleLogout}
            variant="danger"
            size="md"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroBanner: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  settingsBtn: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.base,
    padding: SPACING.sm,
  },
  avatar: { marginBottom: SPACING.md },
  name: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    marginBottom: SPACING.sm,
  },
  badgesRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.unverifiedBg,
    borderWidth: 1,
    borderColor: COLORS.unverifiedBorder,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  unverifiedText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderWidth: 1,
    borderColor: COLORS.adminRed + '50',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.sm },
  location: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  bio: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, textAlign: 'center', lineHeight: 18 },
  reputationCard: {
    margin: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    padding: SPACING.base,
  },
  repHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  repTitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginBottom: 2 },
  repLevel: { color: COLORS.gold, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold },
  repScore: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  repScoreNum: { color: COLORS.gold, fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.black },
  repScoreLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: 4 },
  repTrack: {
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    marginVertical: SPACING.sm,
    overflow: 'hidden',
  },
  repFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  repNext: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, textAlign: 'right' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: COLORS.divider,
    gap: 4,
  },
  statValue: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold },
  statLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.base,
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
  tabContent: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.xl },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  infoLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, flex: 1 },
  infoValue: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  socialsSection: { marginTop: SPACING.base },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.base,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  socialHandle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, flex: 1 },
  verifiedActions: { marginTop: SPACING.base },
  actionCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  actionCardGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
  },
  actionCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
    backgroundColor: COLORS.card,
  },
  actionCardTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semiBold },
  actionCardSubtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
  unverifyCTA: {
    alignItems: 'center',
    backgroundColor: COLORS.goldMuted,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  unverifyCTATitle: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  unverifyCTAText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  badgeGridItem: { alignItems: 'center', width: 90 },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  badgeGridLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  emptyBadges: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.lg, fontWeight: '600', marginTop: SPACING.md },
  emptySubText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 18 },
  signOutSection: { padding: SPACING.xl, paddingBottom: SPACING.xxxl },
});

export default ProfileScreen;
