// ============================================================
// Rave Connect — Welcome / Login Screen
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { signIn } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    
    const { error } = await signIn(email, password);

    if (error) {
      setErrorMsg(error);
      setLoading(false);
    } else {
      setLoading(false);
      const { isOnboarded } = useAuthStore.getState();
      router.replace(isOnboarded ? '/(tabs)' : '/(onboarding)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Rave Connect</Text>
            <Text style={styles.subtitle}>
              Meet people through what's happening, not through profiles.
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={theme.colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
            
            <Pressable onPress={handleLogin} disabled={loading} style={[styles.primaryButton, loading && { opacity: 0.7 }]}>
              <Text style={styles.primaryButtonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(auth)/signup')}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Create an account</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xxxl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.huge,
    alignItems: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.display,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
    letterSpacing: -1,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.bodyLarge,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.bodyLarge,
  },
  form: {
    gap: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.bodyLarge,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.body,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  primaryButtonText: {
    color: theme.colors.textOnAccent,
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: '700',
  },
  secondaryButton: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: '600',
  },
});
