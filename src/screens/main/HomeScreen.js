import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { subscribeToPosts, createPost, likePost, unlikePost } from '../../services/firebase';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

const BETTING_REGEX = /\b[A-Z0-9]{6,12}\b/g;

const PostCard = ({ post, currentUid, onLike, onUnlike, onCopyCode }) => {
  const isLiked = post.likes?.includes(currentUid);
  const hasBetCode = BETTING_REGEX.test(post.content || '');
  const betCodes = hasBetCode ? (post.content?.match(BETTING_REGEX) || []) : [];

  return (
    <View style={styles.postCard}>
      {/* Author row */}
      <View style={styles.postHeader}>
        <Avatar
          uri={post.authorPhoto}
          name={post.authorName}
          size="sm"
          isVerified={post.authorVerified}
        />
        <View style={styles.postAuthorInfo}>
          <View style={styles.postAuthorRow}>
            <Text style={styles.postAuthorName}>{post.authorName || 'Member'}</Text>
            {post.authorVerified && <Badge.Verified />}
          </View>
          <Text style={styles.postTime}>
            {post.createdAt?.seconds
              ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-NG', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Just now'}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {post.content && (
        <Text style={styles.postContent}>{post.content}</Text>
      )}

      {/* Media */}
      {post.mediaUrl && (
        <Image source={{ uri: post.mediaUrl }} style={styles.postMedia} resizeMode="cover" />
      )}

      {/* Betting code detector */}
      {post.isBetPost && betCodes.length > 0 && (
        <View style={styles.betSection}>
          <View style={styles.betHeader}>
            <Ionicons name="trophy" size={14} color={COLORS.gold} />
            <Text style={styles.betHeaderText}>Bet Code Detected</Text>
          </View>
          {betCodes.slice(0, 3).map((code, i) => (
            <TouchableOpacity
              key={i}
              style={styles.betCodeRow}
              onPress={() => onCopyCode(code)}
              activeOpacity={0.7}
            >
              <Text style={styles.betCode}>{code}</Text>
              <View style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={12} color={COLORS.background} />
                <Text style={styles.copyBtnText}>COPY</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Winning slip */}
      {post.isWinningSlip && (
        <View style={styles.winningBadge}>
          <Text style={styles.winningEmoji}>✅</Text>
          <Text style={styles.winningText}>WINNING SLIP</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => isLiked ? onUnlike(post.id) : onLike(post.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? COLORS.error : COLORS.textSecondary}
          />
          <Text style={[styles.actionCount, isLiked && { color: COLORS.error }]}>
            {post.likes?.length || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={17} color={COLORS.textSecondary} />
          <Text style={styles.actionCount}>{post.comments || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, profile, isVerified } = useAuth();
  const { showToast } = useApp();

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'betting' | 'winning'

  useEffect(() => {
    const unsub = subscribeToPosts(setPosts);
    return unsub;
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const isBet = BETTING_REGEX.test(newPost);
      await createPost({
        content: newPost.trim(),
        authorId: user.uid,
        authorName: profile?.displayName || 'Member',
        authorPhoto: profile?.photoURL || null,
        authorVerified: isVerified,
        isBetPost: isBet,
        isWinningSlip: false,
      });
      setNewPost('');
      showToast('Posted!', 'success');
    } catch {
      showToast('Failed to post', 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await likePost(postId, user.uid);
  };

  const handleUnlike = async (postId) => {
    await unlikePost(postId, user.uid);
  };

  const handleCopyCode = async (code) => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`Code ${code} copied!`, 'success');
  };

  const filteredPosts = posts.filter((p) => {
    if (filter === 'betting') return p.isBetPost;
    if (filter === 'winning') return p.isWinningSlip;
    return true;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {profile?.displayName ? `Hey, ${profile.displayName.split(' ')[0]} 👑` : 'OPP Feed'}
          </Text>
          <Text style={styles.subGreeting}>Oringo Must Continue</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          {profile?.isAdmin && (
            <TouchableOpacity
              style={[styles.headerBtn, styles.adminBtn]}
              onPress={() => navigation.navigate('AdminDashboard')}
              activeOpacity={0.7}
            >
              <Ionicons name="shield" size={20} color={COLORS.adminRed} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Compose box */}
      <View style={styles.composeBox}>
        <Avatar uri={profile?.photoURL} name={profile?.displayName} size="sm" />
        <TextInput
          style={styles.composeInput}
          placeholder="Share something with OPP..."
          placeholderTextColor={COLORS.textMuted}
          value={newPost}
          onChangeText={setNewPost}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.postBtn, (!newPost.trim() || posting) && styles.postBtnDisabled]}
          onPress={handlePost}
          disabled={!newPost.trim() || posting}
          activeOpacity={0.8}
        >
          <LinearGradient colors={COLORS.gradientGold} style={styles.postBtnGrad}>
            <Ionicons name="send" size={16} color={COLORS.background} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filters}>
        {[
          { key: 'all', label: 'All Posts', icon: 'grid-outline' },
          { key: 'betting', label: 'Bet Codes', icon: 'trophy-outline' },
          { key: 'winning', label: 'Winning Wall', icon: 'checkmark-circle' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={f.icon}
              size={14}
              color={filter === f.key ? COLORS.gold : COLORS.textMuted}
            />
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posts Feed */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUid={user?.uid}
            onLike={handleLike}
            onUnlike={handleUnlike}
            onCopyCode={handleCopyCode}
          />
        )}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="flame-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to share something with OPP!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  greeting: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  subGreeting: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontStyle: 'italic',
  },
  headerRight: { flexDirection: 'row', gap: SPACING.sm },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBtn: {
    backgroundColor: 'rgba(255,68,68,0.15)',
    borderWidth: 1,
    borderColor: COLORS.adminRed + '50',
  },
  composeBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.base,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  composeInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.base,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  postBtn: { borderRadius: 20, overflow: 'hidden' },
  postBtnDisabled: { opacity: 0.4 },
  postBtnGrad: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterTabActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldMuted,
  },
  filterLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  filterLabelActive: { color: COLORS.gold },
  feedContent: { padding: SPACING.base, gap: SPACING.md },
  postCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.base,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  postAuthorInfo: { flex: 1 },
  postAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  postAuthorName: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  postTime: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 1 },
  moreBtn: { padding: 4 },
  postContent: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.base,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  postMedia: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  betSection: {
    backgroundColor: COLORS.goldMuted,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  betHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  betHeaderText: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  betCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  betCode: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  copyBtnText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 1,
  },
  winningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.greenMuted,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.green + '30',
    alignSelf: 'flex-start',
  },
  winningEmoji: { fontSize: 14 },
  winningText: {
    color: COLORS.green,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 2,
  },
  postActions: {
    flexDirection: 'row',
    gap: SPACING.base,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default HomeScreen;
