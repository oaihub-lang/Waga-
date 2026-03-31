import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import LoadingScreen from '../screens/auth/LoadingScreen';
import COLORS from '../constants/colors';

const navigationTheme = {
  dark: true,
  colors: {
    primary: COLORS.gold,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.cardBorder,
    notification: COLORS.error,
  },
};

const RootNavigator = () => {
  const { user, loading, isOnboarded } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer theme={navigationTheme}>
      {user && isOnboarded ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
