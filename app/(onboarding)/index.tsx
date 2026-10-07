// ============================================================
// Rave Connect — Student Onboarding Screen
// Simplified: Name, Gender, Auto-allocated Open-Source Avatar
// Dedicated to Ravensbourne University London
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Sparkles, Dices, UserCheck, ShieldCheck, Check } from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AppButton } from '@/components/ui/AppButton';

type GenderType = 'male' | 'female' | 'other';

const MALE_SEEDS = ['Felix', 'Oliver', 'Lucas', 'Liam', 'Ethan', 'Leo', 'Max', 'Finn', 'Nico', 'Arthur'];
const FEMALE_SEEDS = ['Sophia', 'Luna', 'Emma', 'Chloe', 'Zoe', 'Mia', 'Aria', 'Lily', 'Ella', 'Ruby'];
const OTHER_SEEDS = ['Jordan', 'Sam', 'Taylor', 'Avery', 'Riley', 'Morgan', 'Kai', 'River', 'Sasha', 'Quinn'];

const getAvatarUrl = (seed: string) => {
  return `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(seed)}&backgroundColor=ffd5dc,ffdfbf,b6e3f4,c0aede,d1d4f9`;
};

export default function OnboardingScreen() {
  const { firebaseUser, setOnboarded, setUser, user } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState<GenderType | null>(null); // No default — user must select
  const [avatarSeed, setAvatarSeed] = useState('Felix');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Allocate random avatar when gender changes
  const handleSelectGender = (selectedGender: GenderType) => {
    setGender(selectedGender);
    let pool = FEMALE_SEEDS;
    if (selectedGender === 'male') pool = MALE_SEEDS;
    if (selectedGender === 'other') pool = OTHER_SEEDS;

    const randomIndex = Math.floor(Math.random() * pool.length);
    setAvatarIndex(randomIndex);
    setAvatarSeed(pool[randomIndex]);
  };

  const handleShuffleAvatar = () => {
    let pool = OTHER_SEEDS;
    if (gender === 'male') pool = MALE_SEEDS;
    if (gender === 'female') pool = FEMALE_SEEDS;

    const nextIndex = (avatarIndex + 1) % pool.length;
    setAvatarIndex(nextIndex);
    setAvatarSeed(pool[nextIndex]);
  };

  const currentAvatarUrl = getAvatarUrl(avatarSeed);

  const handleComplete = async () => {
    if (!gender) return;
    const finalName = name.trim() || user?.name || 'Student';
    const finalUniversity = 'Ravensbourne University London';
    const finalAvatar = currentAvatarUrl;

    setLoading(true);

    if (firebaseUser?.uid) {
      try {
        await updateDoc(doc(db, 'profiles', firebaseUser.uid), {
          name: finalName,
          gender: gender,
          avatar_url: finalAvatar,
          university: finalUniversity,
          is_onboarded: true,
        });
      } catch (err) {
        console.warn('Profile onboarding update failed:', err);
      }
    }

    setOnboarded(true);
    if (user) {
      setUser({
        ...user,
        name: finalName,
        gender: gender,
        avatar_url: finalAvatar,
        university: finalUniversity,
        is_onboarded: true,
      });
    }

    setLoading(false);
    router.replace('/(tabs)');
  };

  const isReady = name.trim().length > 0 && gender !== null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.campusBadge}>
              <Sparkles size={13} color="#101112" />
              <Text style={styles.campusBadgeText}>Ravensbourne University London</Text>
            </View>
            <Text style={styles.title}>Set up your profile</Text>
            <Text style={styles.subtitle}>
              Your campus connection is ready. Let's make your student profile look great!
            </Text>
          </View>

          {/* Avatar Preview Box */}
          <View style={styles.avatarShowcase}>
            <View style={styles.avatarFrame}>
              <Image
                source={{ uri: currentAvatarUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>

            <AnimatedPressable
              onPress={handleShuffleAvatar}
              style={styles.shuffleBtn}
              activeScale={0.94}
            >
              <Dices size={16} color={theme.colors.textPrimary} strokeWidth={2.4} />
              <Text style={styles.shuffleBtnText}>Shuffle Avatar</Text>
            </AnimatedPressable>
          </View>

          {/* Name Input */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ashish, Maya, Alex"
              placeholderTextColor={theme.colors.textTertiary}
              value={name}
              onChangeText={setName}
              maxLength={40}
            />
          </View>

          {/* Gender Selector */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Gender</Text>
            <Text style={styles.inputSubLabel}>Helps us assign your avatar style & match preferences</Text>

            <View style={styles.genderRow}>
              {/* Female Option */}
              <AnimatedPressable
                onPress={() => handleSelectGender('female')}
                style={[
                  styles.genderCard,
                  gender === 'female' && styles.genderCardActive,
                ]}
                activeScale={0.96}
              >
                <Text style={styles.genderEmoji}>👧</Text>
                <Text style={[styles.genderTitle, gender === 'female' && styles.genderTitleActive]}>
                  Female
                </Text>
                {gender === 'female' && (
                  <View style={styles.genderCheckDot}>
                    <Check size={12} color="#101112" strokeWidth={3} />
                  </View>
                )}
              </AnimatedPressable>

              {/* Male Option */}
              <AnimatedPressable
                onPress={() => handleSelectGender('male')}
                style={[
                  styles.genderCard,
                  gender === 'male' && styles.genderCardActive,
                ]}
                activeScale={0.96}
              >
                <Text style={styles.genderEmoji}>👦</Text>
                <Text style={[styles.genderTitle, gender === 'male' && styles.genderTitleActive]}>
                  Male
                </Text>
                {gender === 'male' && (
                  <View style={styles.genderCheckDot}>
                    <Check size={12} color="#101112" strokeWidth={3} />
                  </View>
                )}
              </AnimatedPressable>

              {/* Non-Binary / Other */}
              <AnimatedPressable
                onPress={() => handleSelectGender('other')}
                style={[
                  styles.genderCard,
                  gender === 'other' && styles.genderCardActive,
                ]}
                activeScale={0.96}
              >
                <Text style={styles.genderEmoji}>✨</Text>
                <Text style={[styles.genderTitle, gender === 'other' && styles.genderTitleActive]}>
                  Other
                </Text>
                {gender === 'other' && (
                  <View style={styles.genderCheckDot}>
                    <Check size={12} color="#101112" strokeWidth={3} />
                  </View>
                )}
              </AnimatedPressable>
            </View>
          </View>

          {/* Campus verification card */}
          <View style={styles.campusCard}>
            <ShieldCheck size={20} color="#10B981" strokeWidth={2.4} />
            <View style={{ flex: 1 }}>
              <Text style={styles.campusTitle}>Verified Student Campus</Text>
              <Text style={styles.campusDesc}>
                Joined to Ravensbourne University London community.
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.footer}>
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            title={
              loading
                ? 'Saving...'
                : !name.trim()
                ? 'Enter Your Name'
                : !gender
                ? 'Select Your Gender'
                : 'Get Started'
            }
            icon={<UserCheck size={18} color={theme.colors.textOnAccent} strokeWidth={2.4} />}
            disabled={!isReady || loading}
            loading={loading}
            onPress={handleComplete}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Warm luxury cream canvas (#F7F6F1)
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  header: {
    marginBottom: 20,
  },
  campusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  campusBadgeText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 28,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },

  // Avatar Showcase
  avatarShowcase: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
  },
  avatarFrame: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F0E6',
    borderWidth: 3,
    borderColor: theme.colors.accent,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#101112',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.backgroundAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
  },
  shuffleBtnText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },

  // Form Section
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    marginBottom: 4,
  },
  inputSubLabel: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 16,
  },

  // Gender Selector
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  genderCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(200, 255, 61, 0.12)',
  },
  genderEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  genderTitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
  },
  genderTitleActive: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
  },
  genderCheckDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Campus verification card
  campusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 18,
    padding: 14,
    marginTop: 8,
  },
  campusTitle: {
    color: '#065F46',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
  },
  campusDesc: {
    color: '#047857',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    marginTop: 1,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
});
