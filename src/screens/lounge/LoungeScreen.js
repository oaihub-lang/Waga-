import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

// Mock room data — in prod these come from Agora.io room sessions in Firestore
const ROOMS = [
  {
    id: 'general',
    name: 'OPP General Assembly',
    description: 'Main community meeting room',
    participants: 12,
    maxParticipants: 120,
    isLive: true,
    isAdminStage: false,
    type: 'audio',
  },
  {
    id: 'business',
    name: 'Business Networking',
    description: 'Connect & collaborate',
    participants: 5,
    maxParticipants: 50,
    isLive: true,
    isAdminStage: false,
    type: 'audio',
  },
  {
    id: 'carnival',
    name: 'Carnival Planning',
    description: 'Dec 14th Villa Toscana event coordination',
    participants: 8,
    maxParticipants: 30,
    isLive: true,
    isAdminStage: true,
    type: 'video',
  },
];

const RoomCard = ({ room, onJoin, isAdmin }) => (
  <TouchableOpacity style={styles.roomCard} onPress={() => onJoin(room)} activeOpacity={0.8}>
    <View style={styles.roomHeader}>
      <View style={[styles.roomTypeIcon, room.type === 'video' && styles.roomTypeVideo]}>
        <Ionicons
          name={room.type === 'video' ? 'videocam' : 'mic'}
          size={20}
          color={room.type === 'video' ? COLORS.gold : COLORS.green}
        />
      </View>
      <View style={styles.roomInfo}>
        <View style={styles.roomTitleRow}>
          <Text style={styles.roomName}>{room.name}</Text>
          {room.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        <Text style={styles.roomDesc}>{room.description}</Text>
      </View>
    </View>

    <View style={styles.roomFooter}>
      <View style={styles.participantsRow}>
        <Ionicons name="people" size={14} color={COLORS.textMuted} />
        <Text style={styles.participantCount}>
          {room.participants}/{room.maxParticipants}
        </Text>
      </View>

      {room.isAdminStage && (
        <View style={styles.adminStageBadge}>
          <Ionicons name="shield" size={10} color={COLORS.gold} />
          <Text style={styles.adminStageText}>Admin Stage</Text>
        </View>
      )}

      <View style={styles.joinBtn}>
        <Ionicons name="enter" size={14} color={COLORS.green} />
        <Text style={styles.joinBtnText}>Join</Text>
      </View>
    </View>

    {/* Capacity bar */}
    <View style={styles.capacityBar}>
      <View
        style={[
          styles.capacityFill,
          {
            width: `${(room.participants / room.maxParticipants) * 100}%`,
            backgroundColor: room.participants > room.maxParticipants * 0.8 ? COLORS.warning : COLORS.green,
          },
        ]}
      />
    </View>
  </TouchableOpacity>
);

const LoungeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { profile, isAdmin } = useAuth();
  const [micMuted, setMicMuted] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);

  const handleJoinRoom = (room) => {
    // In production, this integrates with Agora.io SDK
    Alert.alert(
      `Join "${room.name}"?`,
      `This room supports up to ${room.maxParticipants} participants.\n${room.isAdminStage ? '\n⚠️ Admin Stage Controls Active — Mic may be muted by host.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join Room',
          onPress: () => setActiveRoom(room),
        },
      ]
    );
  };

  const handleAdminMuteAll = () => {
    if (!isAdmin) return;
    Alert.alert(
      'Mute All Mics',
      'This will silence all participant microphones. Use for formal OPP meetings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mute All', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Oringo Lounge</Text>
          <Text style={styles.subtitle}>Live Rooms · Up to 120 Members</Text>
        </View>
        <View style={styles.headerActions}>
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminBtn}
              onPress={handleAdminMuteAll}
              activeOpacity={0.7}
            >
              <Ionicons name="mic-off" size={18} color={COLORS.adminRed} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.ozzaBtn}
            onPress={() => navigation.navigate('OzzaRoom')}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed" size={16} color={COLORS.gold} />
            <Text style={styles.ozzaBtnText}>Ozza Room</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Active session banner */}
        {activeRoom && (
          <LinearGradient
            colors={[COLORS.green + '20', 'transparent']}
            style={styles.activeSessionBanner}
          >
            <View style={styles.activeSessionLeft}>
              <View style={styles.liveDotLarge} />
              <View>
                <Text style={styles.activeSessionTitle}>In Room: {activeRoom.name}</Text>
                <Text style={styles.activeSessionSubtitle}>
                  {activeRoom.participants} participants
                </Text>
              </View>
            </View>
            <View style={styles.activeSessionControls}>
              <TouchableOpacity
                style={[styles.controlBtn, !micMuted && styles.controlBtnActive]}
                onPress={() => setMicMuted(!micMuted)}
              >
                <Ionicons
                  name={micMuted ? 'mic-off' : 'mic'}
                  size={18}
                  color={micMuted ? COLORS.error : COLORS.green}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlBtn, styles.leaveBtn]}
                onPress={() => setActiveRoom(null)}
              >
                <Ionicons name="exit" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {/* Live Rooms */}
        <Text style={styles.sectionTitle}>LIVE ROOMS</Text>
        {ROOMS.map((room) => (
          <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} isAdmin={isAdmin} />
        ))}

        {/* Create room */}
        {isAdmin && (
          <TouchableOpacity style={styles.createRoomBtn} activeOpacity={0.8}>
            <LinearGradient
              colors={COLORS.gradientGold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createRoomGrad}
            >
              <Ionicons name="add-circle" size={20} color={COLORS.background} />
              <Text style={styles.createRoomText}>CREATE NEW ROOM</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Lounge info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Room Guidelines</Text>
          {[
            { icon: 'shield-checkmark', text: 'Respect all members during calls' },
            { icon: 'mic-off', text: 'Mute yourself when not speaking' },
            { icon: 'flag', text: 'Admins may activate stage controls during formal meetings' },
            { icon: 'lock-closed', text: 'Ozza Room content is strictly private and view-once' },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Ionicons name={item.icon} size={14} color={COLORS.gold} />
              <Text style={styles.infoText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  headerActions: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  adminBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderWidth: 1,
    borderColor: COLORS.adminRed + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ozzaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.goldMuted,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
  },
  ozzaBtnText: { color: COLORS.gold, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  content: { padding: SPACING.base },
  activeSessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.green + '30',
  },
  activeSessionLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  liveDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  activeSessionTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  activeSessionSubtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  activeSessionControls: { flexDirection: 'row', gap: SPACING.sm },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  controlBtnActive: { borderColor: COLORS.green, backgroundColor: COLORS.greenMuted },
  leaveBtn: { borderColor: COLORS.error + '40', backgroundColor: 'rgba(239,68,68,0.1)' },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  roomCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  roomHeader: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  roomTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.greenMuted,
    borderWidth: 1,
    borderColor: COLORS.green + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomTypeVideo: {
    backgroundColor: COLORS.goldMuted,
    borderColor: COLORS.gold + '30',
  },
  roomInfo: { flex: 1 },
  roomTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  roomName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.error,
  },
  liveText: { color: COLORS.error, fontSize: 9, fontWeight: FONT_WEIGHT.black, letterSpacing: 1 },
  roomDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  participantsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  participantCount: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  adminStageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.goldMuted,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminStageText: { color: COLORS.gold, fontSize: 9, fontWeight: '700' },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.green + '40',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  joinBtnText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  capacityBar: {
    height: 3,
    backgroundColor: COLORS.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityFill: { height: '100%', borderRadius: 2 },
  createRoomBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  createRoomGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
  },
  createRoomText: {
    color: COLORS.background,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 2,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.xl,
  },
  infoTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  infoText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, flex: 1, lineHeight: 16 },
});

export default LoungeScreen;
