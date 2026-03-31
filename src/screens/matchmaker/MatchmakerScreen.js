import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import ScreenHeader from '../../components/common/ScreenHeader';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getAllMembers, submitVibe, getMyMatches } from '../../services/firebase';

const MAX_VIBES = 3;

const MatchmakerScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, profile, isVerified } = useAuth();
  const { showToast } = useApp();

  const [members, setMembers] = useState([]);
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'matches'

  const heartAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isVerified) return;
    loadData();
  }, [isVerified]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allMembers = await getAllMembers();
      // Filter out current user and unverified members
      setMembers(allMembers.filter((m) => m.id !== user.uid && m.isVerified));
      const myMatches = await getMyMatches(user.uid);
      setMatches(myMatches);
    } catch {
      showToast('Failed to load members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleVibe = (memberId) => {
    if (selectedVibes.includes(memberId)) {
      setSelectedVibes((prev) => prev.filter((id) => id !== memberId));
      return;
    }
    if (selectedVibes.length >= MAX_VIBES) {
      showToast(`Maximum ${MAX_VIBES} vibes allowed.`, 'warning');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    // Pulse animation
    Animated.sequence([
      Animated.timing(heartAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.timing(heartAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVibes((prev) => [...prev, memberId]);
  };

  const handleSubmitVibes = async () => {
    if (selectedVibes.length === 0) {
      showToast('Select at least one person you vibe with.', 'warning');
      return;
    }

    Alert.alert(
      'Submit Vibes?',
      `You're about to send vibes to ${selectedVibes.length} member${selectedVibes.length > 1 ? 's' : ''}. This is strictly confidential. A notification only goes out if it's mutual.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setLoading(true);
            let mutualCount = 0;
            try {
              for (const toUid of selectedVibes) {
                const isMutual = await submitVibe(user.uid, toUid);
                if (isMutual) mutualCount++;
              }
              setSubmitted(true);
              if (mutualCount > 0) {
                showToast(`${mutualCount} mutual vibe${mutualCount > 1 ? 's' : ''}! Check your matches.`, 'success');
              } else {
                showToast('Vibes submitted secretly. 🤫', 'success');
              }
              await loadData();
            } catch {
              showToast('Failed to submit vibes', 'error');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Gate for unverified users
  if (!isVerified) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Vibe-Check" onBack={() => navigation.goBack()} />
        <View style={styles.lockedContainer}>
          <LinearGradient
            colors={[COLORS.gold + '20', 'transparent']}
            style={styles.lockedCard}
          >
            <Ionicons name="lock-closed" size={56} color={COLORS.gold} />
            <Text style={styles.lockedTitle}>Verified Members Only</Text>
            <Text style={styles.lockedSubtitle}>
              Get Verified by paying your annual OPP dues to unlock the Matchmaker module.
            </Text>
            <Button
              title="GET VERIFIED"
              onPress={() => navigation.navigate('DuesPayment')}
              variant="gold"
              size="md"
              style={{ marginTop: SPACING.xl }}
            />
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="OPP Vibe-Check"
        subtitle="Double-blind · Strictly Confidential"
        onBack={() => navigation.goBack()}
      />

      {/* Disclaimer banner */}
      <View style={styles.disclaimerBanner}>
        <Ionicons name="shield" size={14} color={COLORS.gold} />
        <Text style={styles.disclaimerText}>
          All selections are completely private. Notifications only sent on mutual matches.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['browse', 'matches'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={tab === 'browse' ? 'people' : 'heart'}
              size={15}
              color={activeTab === tab ? COLORS.gold : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'browse' ? 'Browse Members' : `Matches (${matches.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'browse' && (
        <>
          {/* Vibe counter */}
          <View style={styles.vibeCounter}>
            <Text style={styles.vibeCounterText}>
              <Text style={{ color: COLORS.gold, fontWeight: FONT_WEIGHT.black }}>
                {selectedVibes.length}/{MAX_VIBES}
              </Text>
              {' '}vibes selected
            </Text>
            {selectedVibes.length > 0 && (
              <TouchableOpacity onPress={handleSubmitVibes} style={styles.submitVibesBtn}>
                <LinearGradient
                  colors={['#FF6B9D', '#FF3366']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitVibesBtnGrad}
                >
                  <Ionicons name="heart" size={14} color="#FFF" />
                  <Text style={styles.submitVibesBtnText}>Submit Vibes</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item }) => {
              const isSelected = selectedVibes.includes(item.id);
              return (
                <TouchableOpacity
                  style={[styles.memberCard, isSelected && styles.memberCardSelected]}
                  onPress={() => toggleVibe(item.id)}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <View style={styles.selectedOverlay}>
                      <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
                        <Ionicons name="heart" size={24} color="#FF6B9D" />
                      </Animated.View>
                    </View>
                  )}
                  <Avatar
                    uri={item.photoURL}
                    name={item.displayName}
                    size="lg"
                    isVerified={item.isVerified}
                  />
                  <Text style={styles.memberName} numberOfLines={1}>
                    {item.displayName?.split(' ')[0] || 'Member'}
                  </Text>
                  {item.location && (
                    <Text style={styles.memberLocation} numberOfLines={1}>
                      {item.location.split(',')[0]}
                    </Text>
                  )}
                  {item.handwork && (
                    <View style={styles.handworkTag}>
                      <Text style={styles.handworkText} numberOfLines={1}>
                        {item.handwork}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              !loading && (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>No verified members to display</Text>
                </View>
              )
            }
          />
        </>
      )}

      {activeTab === 'matches' && (
        <View style={styles.matchesContainer}>
          {matches.length === 0 ? (
            <View style={styles.noMatchesState}>
              <LinearGradient
                colors={['#FF6B9D20', 'transparent']}
                style={styles.noMatchCard}
              >
                <Text style={styles.noMatchEmoji}>💝</Text>
                <Text style={styles.noMatchTitle}>No mutual vibes yet</Text>
                <Text style={styles.noMatchSubtitle}>
                  Browse members and submit your vibes. We'll notify you when it's mutual — completely in secret.
                </Text>
                <View style={styles.privacyNote}>
                  <Ionicons name="lock-closed" size={12} color={COLORS.gold} />
                  <Text style={styles.privacyNoteText}>
                    "Learn to Love" — No drama, just pure Oringo connections
                  </Text>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <FlatList
              data={matches}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: SPACING.base }}
              renderItem={({ item }) => {
                const otherUid = item.users.find((uid) => uid !== user.uid);
                const otherMember = members.find((m) => m.id === otherUid);
                if (!otherMember) return null;
                return (
                  <TouchableOpacity
                    style={styles.matchCard}
                    onPress={() => navigation.navigate('MemberProfile', { memberId: otherUid })}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#FF6B9D20', 'transparent']}
                      style={styles.matchCardGrad}
                    >
                      <Avatar uri={otherMember.photoURL} name={otherMember.displayName} size="md" isVerified />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.matchName}>{otherMember.displayName}</Text>
                        <View style={styles.matchBadge}>
                          <Ionicons name="heart" size={10} color="#FF6B9D" />
                          <Text style={styles.matchBadgeText}>Mutual Vibe Match!</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  lockedContainer: { flex: 1, padding: SPACING.xl, justifyContent: 'center' },
  lockedCard: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  lockedTitle: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  lockedSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.goldMuted,
    margin: SPACING.base,
    marginTop: 0,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gold + '25',
  },
  disclaimerText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, flex: 1, lineHeight: 16 },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  tabActive: { backgroundColor: COLORS.goldMuted },
  tabText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  tabTextActive: { color: COLORS.gold },
  vibeCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  vibeCounterText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  submitVibesBtn: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  submitVibesBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  submitVibesBtnText: { color: '#FFF', fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  grid: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.xxxl },
  gridRow: { gap: SPACING.sm, marginBottom: SPACING.sm },
  memberCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  memberCardSelected: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FF6B9D10',
  },
  selectedOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 1,
  },
  memberName: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  memberLocation: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
  handworkTag: {
    backgroundColor: COLORS.goldMuted,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    maxWidth: '100%',
  },
  handworkText: { color: COLORS.gold, fontSize: 9, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZE.base, marginTop: SPACING.md },
  matchesContainer: { flex: 1 },
  noMatchesState: { flex: 1, padding: SPACING.xl, justifyContent: 'center' },
  noMatchCard: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B9D30',
  },
  noMatchEmoji: { fontSize: 56 },
  noMatchTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },
  noMatchSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.goldMuted,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  privacyNoteText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontStyle: 'italic', flex: 1 },
  matchCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FF6B9D30',
  },
  matchCardGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
  },
  matchName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semiBold },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  matchBadgeText: { color: '#FF6B9D', fontSize: FONT_SIZE.xs, fontWeight: '600' },
});

export default MatchmakerScreen;
