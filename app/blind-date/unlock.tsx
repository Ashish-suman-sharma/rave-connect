// ============================================================
// Rave Connect — Blind Date Unlock Screen
// 24-Hour Live Countdown, WhatsApp Referral & Instant Unlock
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Share,
  Clipboard,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Lock,
  Unlock,
  Clock,
  Sparkles,
  Share2,
  Copy,
  CheckCircle2,
  Heart,
  Shield,
  Zap,
  Users,
  ExternalLink,
  MessageCircle,
} from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { safeBack } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useBlindDateUnlockStore } from '@/stores/blindDateUnlockStore';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AppButton } from '@/components/ui/AppButton';

const TOTAL_24H_MS = 24 * 60 * 60 * 1000;

export default function BlindDateUnlockScreen() {
  const { user } = useAuthStore();
  const {
    isUnlocked,
    unlockStartedAt,
    hasShared,
    referralCode,
    referralsCount,
    startCountdown,
    shareOnWhatsApp,
    simulateFriendClick,
    checkAutoUnlock,
    getRemainingMs,
    formatCountdown,
    getReferralUrl,
    isUserEligibleForInstantBypass,
  } = useBlindDateUnlockStore();

  const isGirlException = isUserEligibleForInstantBypass(user);

  // Live countdown state
  const [remainingMs, setRemainingMs] = useState(getRemainingMs());
  const [copied, setCopied] = useState(false);
  const [testingClick, setTestingClick] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0.95)).current;

  // 1. Immediately start 24h countdown if not girl and not started
  useEffect(() => {
    if (!isGirlException && !isUnlocked) {
      startCountdown(user?.id);
    }
  }, [isGirlException, isUnlocked, user?.id]);

  // 2. Entrance & radar pulse animations
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // Subtle pulsing lock glow
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Radar pulse for waiting state
    const radarLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(radarAnim, {
          toValue: 1.05,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(radarAnim, {
          toValue: 0.95,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    radarLoop.start();

    return () => {
      pulseLoop.stop();
      radarLoop.stop();
    };
  }, []);

  // 3. 1-second interval timer for live 24h countdown
  useEffect(() => {
    const updateTimer = () => {
      const ms = getRemainingMs();
      setRemainingMs(ms);

      if (ms <= 0 && unlockStartedAt) {
        checkAutoUnlock(user?.id);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [unlockStartedAt, isUnlocked, user?.id]);

  // Copy referral link to clipboard
  const handleCopyLink = () => {
    const url = getReferralUrl();
    Clipboard.setString(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // WhatsApp Share Trigger
  const handleShare = async () => {
    await shareOnWhatsApp(user?.id);
  };

  // Simulate friend clicking the link (for live test & demo)
  const handleSimulateClick = async () => {
    setTestingClick(true);
    await simulateFriendClick(user?.id);
    setTimeout(() => {
      setTestingClick(false);
      Alert.alert(
        '🎉 Invite Verified!',
        'A fellow Ravensbourne student opened your referral link. Blind Date has been instantly unlocked!',
        [{ text: 'Enter Blind Date 💫', onPress: () => router.replace('/blind-date') }]
      );
    }, 700);
  };

  // Progress percentage toward 24h (0 to 100%)
  const progressPercent = Math.min(
    100,
    Math.max(0, ((TOTAL_24H_MS - remainingMs) / TOTAL_24H_MS) * 100)
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedPressable onPress={() => safeBack('/(tabs)')} style={styles.backBtn}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Blind Date</Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* ================= HERO CARD (LOCK OR UNLOCKED) ================= */}
            {isUnlocked || isGirlException ? (
              // UNLOCKED STATE
              <View style={styles.heroCardUnlocked}>
                <View style={styles.sparkleWrap}>
                  <Sparkles size={20} color="#C8FF3D" />
                </View>

                <View style={styles.unlockedIconCircle}>
                  <Unlock size={32} color="#101112" strokeWidth={2.5} />
                </View>

                <Text style={styles.unlockedTitle}>Blind Date Unlocked! 🎉</Text>
                <Text style={styles.unlockedSubtitle}>
                  {isGirlException
                    ? 'Immediate VIP access for verified Ravensbourne students.'
                    : 'Your invitation was verified! You are ready to match on campus.'}
                </Text>

                <AppButton
                  variant="primary"
                  size="lg"
                  title="Enter Blind Date 💫"
                  onPress={() => router.replace('/blind-date')}
                  style={{ marginTop: 18, width: '100%' }}
                />
              </View>
            ) : (
              // LOCKED HERO CARD WITH 24H COUNTDOWN
              <View style={styles.heroCardLocked}>
                {/* Ambient glow accent */}
                <View style={styles.sparkleWrap}>
                  <Sparkles size={18} color="#FF758F" opacity={0.8} />
                </View>

                {/* Pulsing Lock Icon */}
                <Animated.View
                  style={[
                    styles.lockIconCircle,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Lock size={30} color="#FFFFFF" strokeWidth={2.4} />
                </Animated.View>

                <View style={styles.lockBadge}>
                  <View style={styles.lockBadgeDot} />
                  <Text style={styles.lockBadgeText}>24-HOUR ACCESS WINDOW</Text>
                </View>

                {/* Big Live Countdown Display */}
                <Text style={styles.countdownTitle}>
                  Blind Date unlocks in
                </Text>
                <Text style={styles.countdownTimer}>
                  {formatCountdown(remainingMs)}
                </Text>

                {/* Progress bar */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.max(4, progressPercent)}%` },
                    ]}
                  />
                </View>

                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabelText}>Started</Text>
                  <Text style={styles.progressLabelText}>Auto-Unlocks at 00:00</Text>
                </View>
              </View>
            )}

            {/* ================= INSTANT UNLOCK / WAITING ON INVITE SECTION ================= */}
            {!isUnlocked && !isGirlException && (
              <View style={styles.actionSection}>
                {hasShared ? (
                  // STATE 4: ALREADY SHARED -> "Waiting for someone to click your invite 💚"
                  <View style={styles.waitingContainer}>
                    <View style={styles.waitingHeaderRow}>
                      <Animated.View
                        style={[
                          styles.radarRing,
                          { transform: [{ scale: radarAnim }] },
                        ]}
                      >
                        <View style={styles.radarDot} />
                      </Animated.View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.waitingTitle}>
                          Waiting for someone to click your invite 💚
                        </Text>
                        <Text style={styles.waitingSub}>
                          We're actively monitoring in real-time. Blind Date unlocks automatically once opened!
                        </Text>
                      </View>
                    </View>

                    {/* Personal Referral Link Box */}
                    <View style={styles.refLinkCard}>
                      <View style={styles.refLinkLeft}>
                        <Text style={styles.refLinkCodeLabel}>YOUR INVITE CODE</Text>
                        <Text style={styles.refLinkCodeText}>{referralCode || 'RAVE2026'}</Text>
                        <Text style={styles.refLinkUrlText} numberOfLines={1}>
                          {getReferralUrl()}
                        </Text>
                      </View>
                      <AnimatedPressable
                        onPress={handleCopyLink}
                        style={styles.copyBtn}
                        activeScale={0.92}
                      >
                        {copied ? (
                          <CheckCircle2 size={18} color="#10B981" strokeWidth={2.4} />
                        ) : (
                          <Copy size={18} color={theme.colors.textPrimary} strokeWidth={2.2} />
                        )}
                        <Text style={[styles.copyBtnText, copied && { color: '#10B981' }]}>
                          {copied ? 'Copied' : 'Copy'}
                        </Text>
                      </AnimatedPressable>
                    </View>

                    {/* Reshare on WhatsApp Button */}
                    <AppButton
                      variant="primary"
                      size="lg"
                      title="Reshare on WhatsApp"
                      icon={<MessageCircle size={18} color="#101112" strokeWidth={2.5} />}
                      onPress={handleShare}
                      style={{ marginTop: 14, width: '100%' }}
                    />

                    {/* Live Simulation / Verification Demo Helper */}
                    <AnimatedPressable
                      onPress={handleSimulateClick}
                      style={styles.simulatePill}
                      activeScale={0.96}
                    >
                      <Zap size={14} color={theme.colors.textSecondary} strokeWidth={2.2} />
                      <Text style={styles.simulatePillText}>
                        {testingClick ? 'Verifying link click…' : '🧪 Simulate Friend Opening Link (Test)'}
                      </Text>
                    </AnimatedPressable>
                  </View>
                ) : (
                  // STATE 3: INITIAL STATE -> "⚡ Unlock Instantly — Share on WhatsApp"
                  <View style={styles.instantUnlockCard}>
                    <View style={styles.instantHeader}>
                      <View style={styles.zapIconCircle}>
                        <Zap size={20} color="#101112" strokeWidth={2.8} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.instantTitle}>Don't want to wait 24 hours?</Text>
                        <Text style={styles.instantSub}>
                          Invite 1 fellow Ravensbourne student. As soon as they open your link, you unlock instantly!
                        </Text>
                      </View>
                    </View>

                    {/* Prominent WhatsApp Share Button */}
                    <AppButton
                      variant="primary"
                      size="lg"
                      title="⚡ Unlock Instantly — Share on WhatsApp"
                      onPress={handleShare}
                      style={styles.whatsAppBtn}
                    />

                    <View style={styles.guaranteeRow}>
                      <Shield size={13} color={theme.colors.textTertiary} strokeWidth={2.2} />
                      <Text style={styles.guaranteeText}>
                        Unique verified deep-link · Safe campus community
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ================= WHAT IS BLIND DATE EXPLAINER ================= */}
            <View style={styles.featuresSection}>
              <Text style={styles.featuresHeading}>WHAT TO EXPECT IN BLIND DATE</Text>

              <View style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <Heart size={18} color="#FF2E63" fill="#FF2E63" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>1-on-1 Anonymous Match</Text>
                  <Text style={styles.featureDesc}>
                    Get paired with another student on campus based on your interests and creative vibes.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <Lock size={18} color={theme.colors.textPrimary} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>Secret Aliases Until You Reveal</Text>
                  <Text style={styles.featureDesc}>
                    Your identity remains protected by a mystery code name until both of you agree to reveal.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <Users size={18} color={theme.colors.textPrimary} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>Ravensbourne London Only</Text>
                  <Text style={styles.featureDesc}>
                    Strictly for your campus community so you can actually meet up for coffee or a project talk.
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Cream canvas (#F7F6F1)
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 17,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },

  // Hero Card Locked
  heroCardLocked: {
    backgroundColor: '#101112', // Obsidian black
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(200, 255, 61, 0.25)', // Subtle Lime Spark edge
    shadowColor: '#101112',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
    overflow: 'hidden',
  },
  sparkleWrap: {
    position: 'absolute',
    top: 18,
    right: 18,
  },
  lockIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 46, 99, 0.2)', // Wine glow
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF2E63',
    marginBottom: 16,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    marginBottom: 12,
  },
  lockBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
  },
  lockBadgeText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  countdownTitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
    marginBottom: 6,
  },
  countdownTimer: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 38,
    letterSpacing: 2,
    marginBottom: 18,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accent, // Lime Spark progress
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressLabelText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
  },

  // Hero Card Unlocked
  heroCardUnlocked: {
    backgroundColor: '#101112',
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  unlockedIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  unlockedTitle: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  unlockedSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 290,
  },

  // Action Section
  actionSection: {
    marginBottom: 24,
  },

  // Instant Unlock Box (Initial)
  instantUnlockCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    shadowColor: '#101112',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  instantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  zapIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instantTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 16,
    marginBottom: 2,
  },
  instantSub: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  whatsAppBtn: {
    width: '100%',
    marginBottom: 12,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  guaranteeText: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
  },

  // Waiting State (Already Shared)
  waitingContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)', // Emerald outline
    shadowColor: '#101112',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  waitingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  radarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  radarDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
  },
  waitingTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  waitingSub: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
  },

  // Referral Link Card
  refLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 6,
  },
  refLinkLeft: {
    flex: 1,
    marginRight: 12,
  },
  refLinkCodeLabel: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  refLinkCodeText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 16,
    letterSpacing: 1,
  },
  refLinkUrlText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  copyBtnText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },

  simulatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 10,
  },
  simulatePillText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    textDecorationLine: 'underline',
  },

  // Features Explainer
  featuresSection: {
    gap: 12,
  },
  featuresHeading: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
    marginLeft: 4,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  featureDesc: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
  },
});
