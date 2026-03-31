import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import ScreenHeader from '../../components/common/ScreenHeader';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getAllMembers, verifyMember, banMember, adjustReputation } from '../../services/firebase';

const MemberRow = ({ member, onVerify, onBan, onAdjustRep, adminUid }) => {
  return (
    <View style={styles.memberRow}>
      <Avatar
        uri={member.photoURL}
        name={member.displayName}
        size="md"
        isVerified={member.isVerified}
        isAdmin={member.isAdmin}
      />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{member.displayName || 'Unknown'}</Text>
          {member.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.green} />
            </View>
          )}
          {member.isBanned && (
            <View style={styles.bannedBadge}>
              <Text style={styles.bannedText}>BANNED</Text>
            </View>
          )}
        </View>
        <Text style={styles.memberEmail}>{member.email}</Text>
        <StarRating score={member.reputationScore || 0} size={11} />
        <Text style={styles.duesStatus}>
          Dues: <Text style={{ color: member.dues?.status === 'paid' ? COLORS.green : COLORS.error }}>
            {member.dues?.status || 'unpaid'}
          </Text>
        </Text>
      </View>
      <View style={styles.memberActions}>
        {!member.isVerified && !member.isBanned && (
          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={() => onVerify(member)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark" size={14} color={COLORS.background} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => {
            Alert.alert(
              member.displayName || 'Member',
              'Select an action',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: '+10 Reputation',
                  onPress: () => onAdjustRep(member.id, 10, 'admin_bonus'),
                },
                {
                  text: '-20 Reputation',
                  style: 'destructive',
                  onPress: () => onAdjustRep(member.id, -20, 'violation'),
                },
                {
                  text: member.isBanned ? 'Unban' : 'Ban Member',
                  style: 'destructive',
                  onPress: () => onBan(member),
                },
              ]
            );
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MemberManagementScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { showToast } = useApp();

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'verified' | 'unverified' | 'pending'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getAllMembers();
      setMembers(data);
    } catch {
      showToast('Failed to load members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (member) => {
    Alert.alert(
      'Verify Member',
      `Mark ${member.displayName}'s dues as paid and grant Verified status?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            try {
              await verifyMember(member.id, user.uid);
              showToast(`${member.displayName} is now Verified!`, 'success');
              loadMembers();
            } catch {
              showToast('Verification failed', 'error');
            }
          },
        },
      ]
    );
  };

  const handleBan = (member) => {
    Alert.prompt(
      'Ban Member',
      `Enter reason for banning ${member.displayName}:`,
      async (reason) => {
        if (!reason) return;
        try {
          await banMember(member.id, reason, user.uid);
          showToast(`${member.displayName} has been banned.`, 'success');
          loadMembers();
        } catch {
          showToast('Ban failed', 'error');
        }
      },
      'plain-text',
      '',
      'default'
    );
  };

  const handleAdjustRep = async (uid, points, reason) => {
    try {
      await adjustReputation(uid, points, reason);
      showToast(`Reputation adjusted by ${points > 0 ? '+' : ''}${points}`, 'success');
      loadMembers();
    } catch {
      showToast('Failed to adjust reputation', 'error');
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      search.trim() === '' ||
      m.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'verified' && m.isVerified) ||
      (filter === 'unverified' && !m.isVerified && !m.isBanned) ||
      (filter === 'banned' && m.isBanned);

    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Member Management"
        subtitle={`${members.length} total members`}
        onBack={() => navigation.goBack()}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'verified', label: 'Verified' },
          { key: 'unverified', label: 'Unverified' },
          { key: 'banned', label: 'Banned' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          <Text style={{ color: COLORS.green }}>{members.filter((m) => m.isVerified).length}</Text> verified ·{' '}
          <Text style={{ color: COLORS.warning }}>{members.filter((m) => !m.isVerified).length}</Text> pending ·{' '}
          <Text style={{ color: COLORS.error }}>{members.filter((m) => m.isBanned).length}</Text> banned
        </Text>
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemberRow
            member={item}
            onVerify={handleVerify}
            onBan={handleBan}
            onAdjustRep={handleAdjustRep}
            adminUid={user?.uid}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No members found</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    margin: SPACING.base,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.base,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldMuted },
  filterText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  filterTextActive: { color: COLORS.gold },
  statsBar: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  statsText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  list: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.xxxl },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  memberName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semiBold },
  verifiedBadge: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannedBadge: {
    backgroundColor: 'rgba(255,68,68,0.15)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  bannedText: { color: COLORS.adminRed, fontSize: 8, fontWeight: '800' },
  memberEmail: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  duesStatus: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  memberActions: { flexDirection: 'row', gap: SPACING.xs },
  verifyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZE.base, marginTop: SPACING.md },
});

export default MemberManagementScreen;
