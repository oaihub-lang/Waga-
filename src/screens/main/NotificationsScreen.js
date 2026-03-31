import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import COLORS from '../../constants/colors';
import { FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS } from '../../constants/theme';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useApp } from '../../context/AppContext';

const NOTIF_ICONS = {
  match: { icon: 'heart', color: '#FF6B9D' },
  vouch: { icon: 'thumbs-up', color: COLORS.gold },
  verified: { icon: 'checkmark-circle', color: COLORS.green },
  dues: { icon: 'cash', color: COLORS.info },
  event: { icon: 'calendar', color: COLORS.warning },
  system: { icon: 'information-circle', color: COLORS.textSecondary },
};

const NotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { notifications, markAllRead } = useApp();

  const iconConfig = (type) => NOTIF_ICONS[type] || NOTIF_ICONS.system;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
            <Text style={styles.markRead}>Mark all read</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const ic = iconConfig(item.type);
          return (
            <TouchableOpacity
              style={[styles.notifItem, !item.read && styles.notifUnread]}
              activeOpacity={0.7}
            >
              <View style={[styles.notifIcon, { backgroundColor: ic.color + '20' }]}>
                <Ionicons name={ic.icon} size={20} color={ic.color} />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title || 'OPP Update'}</Text>
                <Text style={styles.notifBody}>{item.message}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  markRead: { color: COLORS.gold, fontSize: FONT_SIZE.sm },
  list: { padding: SPACING.base, gap: SPACING.sm },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  notifUnread: { borderColor: COLORS.gold + '40', backgroundColor: COLORS.goldMuted },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: { flex: 1 },
  notifTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semiBold },
  notifBody: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, marginTop: 2, lineHeight: 16 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    marginTop: 4,
  },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZE.base, marginTop: SPACING.md },
});

export default NotificationsScreen;
