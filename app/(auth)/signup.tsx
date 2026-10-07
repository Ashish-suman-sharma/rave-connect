// ============================================================
// Rave Connect — Signup Screen
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
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { safeBack } from '@/lib/utils';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { signUp } = useAuthStore();

  const handleSignup = async () => {
    if (!email || !password || !name) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const { error } = await signUp(email, password, name);

    if (error) {
      setErrorMsg(error);
      setLoading(false);
    } else {
      setLoading(false);
      router.replace('/(onboarding)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => safeBack('/(auth)/login')} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </Pressable>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join the student community.</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor={theme.colors.textTertiary}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="University email"
              placeholderTextColor={theme.colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min. 6 characters)"
              placeholderTextColor={theme.colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text style={styles.ageNote}>By signing up, you confirm you are 18 or older.</Text>
            
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <Pressable onPress={handleSignup} disabled={loading} style={[styles.primaryButton, loading && { opacity: 0.7 }]}>
              <Text style={styles.primaryButtonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
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
  header: {
    padding: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xxxl,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.display,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.bodyLarge,
    marginBottom: theme.spacing.xxxl,
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
  ageNote: {
    color: theme.colors.textTertiary,
    fontSize: theme.typography.sizes.caption,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
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
  },
  primaryButtonText: {
    color: theme.colors.textOnAccent,
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: '700',
  },
});
