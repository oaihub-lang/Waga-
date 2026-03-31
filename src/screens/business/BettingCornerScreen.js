import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import ScreenHeader from '../../components/common/ScreenHeader';
import Avatar from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { subscribeToPosts, createPost } from '../../services/firebase';

// Detect SportyBet / Bet9ja codes (uppercase alphanumeric 6-14 chars)
const detectBetCodes = (text) => {
  const matches = text.match(/\b[A-Z0-9]{6,14}\b/g);
  return matches ? [...new Set(matches)] : [];
};

const WINNING_WALL_MOCK = []; // will come from Firebase in production

const BettingCornerScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const { showToast } = useApp();

  const [pastedCode, setPastedCode] = useState('');
  const [detectedCodes, setDetectedCodes] = useState([]);
  const [postText, setPostText] = useState('');
  const [winningSlip, setWinningSlip] = useState('');
  const [activeTab, setActiveTab] = useState('detect'); // 'detect' | 'wall'
  const [posts, setPosts] = useState(WINNING_WALL_MOCK);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setPastedCode(text);
      const codes = detectBetCodes(text.toUpperCase());
      setDetectedCodes(codes);
      if (codes.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(`${codes.length} bet code${codes.length > 1 ? 's' : ''} detected!`, 'success');
      } else {
        showToast('No bet codes detected in clipboard.', 'info');
      }
    }
  };

  const handleTextChange = (text) => {
    setPastedCode(text);
    const codes = detectBetCodes(text.toUpperCase());
    setDetectedCodes(codes);
  };

  const copyCode = async (code) => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`${code} copied!`, 'success');
  };

  const handleShareSlip = async () => {
    if (!postText.trim()) return;
    try {
      await createPost({
        content: postText,
        authorId: user.uid,
        authorName: profile?.displayName || 'Member',
        authorPhoto: profile?.photoURL || null,
        authorVerified: profile?.isVerified,
        isBetPost: detectedCodes.length > 0,
        isWinningSlip: true,
      });
      setPostText('');
      showToast('Winning slip shared on the Wall!', 'success');
    } catch {
      showToast('Failed to share', 'error');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Betting Corner"
        subtitle="SportyBet · Bet9ja · Winning Wall"
        onBack={() => navigation.goBack()}
      />

      {/* Tab selector */}
      <View style={styles.tabs}>
        {['detect', 'wall'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab === 'detect' ? 'trophy' : 'checkmark-done-circle'}
              size={15}
              color={activeTab === tab ? COLORS.gold : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'detect' ? 'Code Detector' : 'Winning Wall'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeTab === 'detect' && (
          <>
            {/* Paste detector */}
            <LinearGradient
              colors={[COLORS.gold + '15', 'transparent']}
              style={styles.detectorCard}
            >
              <View style={styles.detectorHeader}>
                <Ionicons name="search" size={20} color={COLORS.gold} />
                <Text style={styles.detectorTitle}>Bet Code Detector</Text>
              </View>
              <Text style={styles.detectorSubtitle}>
                Paste a message containing SportyBet or Bet9ja codes and we'll extract them automatically.
              </Text>

              <TextInput
                style={styles.pasteInput}
                placeholder="Paste your message here or type a code..."
                placeholderTextColor={COLORS.textMuted}
                value={pastedCode}
                onChangeText={handleTextChange}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.pasteBtn} onPress={handlePaste} activeOpacity={0.8}>
                <LinearGradient
                  colors={COLORS.gradientGold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.pasteBtnGrad}
                >
                  <Ionicons name="clipboard" size={16} color={COLORS.background} />
                  <Text style={styles.pasteBtnText}>PASTE FROM CLIPBOARD</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>

            {/* Detected codes */}
            {detectedCodes.length > 0 && (
              <View style={styles.codesSection}>
                <Text style={styles.sectionLabel}>
                  {detectedCodes.length} CODE{detectedCodes.length > 1 ? 'S' : ''} DETECTED
                </Text>
                {detectedCodes.map((code, i) => (
                  <View key={i} style={styles.codeCard}>
                    <View style={styles.codeLeft}>
                      <Ionicons name="barcode" size={18} color={COLORS.gold} />
                      <Text style={styles.codeText}>{code}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.copyCodeBtn}
                      onPress={() => copyCode(code)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient colors={COLORS.gradientGold} style={styles.copyCodeGrad}>
                        <Ionicons name="copy" size={14} color={COLORS.background} />
                        <Text style={styles.copyCodeText}>COPY CODE</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Share slip section */}
            <View style={styles.shareSection}>
              <Text style={styles.sectionLabel}>SHARE A WINNING SLIP</Text>
              <TextInput
                style={styles.slipInput}
                placeholder="Describe your win or paste slip details..."
                placeholderTextColor={COLORS.textMuted}
                value={postText}
                onChangeText={setPostText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.shareBtn, !postText.trim() && styles.shareBtnDisabled]}
                onPress={handleShareSlip}
                disabled={!postText.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                <Text style={styles.shareBtnText}>POST TO WINNING WALL</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab === 'wall' && (
          <View>
            <View style={styles.wallHeader}>
              <Ionicons name="trophy" size={24} color={COLORS.gold} />
              <Text style={styles.wallTitle}>OPP Winning Wall</Text>
              <Text style={styles.wallSubtitle}>Green-ticked slips from our members 🏆</Text>
            </View>

            {posts.length === 0 ? (
              <View style={styles.emptyWall}>
                <Text style={styles.emptyWallEmoji}>🏆</Text>
                <Text style={styles.emptyWallTitle}>No wins posted yet</Text>
                <Text style={styles.emptyWallSubtitle}>
                  Share your first winning slip to kick off the wall!
                </Text>
              </View>
            ) : (
              posts.map((post) => (
                <View key={post.id} style={styles.winCard}>
                  <View style={styles.winHeader}>
                    <Avatar uri={post.authorPhoto} name={post.authorName} size="sm" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.winAuthor}>{post.authorName}</Text>
                      <Text style={styles.winTime}>Just now</Text>
                    </View>
                    <View style={styles.winBadge}>
                      <Text style={styles.winBadgeText}>✅ WIN</Text>
                    </View>
                  </View>
                  <Text style={styles.winContent}>{post.content}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabs: {
    flexDirection: 'row',
    margin: SPACING.base,
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
  content: { padding: SPACING.base, paddingTop: 0 },
  detectorCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    marginBottom: SPACING.base,
  },
  detectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  detectorTitle: { color: COLORS.gold, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold },
  detectorSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 18,
    marginBottom: SPACING.base,
  },
  pasteInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.sm,
    padding: SPACING.md,
    minHeight: 80,
    marginBottom: SPACING.md,
  },
  pasteBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  pasteBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 13,
  },
  pasteBtnText: {
    color: COLORS.background,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 2,
  },
  codesSection: { marginBottom: SPACING.base },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.gold + '25',
    marginBottom: SPACING.sm,
  },
  codeLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  codeText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  copyCodeBtn: { borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  copyCodeGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  copyCodeText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 1.5,
  },
  shareSection: { marginBottom: SPACING.xl },
  slipInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.sm,
    padding: SPACING.md,
    minHeight: 70,
    marginBottom: SPACING.md,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.greenMuted,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.green + '40',
  },
  shareBtnDisabled: { opacity: 0.4 },
  shareBtnText: { color: COLORS.green, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.black, letterSpacing: 1.5 },
  wallHeader: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.xs },
  wallTitle: { color: COLORS.gold, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.black },
  wallSubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  emptyWall: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyWallEmoji: { fontSize: 48 },
  emptyWallTitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.lg, fontWeight: '600', marginTop: SPACING.md },
  emptyWallSubtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, textAlign: 'center', marginTop: SPACING.sm },
  winCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.green + '30',
    marginBottom: SPACING.sm,
  },
  winHeader: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  winAuthor: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  winTime: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  winBadge: {
    backgroundColor: COLORS.greenMuted,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.green + '40',
  },
  winBadgeText: { color: COLORS.green, fontSize: 10, fontWeight: FONT_WEIGHT.black, letterSpacing: 1 },
  winContent: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, lineHeight: 18 },
});

export default BettingCornerScreen;
