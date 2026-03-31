import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import COLORS from '../constants/colors';
import TabNavigator from './TabNavigator';

// Main Feature Screens
import VendorProfileScreen from '../screens/business/VendorProfileScreen';
import BettingCornerScreen from '../screens/business/BettingCornerScreen';
import MatchmakerScreen from '../screens/matchmaker/MatchmakerScreen';
import OzzaRoomScreen from '../screens/lounge/OzzaRoomScreen';
import DuesPaymentScreen from '../screens/financial/DuesPaymentScreen';
import CarnivalHubScreen from '../screens/events/CarnivalHubScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import MemberManagementScreen from '../screens/admin/MemberManagementScreen';
import LedgerScreen from '../screens/admin/LedgerScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import MemberProfileScreen from '../screens/main/MemberProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: COLORS.background },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Tabs" component={TabNavigator} />
    <Stack.Screen name="VendorProfile" component={VendorProfileScreen} />
    <Stack.Screen name="BettingCorner" component={BettingCornerScreen} />
    <Stack.Screen name="Matchmaker" component={MatchmakerScreen} />
    <Stack.Screen name="OzzaRoom" component={OzzaRoomScreen} />
    <Stack.Screen name="DuesPayment" component={DuesPaymentScreen} />
    <Stack.Screen name="CarnivalHub" component={CarnivalHubScreen} />
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="MemberManagement" component={MemberManagementScreen} />
    <Stack.Screen name="Ledger" component={LedgerScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
