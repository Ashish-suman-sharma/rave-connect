// ============================================================
// Rave Connect — Referral Invite Handler & Welcome Screen
// Deep Link: /invite/[code] or /invite?ref=CODE
// ============================================================
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Sparkles,
  Heart,
  CheckCircle2,
  Users,
  GraduationCap,
} from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { doc, getDoc, updateDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppButton } from '@/components/ui/AppButton';

export default function InviteLandingScreen() {
  const params = useLocalSearchParams<{ code?: string; ref?: string }>();
  const refCode = (params.code || params.ref || '').toUpperCase();

  const [verifying, setVerifying] = useState(true);
  const [referrerName, setReferrerName] = useState<string>('Your campus friend');

  useEffect(() => {
    async function processInviteClick() {
      if (!refCode) {
        setVerifying(false);
        return;
      }

      try {
        // 1. Check referral doc
        const refDocRef = doc(db, 'referrals', refCode);
        const refSnap = await getDoc(refDocRef);

        let referrerId = '';
        if (refSnap.exists()) {
          const data = refSnap.data();
          referrerId = data.referrer_id || '';
          await updateDoc(refDocRef, {
            click_count: increment(1),
            last_clicked_at: serverTimestamp(),
            verified: true,
          });
        } else {
          // If doc doesn't exist, search profiles with this referral_code
          // or create record
          await setDoc(refDocRef, {
            code: refCode,
            click_count: 1,
            last_clicked_at: serverTimestamp(),
            verified: true,
          });
        }

        // 2. Unlock the referrer's profile in Firestore
        if (referrerId) {
          const profileRef = doc(db, 'profiles', referrerId);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const pData = profileSnap.data();
            if (pData.name) {
              setReferrerName(pData.name);
            }
          }
          await updateDoc(profileRef, {
            blind_date_unlocked: true,
            referral_completed: true,
            referrals_count: increment(1),
          });
        }
      } catch (err) {
        console.warn('Referral verification failed:', err);
      } finally {
        setVerifying(false);
      }
    }

    processInviteClick();
  }, [refCode]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <View style={styles.campusBadge}>
            <GraduationCap size={14} color="#101112" />
            <Text style={styles.campusBadgeText}>Ravensbourne University London</Text>
          </View>

          <View style={styles.iconCircle}>
            <Heart size={36} color="#FF2E63" fill="#FF2E63" />
          </View>

          {verifying ? (
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={styles.verifyingText}>Verifying campus invite…</Text>
            </View>
          ) : (
            <>
              <View style={styles.verifiedPill}>
                <CheckCircle2 size={14} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.verifiedPillText}>Invite Verified</Text>
              </View>

              <Text style={styles.title}>
                You just unlocked Blind Date for {referrerName}! 🎉
              </Text>

              <Text style={styles.subtitle}>
                Join Rave Connect — the exclusive community app for Ravensbourne University London. Meet classmates, host campus activities, and unlock your own 1-on-1 Blind Dates!
              </Text>

              <AppButton
                variant="primary"
                size="lg"
                title="Join Rave Connect 🚀"
                onPress={() => router.replace('/(tabs)')}
                style={{ width: '100%', marginTop: 20 }}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    shadowColor: '#101112',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  campusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    marginBottom: 20,
  },
  campusBadgeText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  iconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255, 46, 99, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifyingText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
    marginTop: 12,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    marginBottom: 12,
  },
  verifiedPillText: {
    color: '#10B981',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
