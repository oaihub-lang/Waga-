import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getVendors, vouchVendor } from '../../services/firebase';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import Badge from '../../components/common/Badge';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'beauty', label: 'Beauty', icon: 'color-palette' },
  { key: 'food', label: 'Food', icon: 'restaurant' },
  { key: 'realestate', label: 'Real Estate', icon: 'home' },
  { key: 'tech', label: 'Tech', icon: 'laptop' },
  { key: 'fashion', label: 'Fashion', icon: 'shirt' },
  { key: 'finance', label: 'Finance', icon: 'trending-up' },
  { key: 'health', label: 'Health', icon: 'medical' },
];

const VendorCard = ({ vendor, onPress, onVouch, currentUid, isVerified }) => {
  const hasVouched = vendor.vouches?.includes(currentUid);

  return (
    <TouchableOpacity style={styles.vendorCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.vendorHeader}>
        <Avatar uri={vendor.photoURL} name={vendor.ownerName} size="md" isVerified={vendor.ownerVerified} />
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{vendor.businessName}</Text>
          <Text style={styles.vendorOwner}>{vendor.ownerName}</Text>
          <StarRating score={vendor.reputationScore || 0} size={12} />
        </View>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>
            {CATEGORIES.find((c) => c.key === vendor.category)?.label || vendor.category}
          </Text>
        </View>
      </View>

      {vendor.description && (
        <Text style={styles.vendorDesc} numberOfLines={2}>{vendor.description}</Text>
      )}

      <View style={styles.vendorFooter}>
        <View style={styles.vouchesRow}>
          <Ionicons name="thumbs-up" size={13} color={COLORS.gold} />
          <Text style={styles.vouchCount}>{vendor.vouches?.length || 0} vouches</Text>
        </View>

        {vendor.contact && (
          <View style={styles.contactRow}>
            <Ionicons name="call" size={12} color={COLORS.textMuted} />
            <Text style={styles.contactText}>{vendor.contact}</Text>
          </View>
        )}

        {isVerified && (
          <TouchableOpacity
            style={[styles.vouchBtn, hasVouched && styles.vouchBtnActive]}
            onPress={(e) => { e.stopPropagation(); onVouch(vendor); }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={hasVouched ? 'thumbs-up' : 'thumbs-up-outline'}
              size={13}
              color={hasVouched ? COLORS.background : COLORS.gold}
            />
            <Text style={[styles.vouchBtnText, hasVouched && styles.vouchBtnTextActive]}>
              {hasVouched ? 'Vouched' : 'Vouch'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const MarketplaceScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, profile, isVerified } = useAuth();
  const { showToast } = useApp();

  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, [activeCategory]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await getVendors(activeCategory === 'all' ? null : activeCategory);
      setVendors(data);
    } catch {
      showToast('Failed to load vendors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVouch = async (vendor) => {
    if (!isVerified) {
      showToast('Only Verified members can vouch.', 'warning');
      return;
    }
    try {
      await vouchVendor(vendor.id, user.uid, vendor.ownerId);
      showToast(`Vouched for ${vendor.businessName}!`, 'success');
      loadVendors();
    } catch {
      showToast('Vouch failed', 'error');
    }
  };

  const filteredVendors = vendors.filter((v) =>
    search.trim() === '' ||
    v.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    v.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
    v.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Business Hub</Text>
          <Text style={styles.subtitle}>OPP Member Marketplace</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('BettingCorner')}
          activeOpacity={0.7}
        >
          <Ionicons name="trophy-outline" size={20} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses, services..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.catChip, activeCategory === cat.key && styles.catChipActive]}
            onPress={() => setActiveCategory(cat.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={cat.icon}
              size={14}
              color={activeCategory === cat.key ? COLORS.gold : COLORS.textMuted}
            />
            <Text style={[styles.catLabel, activeCategory === cat.key && styles.catLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add listing CTA */}
      {isVerified && (
        <TouchableOpacity
          style={styles.addListingBanner}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.gold + '20', COLORS.green + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addListingGrad}
          >
            <Ionicons name="add-circle" size={22} color={COLORS.gold} />
            <View>
              <Text style={styles.addListingTitle}>List Your Handwork</Text>
              <Text style={styles.addListingSubtitle}>Add your business to the OPP marketplace</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gold} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Vendor listing */}
      <FlatList
        data={filteredVendors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VendorCard
            vendor={item}
            onPress={() => navigation.navigate('VendorProfile', { vendorId: item.id })}
            onVouch={handleVouch}
            currentUid={user?.uid}
            isVerified={isVerified}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptySubtitle}>
                {isVerified
                  ? 'Be the first to list your business!'
                  : 'Get Verified to list your business.'}
              </Text>
            </View>
          )
        }
      />
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.goldMuted,
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    margin: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.base,
    paddingVertical: 12,
  },
  categoriesRow: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  catChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldMuted,
  },
  catLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  catLabelActive: { color: COLORS.gold },
  addListingBanner: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  addListingGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
  },
  addListingTitle: { color: COLORS.gold, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  addListingSubtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  listContent: { padding: SPACING.base, gap: SPACING.md },
  vendorCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.base,
  },
  vendorHeader: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  vendorInfo: { flex: 1 },
  vendorName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  vendorOwner: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginBottom: 3 },
  categoryTag: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryTagText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  vendorDesc: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  vendorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  vouchesRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  vouchCount: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  contactText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  vouchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  vouchBtnActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  vouchBtnText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  vouchBtnTextActive: { color: COLORS.background },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyTitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.lg, fontWeight: '600', marginTop: SPACING.md },
  emptySubtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: SPACING.sm, textAlign: 'center' },
});

export default MarketplaceScreen;
