import React, { useState, useEffect } from 'react';
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
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, CARNIVAL_EVENT } from '../../constants/theme';
import ScreenHeader from '../../components/common/ScreenHeader';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { rsvpEvent, getEventRsvps } from '../../services/firebase';

const EVENT_ID = 'carnival_2024';
const EVENT_DATE = new Date('2024-12-14T18:00:00');

const getCountdown = () => {
  const now = new Date();
  const diff = EVENT_DATE - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, passed: false };
};

// Mock attendees
const MOCK_ATTENDEES = [
  { uid: '1', name: 'Chidi O.', status: 'attending', location: 'Lagos' },
  { uid: '2', name: 'Ngozi A.', status: 'attending', location: 'London, UK' },
  { uid: '3', name: 'Emeka I.', status: 'maybe', location: 'Abuja' },
  { uid: '4', name: 'Adaeze C.', status: 'attending', location: 'Houston, US' },
  { uid: '5', name: 'Kelechi N.', status: 'attending', location: 'Enugu' },
];

const MOCK_ROOMMATES = [
  { uid: '2', name: 'Ngozi A.', from: 'London, UK', hotelPref: 'Presidential Suites', gender: 'F', seeking: 'F roommate' },
  { uid: '4', name: 'Adaeze C.', from: 'Houston, US', hotelPref: 'Any', gender: 'F', seeking: 'F/M pair ok' },
];

const CarnivalHubScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, profile, isVerified } = useAuth();
  const { showToast } = useApp();

  const [countdown, setCountdown] = useState(getCountdown());
  const [myRsvp, setMyRsvp] = useState(null);
  const [attendees, setAttendees] = useState(MOCK_ATTENDEES);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'rsvp' | 'diaspora' | 'roommates'
  const [submittingRsvp, setSubmittingRsvp] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRsvp = async (status) => {
    if (!isVerified) {
      showToast('Only Verified members can RSVP to VIP events.', 'warning');
      return;
    }
    setSubmittingRsvp(true);
    try {
      await rsvpEvent(EVENT_ID, user.uid, status);
      setMyRsvp(status);
      showToast(
        status === 'attending' ? '🎉 You\'re going to Carnival 2024!' :
        status === 'maybe' ? 'RSVP saved as Maybe.' :
        'RSVP updated.',
        'success'
      );
    } catch {
      showToast('RSVP failed', 'error');
    } finally {
      setSubmittingRsvp(false);
    }
  };

  const attendingCount = attendees.filter((a) => a.status === 'attending').length;
  const diasporaCount = attendees.filter((a) => a.location?.includes(',') || a.location?.toLowerCase().includes('uk') || a.location?.toLowerCase().includes('us')).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Carnival Hub"
        subtitle="Dec 14th · Villa Toscana, Enugu"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <LinearGradient
          colors={['#1A1200', '#0A0A0A']}
          style={styles.heroBanner}
        >
          <View style={styles.eventBadge}>
            <Text style={styles.eventBadgeText}>OPP LIFESTYLE CARNIVAL 2024</Text>
          </View>

          <Text style={styles.heroTitle}>Oringo Must Continue</Text>
          <Text style={styles.heroDate}>December 14th, 2024</Text>
          <Text style={styles.heroVenue}>Villa Toscana, Enugu</Text>

          {/* Countdown */}
          {!countdown.passed ? (
            <View style={styles.countdown}>
              {[
                { label: 'DAYS', value: countdown.days },
                { label: 'HRS', value: countdown.hours },
                { label: 'MIN', value: countdown.minutes },
                { label: 'SEC', value: countdown.seconds },
              ].map((unit, i) => (
                <React.Fragment key={unit.label}>
                  <View style={styles.countdownUnit}>
                    <Text style={styles.countdownValue}>
                      {String(unit.value).padStart(2, '0')}
                    </Text>
                    <Text style={styles.countdownLabel}>{unit.label}</Text>
                  </View>
                  {i < 3 && <Text style={styles.countdownSep}>:</Text>}
                </React.Fragment>
              ))}
            </View>
          ) : (
            <View style={styles.eventPassedBadge}>
              <Text style={styles.eventPassedText}>Event has passed — Watch out for 2025! 🎉</Text>
            </View>
          )}

          {/* Dress code */}
          <View style={styles.dressCode}>
            <Ionicons name="shirt" size={14} color={COLORS.gold} />
            <Text style={styles.dressCodeText}>Dress Code: All White + Gold</Text>
          </View>

          {/* Stats */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{attendingCount}</Text>
              <Text style={styles.heroStatLabel}>Attending</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{diasporaCount}</Text>
              <Text style={styles.heroStatLabel}>Diaspora</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>₦15k</Text>
              <Text style={styles.heroStatLabel}>Ticket</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[
            { key: 'info', label: 'Event Info', icon: 'information-circle' },
            { key: 'rsvp', label: 'RSVP', icon: 'calendar' },
            { key: 'diaspora', label: 'Coming Home', icon: 'airplane' },
            { key: 'roommates', label: 'Roommates', icon: 'home' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={14}
                color={activeTab === tab.key ? COLORS.gold : COLORS.textMuted}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Event Info Tab */}
        {activeTab === 'info' && (
          <View style={styles.tabContent}>
            {[
              { icon: 'calendar', label: 'Date', value: 'December 14th, 2024 · 6:00 PM' },
              { icon: 'location', label: 'Venue', value: 'Villa Toscana, Enugu State, Nigeria' },
              { icon: 'cash', label: 'Ticket Price', value: '₦15,000 per person' },
              { icon: 'shirt', label: 'Dress Code', value: 'All White + Gold Accessories' },
              { icon: 'musical-notes', label: 'Entertainment', value: 'Live Band · DJ · Awards' },
            ].map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name={item.icon} size={18} color={COLORS.gold} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}

            <Button
              title="CONTRIBUTE TO CARNIVAL FUND"
              onPress={() => navigation.navigate('DuesPayment')}
              variant="gold"
              size="lg"
              style={{ marginTop: SPACING.xl }}
            />
          </View>
        )}

        {/* RSVP Tab */}
        {activeTab === 'rsvp' && (
          <View style={styles.tabContent}>
            {!isVerified ? (
              <View style={styles.lockedBanner}>
                <Ionicons name="lock-closed" size={20} color={COLORS.gold} />
                <Text style={styles.lockedText}>
                  VIP Event RSVP is exclusive to Verified members.
                </Text>
              </View>
            ) : (
              <View style={styles.rsvpSection}>
                <Text style={styles.rsvpQuestion}>Will you be attending?</Text>
                <View style={styles.rsvpBtns}>
                  {[
                    { status: 'attending', label: '🎉 YES, I\'M GOING!', active: myRsvp === 'attending' },
                    { status: 'maybe', label: '🤔 MAYBE', active: myRsvp === 'maybe' },
                    { status: 'not_attending', label: '😔 CAN\'T MAKE IT', active: myRsvp === 'not_attending' },
                  ].map((btn) => (
                    <TouchableOpacity
                      key={btn.status}
                      style={[styles.rsvpBtn, btn.active && styles.rsvpBtnActive]}
                      onPress={() => handleRsvp(btn.status)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.rsvpBtnText, btn.active && styles.rsvpBtnTextActive]}>
                        {btn.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Attendee list */}
            <Text style={styles.sectionTitle}>RSVP LIST ({attendees.length})</Text>
            {attendees.map((a) => (
              <View key={a.uid} style={styles.attendeeRow}>
                <Avatar name={a.name} size="sm" />
                <View style={styles.attendeeInfo}>
                  <Text style={styles.attendeeName}>{a.name}</Text>
                  <Text style={styles.attendeeLocation}>{a.location}</Text>
                </View>
                <View style={[
                  styles.rsvpStatusBadge,
                  a.status === 'attending' && styles.rsvpGreen,
                  a.status === 'maybe' && styles.rsvpYellow,
                ]}>
                  <Text style={[
                    styles.rsvpStatusText,
                    a.status === 'attending' && { color: COLORS.green },
                    a.status === 'maybe' && { color: COLORS.warning },
                  ]}>
                    {a.status === 'attending' ? 'Going' : a.status === 'maybe' ? 'Maybe' : 'No'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Diaspora Coming Home */}
        {activeTab === 'diaspora' && (
          <View style={styles.tabContent}>
            <LinearGradient
              colors={[COLORS.gold + '15', 'transparent']}
              style={styles.diasporaBanner}
            >
              <Text style={styles.diasporaTitle}>✈️ Coming Home</Text>
              <Text style={styles.diasporaSubtitle}>
                OPP diaspora members flying in for the Carnival. Connect with members traveling from abroad.
              </Text>
            </LinearGradient>

            <Text style={styles.sectionTitle}>DIASPORA MEMBERS COMING HOME</Text>
            {attendees.filter((a) => a.location?.includes(',') || a.location?.toLowerCase().includes('uk') || a.location?.toLowerCase().includes('us')).map((member) => (
              <View key={member.uid} style={styles.diasporaCard}>
                <Avatar name={member.name} size="md" />
                <View style={styles.diasporaInfo}>
                  <Text style={styles.diasporaName}>{member.name}</Text>
                  <View style={styles.diasporaFrom}>
                    <Ionicons name="airplane" size={12} color={COLORS.gold} />
                    <Text style={styles.diasporaFromText}>Flying from {member.location}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.connectBtn} activeOpacity={0.7}>
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Roommate Finder */}
        {activeTab === 'roommates' && (
          <View style={styles.tabContent}>
            <View style={styles.roommateHeader}>
              <Text style={styles.roommateTitle}>Hotel Roommate Finder</Text>
              <Text style={styles.roommateSubtitle}>
                Find a roommate to share hotel costs for the Carnival weekend.
              </Text>
            </View>

            <Button
              title="POST ROOMMATE REQUEST"
              onPress={() => showToast('Roommate posting coming soon!', 'info')}
              variant="outline"
              size="md"
              style={{ marginBottom: SPACING.base }}
            />

            <Text style={styles.sectionTitle}>LOOKING FOR ROOMMATES</Text>
            {MOCK_ROOMMATES.map((r) => (
              <View key={r.uid} style={styles.roommateCard}>
                <Avatar name={r.name} size="md" />
                <View style={styles.roommateInfo}>
                  <Text style={styles.roommateName}>{r.name}</Text>
                  <View style={styles.roommateDetails}>
                    <Ionicons name="location" size={11} color={COLORS.textMuted} />
                    <Text style={styles.roommateDetailText}>From {r.from}</Text>
                  </View>
                  <View style={styles.roommateDetails}>
                    <Ionicons name="home" size={11} color={COLORS.textMuted} />
                    <Text style={styles.roommateDetailText}>{r.hotelPref}</Text>
                  </View>
                  <View style={styles.seekingBadge}>
                    <Text style={styles.seekingText}>{r.seeking}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.connectBtn} activeOpacity={0.7}>
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroBanner: { padding: SPACING.xl, alignItems: 'center' },
  eventBadge: {
    borderWidth: 1,
    borderColor: COLORS.gold + '50',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginBottom: SPACING.md,
  },
  eventBadgeText: { color: COLORS.gold + '90', fontSize: 9, fontWeight: FONT_WEIGHT.black, letterSpacing: 3 },
  heroTitle: { color: COLORS.gold, fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.black, letterSpacing: 2 },
  heroDate: { color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semiBold, marginTop: SPACING.xs },
  heroVenue: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginBottom: SPACING.xl },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  countdownUnit: { alignItems: 'center' },
  countdownValue: {
    color: COLORS.gold,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.black,
    minWidth: 44,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  countdownLabel: { color: COLORS.textMuted, fontSize: 9, letterSpacing: 1 },
  countdownSep: { color: COLORS.gold, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.black, marginBottom: 10 },
  eventPassedBadge: {
    backgroundColor: COLORS.greenMuted,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  eventPassedText: { color: COLORS.green, fontSize: FONT_SIZE.sm, textAlign: 'center' },
  dressCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.goldMuted,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginBottom: SPACING.base,
  },
  dressCodeText: { color: COLORS.gold, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  heroStats: {
    flexDirection: 'row',
    gap: SPACING.xl,
    alignItems: 'center',
  },
  heroStat: { alignItems: 'center' },
  heroStatValue: { color: COLORS.textPrimary, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.black },
  heroStatLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  heroStatDivider: { width: 1, height: 32, backgroundColor: COLORS.divider },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingVertical: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  tabActive: { backgroundColor: COLORS.goldMuted },
  tabText: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600', letterSpacing: 0.3 },
  tabTextActive: { color: COLORS.gold },
  tabContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  infoValue: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  lockedBanner: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.goldMuted,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  lockedText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, flex: 1 },
  rsvpSection: { marginBottom: SPACING.xl },
  rsvpQuestion: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  rsvpBtns: { gap: SPACING.sm },
  rsvpBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    alignItems: 'center',
  },
  rsvpBtnActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldMuted },
  rsvpBtnText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.base, fontWeight: '600' },
  rsvpBtnTextActive: { color: COLORS.gold },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 2,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  attendeeInfo: { flex: 1 },
  attendeeName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  attendeeLocation: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  rsvpStatusBadge: {
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.surface,
  },
  rsvpGreen: { backgroundColor: COLORS.greenMuted },
  rsvpYellow: { backgroundColor: 'rgba(245,158,11,0.1)' },
  rsvpStatusText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '600' },
  diasporaBanner: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gold + '25',
    marginBottom: SPACING.base,
  },
  diasporaTitle: { color: COLORS.gold, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.black, marginBottom: SPACING.sm },
  diasporaSubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, lineHeight: 18 },
  diasporaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  diasporaInfo: { flex: 1 },
  diasporaName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  diasporaFrom: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  diasporaFromText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  connectBtn: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  connectBtnText: { color: COLORS.gold, fontSize: FONT_SIZE.xs, fontWeight: '700' },
  roommateHeader: { marginBottom: SPACING.base },
  roommateTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold },
  roommateSubtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginTop: SPACING.xs, lineHeight: 18 },
  roommateCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  roommateInfo: { flex: 1 },
  roommateName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: 3 },
  roommateDetails: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  roommateDetailText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  seekingBadge: {
    backgroundColor: COLORS.goldMuted,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  seekingText: { color: COLORS.gold, fontSize: 9, fontWeight: '700' },
});

export default CarnivalHubScreen;
