import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { theme } from '@/lib/theme';

export default function Index() {
  const { firebaseUser, isOnboarded, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!firebaseUser) {
      router.replace('/(auth)');
    } else if (!isOnboarded) {
      router.replace('/(onboarding)');
    } else {
      router.replace('/(tabs)');
    }
  }, [firebaseUser, isOnboarded, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={theme.colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

