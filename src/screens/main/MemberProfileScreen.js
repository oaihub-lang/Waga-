import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import ScreenHeader from '../../components/common/ScreenHeader';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getUserProfile, vouchVendor } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const MemberProfileScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { memberId } = route.params || {};
  const { user, isVerified } = useAuth();
  const { showToast } = useApp();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (memberId) {
      getUserProfile(memberId).then((data) => {
        setMember(data);
        setLoading(false);
      });
    }
  }, [memberId]);

  const handleVouch = async () => {
    if (!isVerified) {
      showToast('You must be Verified to vouch for members.', 'warning');
      return;
    }
    try {
      await vouchVendor(memberId, user.uid, memberId);
      showToast(`Vouched for ${member?.displayName}!`, 'success');
    } catch {
      showToast('Failed to vouch. Try again.', 'error');
    }
  };

  if (loading || !member) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Member Profile" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Member Profile" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1A1200', COLORS.background]} style={styles.hero}>
          <Avatar
            uri={member.photoURL}
            name={member.displayName}
            size="xl"
            isVerified={member.isVerified}
            isAdmin={member.isAdmin}
          />
          <Text style={styles.name}>{member.displayName}</Text>
          {member.isVerified && <Badge.Verified style={{ marginTop: SPACING.xs }} />}
          {member.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color={COLORS.textMuted} />
              <Text style={styles.location}>{member.location}</Text>
            </View>
          )}
          {member.bio && <Text style={styles.bio}>{member.bio}</Text>}
        </LinearGradient>

        <View style={styles.repSection}>
          <StarRating score={member.reputationScore || 0} size={18} showLabel showScore />
        </View>

        {member.handwork && (
          <View style={styles.infoCard}>
            <Ionicons name="briefcase" size={18} color={COLORS.gold} />
            <View>
              <Text style={styles.infoLabel}>Handwork</Text>
              <Text style={styles.infoValue}>{member.handwork}</Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Button title="VOUCH FOR MEMBER" onPress={handleVouch} variant="gold" size="md" />
          <Button title="SEND MESSAGE" onPress={() => {}} variant="outline" size="md" style={{ marginTop: SPACING.sm }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textMuted },
  hero: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.xs },
  location: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  bio: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  repSection: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginHorizontal: SPACING.base,
  },
  infoCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
    margin: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  infoLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  infoValue: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '500' },
  actions: { padding: SPACING.xl },
});

export default MemberProfileScreen;
