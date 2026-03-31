import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import ScreenHeader from '../../components/common/ScreenHeader';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import Button from '../../components/common/Button';
import { getVendors, vouchVendor } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const VendorProfileScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { vendorId } = route.params || {};
  const { user, isVerified } = useAuth();
  const { showToast } = useApp();

  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    // In a real app, fetch by ID from Firestore
    loadVendor();
  }, [vendorId]);

  const loadVendor = async () => {
    try {
      const vendors = await getVendors();
      setVendor(vendors.find((v) => v.id === vendorId));
    } catch {}
  };

  const handleVouch = async () => {
    if (!isVerified) {
      showToast('Only Verified members can vouch.', 'warning');
      return;
    }
    try {
      await vouchVendor(vendorId, user.uid, vendor.ownerId);
      showToast('Vouched!', 'success');
      loadVendor();
    } catch {
      showToast('Failed to vouch', 'error');
    }
  };

  if (!vendor) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Vendor Profile" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const hasVouched = vendor.vouches?.includes(user?.uid);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Vendor Profile" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#1A1200', COLORS.background]} style={styles.hero}>
          <Avatar uri={vendor.photoURL} name={vendor.businessName} size="xl" isVerified={vendor.ownerVerified} />
          <Text style={styles.businessName}>{vendor.businessName}</Text>
          <Text style={styles.ownerName}>by {vendor.ownerName}</Text>
          <StarRating score={vendor.reputationScore || 0} size={16} showLabel />
        </LinearGradient>

        {/* Trust meter */}
        <View style={styles.trustCard}>
          <View style={styles.trustHeader}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.green} />
            <Text style={styles.trustTitle}>Trust Score</Text>
            <Text style={styles.trustScore}>{vendor.vouches?.length || 0} Vouches</Text>
          </View>
          <View style={styles.trustBar}>
            <View
              style={[
                styles.trustFill,
                { width: `${Math.min((vendor.vouches?.length || 0) * 10, 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* Description */}
        {vendor.description && (
          <View style={styles.descCard}>
            <Text style={styles.sectionLabel}>About</Text>
            <Text style={styles.description}>{vendor.description}</Text>
          </View>
        )}

        {/* Services */}
        {vendor.services?.length > 0 && (
          <View style={styles.descCard}>
            <Text style={styles.sectionLabel}>Services Offered</Text>
            {vendor.services.map((s, i) => (
              <View key={i} style={styles.serviceItem}>
                <Ionicons name="checkmark" size={14} color={COLORS.green} />
                <Text style={styles.serviceText}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionSection}>
          {vendor.contact && (
            <Button
              title="CONTACT VENDOR"
              onPress={() => Linking.openURL(`tel:${vendor.contact}`)}
              variant="gold"
              size="lg"
            />
          )}
          <Button
            title={hasVouched ? 'VOUCHED ✓' : 'VOUCH FOR THIS VENDOR'}
            onPress={handleVouch}
            variant={hasVouched ? 'ghost' : 'outline'}
            size="lg"
            style={{ marginTop: SPACING.sm }}
            disabled={hasVouched}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textMuted },
  hero: { alignItems: 'center', padding: SPACING.xl, gap: SPACING.sm },
  businessName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.black },
  ownerName: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  trustCard: {
    margin: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.green + '30',
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  trustTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600', flex: 1 },
  trustScore: { color: COLORS.green, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  trustBar: {
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trustFill: { height: '100%', backgroundColor: COLORS.green, borderRadius: 3 },
  descCard: {
    margin: SPACING.base,
    marginTop: 0,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  description: { color: COLORS.textSecondary, fontSize: FONT_SIZE.base, lineHeight: 22 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  serviceText: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm },
  actionSection: { padding: SPACING.xl },
});

export default VendorProfileScreen;
