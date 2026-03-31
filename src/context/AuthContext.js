import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  auth,
  onAuthChanged,
  getUserProfile,
  subscribeToUser,
  createUserProfile,
  registerUser,
  loginUser,
  logoutUser,
} from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);           // Firebase auth user
  const [profile, setProfile] = useState(null);     // Firestore user profile
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let unsubProfile = null;

    const unsubAuth = onAuthChanged(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        setProfileLoading(true);
        // Subscribe to live profile updates
        unsubProfile = subscribeToUser(firebaseUser.uid, (profileData) => {
          setProfile(profileData);
          setProfileLoading(false);
        });
      } else {
        setProfile(null);
        setProfileLoading(false);
      }

      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const register = async (email, password, displayName) => {
    const firebaseUser = await registerUser(email, password, displayName);
    await createUserProfile(firebaseUser.uid, {
      displayName,
      email,
      photoURL: null,
      phoneNumber: null,
      location: null,
      birthday: null,
      socials: {},
      bio: '',
      handwork: null,
    });
    return firebaseUser;
  };

  const login = async (email, password) => {
    return loginUser(email, password);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
    await AsyncStorage.removeItem('opp_session');
  };

  const isAdmin = profile?.isAdmin === true;
  const isVerified = profile?.isVerified === true;
  const isOnboarded = profile?.onboardingComplete === true;
  const isBanned = profile?.isBanned === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileLoading,
        isAdmin,
        isVerified,
        isOnboarded,
        isBanned,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
