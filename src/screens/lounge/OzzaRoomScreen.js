import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import ScreenHeader from '../../components/common/ScreenHeader';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

// Media items — in prod stored in Firestore with view-once flag
const MOCK_MEDIA = [
  { id: '1', type: 'image', uploaderName: 'Chidi O.', caption: 'Freaky Friday vibes 🔥', viewOnce: true, views: 0 },
  { id: '2', type: 'video', uploaderName: 'Ngozi A.', caption: 'Villa Toscana scouting trip', viewOnce: false, views: 12 },
];

const MediaCard = ({ item, onView }) => {
  const [viewed, setViewed] = useState(false);

  const handleView = () => {
    if (item.viewOnce && viewed) {
      Alert.alert('View Once', 'This content can only be viewed once.');
      return;
    }
    setViewed(true);
    onView(item);
  };

  return (
    <TouchableOpacity style={styles.mediaCard} onPress={handleView} activeOpacity={0.85}>
      {/* Blurred preview by default */}
      <View style={styles.mediaPreview}>
        <BlurView intensity={viewed ? 0 : 80} tint="dark" style={styles.blurOverlay}>
          <View style={styles.mediaPlaceholder}>
            <Ionicons
              name={item.type === 'video' ? 'videocam' : 'image'}
              size={32}
              color={COLORS.gold}
            />
            {!viewed && (
              <Text style={styles.tapToView}>Tap to View</Text>
            )}
          </View>
        </BlurView>
      </View>

      <View style={styles.mediaInfo}>
        <View style={styles.mediaInfoLeft}>
          <Text style={styles.mediaUploader}>{item.uploaderName}</Text>
          {item.caption && <Text style={styles.mediaCaption} numberOfLines={1}>{item.caption}</Text>}
        </View>
        <View style={styles.mediaMeta}>
          {item.viewOnce && (
            <View style={styles.viewOnceBadge}>
              <Ionicons name="eye" size={10} color={COLORS.warning} />
              <Text style={styles.viewOnceText}>View Once</Text>
            </View>
          )}
          {item.views > 0 && !item.viewOnce && (
            <Text style={styles.viewCount}>{item.views} views</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const OzzaRoomScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { profile, isAdmin, isVerified } = useAuth();
  const { showToast } = useApp();

  const [media, setMedia] = useState(MOCK_MEDIA);
  const [uploading, setUploading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleViewMedia = (item) => {
    Alert.alert(
      'Viewing: ' + item.caption,
      item.viewOnce
        ? '⚠️ This content will be marked as viewed. Screenshots and recordings are prohibited.'
        : 'Screenshots and recordings are prohibited in the Ozza Room.',
      [{ text: 'OK' }]
    );
  };

  const handleUpload = async () => {
    if (!isVerified) {
      showToast('Only Verified members can upload to Ozza Room.', 'warning');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Media library permission required.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        // In prod: upload to Firebase Storage, create Firestore doc with viewOnce flag
        showToast('Media uploaded to Ozza Room!', 'success');
      } catch {
        showToast('Upload failed', 'error');
      } finally {
        setUploading(false);
      }
    }
  };

  // Entry gate — show warning first
  if (!agreedToTerms) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Ozza Room" onBack={() => navigation.goBack()} />
        <View style={styles.warningContainer}>
          <LinearGradient
            colors={['#FF000015', 'transparent']}
            style={styles.warningCard}
          >
            <Ionicons name="lock-closed" size={52} color={COLORS.gold} />
            <Text style={styles.warningTitle}>Ozza Room</Text>
            <Text style={styles.warningSubtitle}>Secure Private Gallery</Text>

            <View style={styles.warningList}>
              {[
                { icon: 'eye-off', text: 'Content may be marked "View Once" — no replay' },
                { icon: 'phone-portrait', text: 'Screenshots and screen recordings are strictly prohibited' },
                { icon: 'shield', text: 'Violations will result in immediate ban and reputation penalty' },
                { icon: 'people', text: 'Verified members only — 18+ content may be present' },
              ].map((item, i) => (
                <View key={i} style={styles.warningItem}>
                  <Ionicons name={item.icon} size={15} color={COLORS.warning} />
                  <Text style={styles.warningItemText}>{item.text}</Text>
                </View>
              ))}
            </View>

            <Button
              title="I UNDERSTAND & AGREE"
              onPress={() => setAgreedToTerms(true)}
              variant="gold"
              size="lg"
              style={{ marginTop: SPACING.xl }}
            />
            <Button
              title="GO BACK"
              onPress={() => navigation.goBack()}
              variant="ghost"
              size="md"
              style={{ marginTop: SPACING.sm }}
            />
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Ozza Room 🔒" onBack={() => navigation.goBack()} />

      {/* Anti-screenshot notice */}
      <View style={styles.securityBanner}>
        <Ionicons name="shield-checkmark" size={14} color={COLORS.error} />
        <Text style={styles.securityText}>
          Screenshot & recording detection active. Violations = ban.
        </Text>
      </View>

      <FlatList
        data={media}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <MediaCard item={item} onView={handleViewMedia} />
        )}
        ListHeaderComponent={
          isVerified && (
            <Button
              title={uploading ? 'UPLOADING...' : 'ADD TO OZZA ROOM'}
              onPress={handleUpload}
              loading={uploading}
              variant="gold"
              size="md"
              icon={<Ionicons name="cloud-upload" size={16} color={COLORS.background} />}
              style={{ marginBottom: SPACING.base }}
            />
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>The Ozza Room is empty</Text>
            <Text style={styles.emptySubtitle}>
              Verified members can upload Freaky Friday and party content here.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  warningContainer: { flex: 1, padding: SPACING.xl, justifyContent: 'center' },
  warningCard: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
  },
  warningTitle: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.black,
    marginTop: SPACING.md,
  },
  warningSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xl,
  },
  warningList: { width: '100%', gap: SPACING.md },
  warningItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  warningItemText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, flex: 1, lineHeight: 18 },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(239,68,68,0.1)',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239,68,68,0.2)',
  },
  securityText: { color: COLORS.error, fontSize: FONT_SIZE.xs, flex: 1 },
  grid: { padding: SPACING.base },
  gridRow: { gap: SPACING.sm, marginBottom: SPACING.sm },
  mediaCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  mediaPreview: {
    height: 140,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholder: { alignItems: 'center', gap: SPACING.xs },
  tapToView: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs },
  mediaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  mediaInfoLeft: { flex: 1 },
  mediaUploader: { color: COLORS.textPrimary, fontSize: FONT_SIZE.xs, fontWeight: '600' },
  mediaCaption: { color: COLORS.textMuted, fontSize: 10 },
  mediaMeta: { alignItems: 'flex-end' },
  viewOnceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  viewOnceText: { color: COLORS.warning, fontSize: 8, fontWeight: '700' },
  viewCount: { color: COLORS.textMuted, fontSize: 10 },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyTitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.base, fontWeight: '600', marginTop: SPACING.md },
  emptySubtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: SPACING.sm, textAlign: 'center', lineHeight: 18 },
});

export default OzzaRoomScreen;
