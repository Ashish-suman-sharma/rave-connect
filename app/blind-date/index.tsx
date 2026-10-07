// ============================================================
// Rave Connect — Blind Date Dedicated Experience
// Romantic, immersive 1-on-1 anonymous campus matching
// ============================================================
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Heart,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Flame,
  MessageCircle,
  X,
  Compass,
  Lock,
  Calendar,
  LogOut,
} from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { safeBack } from '@/lib/utils';
import { useBlindDateStore } from '@/stores/blindDateStore';
import { useAuthStore } from '@/stores/authStore';
import { useBlindDateUnlockStore } from '@/stores/blindDateUnlockStore';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AppButton } from '@/components/ui/AppButton';

export default function BlindDateScreen() {
  const { user } = useAuthStore();
  const { isUnlocked, isUserEligibleForInstantBypass } = useBlindDateUnlockStore();
  const isGirlException = isUserEligibleForInstantBypass(user);

  const {
    status,
    match,
    queueJoinedAt,
    isMatchingAnimationVisible,
    searchProgressText,
    joinQueue,
    leaveQueue,
    dismissMatchingAnimation,
    withdrawFromMatch,
  } = useBlindDateStore();

  // If locked and not girl exception, redirect to unlock flow
  useEffect(() => {
    if (!isUnlocked && !isGirlException) {
      router.replace('/blind-date/unlock');
    }
  }, [isUnlocked, isGirlException]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  // Matching celebration animation values
  const leftHeartAnim = useRef(new Animated.Value(-80)).current;
  const rightHeartAnim = useRef(new Animated.Value(80)).current;
  const matchScaleAnim = useRef(new Animated.Value(0)).current;
  const matchGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Subtle heart pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.14,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Radar pulse loop for waiting queue
    Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    // Floating background particles
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, { toValue: -14, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim1, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, { toValue: -18, duration: 2200, useNativeDriver: true }),
        Animated.timing(floatAnim2, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Trigger celebration animation when match occurs
  useEffect(() => {
    if (isMatchingAnimationVisible) {
      leftHeartAnim.setValue(-120);
      rightHeartAnim.setValue(120);
      matchScaleAnim.setValue(0);
      matchGlowAnim.setValue(0);

      Animated.sequence([
        // Hearts fly toward each other
        Animated.parallel([
          Animated.spring(leftHeartAnim, { toValue: -16, friction: 5, tension: 50, useNativeDriver: true }),
          Animated.spring(rightHeartAnim, { toValue: 16, friction: 5, tension: 50, useNativeDriver: true }),
        ]),
        // Match popup expands with celebratory bounce
        Animated.parallel([
          Animated.spring(matchScaleAnim, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
          Animated.timing(matchGlowAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [isMatchingAnimationVisible]);

  const handleStartChat = () => {
    dismissMatchingAnimation();
    router.push('/blind-date/chat');
  };

  const radarScale = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.3],
  });

  const radarOpacity = radarAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.6, 0.2, 0],
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          {/* Top Header */}
          <View style={styles.header}>
            <AnimatedPressable onPress={() => safeBack('/(tabs)')} style={styles.headerBackBtn}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
            </AnimatedPressable>

            <View style={styles.headerTitleWrap}>
              <View style={styles.headerBadge}>
                <Heart size={12} color="#FF2E63" fill="#FF2E63" />
                <Text style={styles.headerBadgeText}>CAMPUS ROMANCE</Text>
              </View>
              <Text style={styles.headerTitle}>Blind Date</Text>
            </View>

            <View style={{ width: 44 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Romantic Hero Showcase Card */}
            <View style={styles.heroCard}>
              {/* Floating ambient decorative hearts */}
              <Animated.View style={[styles.floatingHeart1, { transform: [{ translateY: floatAnim1 }] }]}>
                <Heart size={16} color="#FF758F" fill="#FF758F" opacity={0.6} />
              </Animated.View>
              <Animated.View style={[styles.floatingHeart2, { transform: [{ translateY: floatAnim2 }] }]}>
                <Sparkles size={18} color="#FFD166" opacity={0.7} />
              </Animated.View>

              <View style={styles.heroCenter}>
                {status === 'in_queue' ? (
                  // Pulse Radar Visual for Waiting State
                  <View style={styles.radarContainer}>
                    <Animated.View
                      style={[
                        styles.radarWave,
                        { transform: [{ scale: radarScale }], opacity: radarOpacity },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.radarWaveSecond,
                        { transform: [{ scale: radarScale }], opacity: radarOpacity },
                      ]}
                    />
                    <Animated.View style={[styles.heartCenterGlow, { transform: [{ scale: pulseAnim }] }]}>
                      <Heart size={38} color="#FFFFFF" fill="#FF2E63" strokeWidth={1.5} />
                    </Animated.View>
                  </View>
                ) : (
                  // Normal Idle or Matched Hero Glow
                  <Animated.View style={[styles.heartCenterGlow, { transform: [{ scale: pulseAnim }] }]}>
                    <Heart size={44} color="#FFFFFF" fill="#FF2E63" strokeWidth={1.5} />
                  </Animated.View>
                )}

                <Text style={styles.heroHeading}>
                  {status === 'matched'
                    ? "It's a Match! ❤️"
                    : status === 'in_queue'
                    ? 'Looking for your match…'
                    : 'A Secret Connection'}
                </Text>

                <Text style={styles.heroSubtitle}>
                  {status === 'matched'
                    ? "You've been paired with an anonymous student from your campus."
                    : status === 'in_queue'
                    ? searchProgressText
                    : 'Experience spontaneous campus dating. Match 1-on-1, chat anonymously, and decide where to meet.'}
                </Text>

                {/* Status Badges */}
                {status === 'in_queue' && (
                  <View style={styles.queueStatusBadge}>
                    <View style={styles.queueLiveDot} />
                    <Text style={styles.queueStatusText}>Waiting queue active</Text>
                  </View>
                )}

                {status === 'matched' && match && (
                  <View style={styles.matchedTagPill}>
                    <Flame size={14} color="#FF2E63" />
                    <Text style={styles.matchedTagText}>{match.partner.compatibilityScore}% Compatibility</Text>
                  </View>
                )}
              </View>
            </View>

            {/* If currently matched: Show active match card preview */}
            {status === 'matched' && match && (
              <View style={styles.activeMatchCard}>
                <View style={styles.activeMatchTopRow}>
                  <View style={styles.partnerAvatarCircle}>
                    <Heart size={22} color="#FF2E63" fill="#FF2E63" />
                  </View>
                  <View style={styles.partnerInfoCol}>
                    <Text style={styles.partnerCodeName}>{match.partner.codeName}</Text>
                    <Text style={styles.partnerUni}>{match.partner.university}</Text>
                  </View>
                  <View style={styles.matchedPill}>
                    <Text style={styles.matchedPillText}>Active</Text>
                  </View>
                </View>

                {match.partner.bio ? (
                  <Text style={styles.partnerBio}>"{match.partner.bio}"</Text>
                ) : null}

                {/* Shared Interest Chips */}
                <View style={styles.interestChipsRow}>
                  {match.partner.interests.map((interest, idx) => (
                    <View key={idx} style={styles.interestChip}>
                      <Text style={styles.interestChipText}>{interest}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.matchCardDivider} />

                <View style={styles.matchCardActionRow}>
                  <AppButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    title="Open Exclusive Chat ❤️"
                    icon={<MessageCircle size={18} color={theme.colors.textOnAccent} strokeWidth={2.4} />}
                    onPress={() => router.push('/blind-date/chat')}
                  />
                </View>

                <AnimatedPressable onPress={withdrawFromMatch} style={styles.withdrawBtn}>
                  <LogOut size={14} color={theme.colors.textTertiary} />
                  <Text style={styles.withdrawBtnText}>End / Leave this Blind Date</Text>
                </AnimatedPressable>
              </View>
            )}

            {/* "How It Works" Section */}
            <View style={styles.howItWorksCard}>
              <Text style={styles.sectionTitle}>How Blind Date Works</Text>

              <View style={styles.stepItem}>
                <View style={styles.stepIconWrap}>
                  <Lock size={18} color="#FF2E63" strokeWidth={2.2} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>1. Completely Anonymous</Text>
                  <Text style={styles.stepDesc}>
                    No names, photos, or numbers. Identities stay locked until you meet in person.
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepIconWrap}>
                  <Compass size={18} color="#FF2E63" strokeWidth={2.2} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>2. 1-on-1 Campus Matching</Text>
                  <Text style={styles.stepDesc}>
                    Matched exclusively with one verified student based on vibe, year, and campus.
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepIconWrap}>
                  <Calendar size={18} color="#FF2E63" strokeWidth={2.2} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>3. Decide Where to Meet</Text>
                  <Text style={styles.stepDesc}>
                    Chat in private to pick a public spot — like a coffee shop or student union.
                  </Text>
                </View>
              </View>
            </View>

            {/* Safety Guarantee */}
            <View style={styles.safetyCard}>
              <ShieldCheck size={20} color="#10B981" strokeWidth={2.4} />
              <View style={{ flex: 1 }}>
                <Text style={styles.safetyTitle}>Safe & Verified</Text>
                <Text style={styles.safetyDesc}>
                  Only verified university students can enter. Public locations only.
                </Text>
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Bottom Fixed Action Bar */}
          <View style={styles.bottomBar}>
            {status === 'idle' && (
              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                title="Join a Blind Date ❤️"
                icon={<Heart size={18} color={theme.colors.textOnAccent} fill={theme.colors.textOnAccent} />}
                onPress={joinQueue}
              />
            )}

            {status === 'in_queue' && (
              <View style={styles.inQueueActions}>
                <AppButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  title="Leave Queue"
                  icon={<X size={18} color={theme.colors.textSecondary} strokeWidth={2.2} />}
                  onPress={leaveQueue}
                />
              </View>
            )}

            {status === 'matched' && (
              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                title="Chat with Your Match ❤️"
                icon={<MessageCircle size={18} color={theme.colors.textOnAccent} strokeWidth={2.4} />}
                onPress={() => router.push('/blind-date/chat')}
              />
            )}
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* ================= CELEBRATION MATCHING MODAL ================= */}
      <Modal visible={isMatchingAnimationVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          {/* Ambient romantic glow */}
          <Animated.View style={[styles.modalGlowOrb, { opacity: matchGlowAnim }]} />

          <Animated.View style={[styles.celebrationCard, { transform: [{ scale: matchScaleAnim }] }]}>
            {/* Animated two hearts connecting */}
            <View style={styles.heartsConnectionRow}>
              <Animated.View style={[styles.animatedHeartBox, { transform: [{ translateX: leftHeartAnim }] }]}>
                <Heart size={44} color="#FF2E63" fill="#FF2E63" />
              </Animated.View>
              <View style={styles.sparkleBetween}>
                <Sparkles size={24} color="#FFD166" />
              </View>
              <Animated.View style={[styles.animatedHeartBox, { transform: [{ translateX: rightHeartAnim }] }]}>
                <Heart size={44} color="#FF4D6D" fill="#FF4D6D" />
              </Animated.View>
            </View>

            <Text style={styles.celebrationTitle}>It's a Match! ❤️</Text>
            <Text style={styles.celebrationSubtitle}>
              You've been paired with an anonymous student nearby who's excited to meet you.
            </Text>

            {match && (
              <View style={styles.matchTeaserBox}>
                <Text style={styles.teaserCodeName}>{match.partner.codeName}</Text>
                <Text style={styles.teaserUni}>{match.partner.university}</Text>
                <View style={styles.compatibilityPill}>
                  <Flame size={12} color="#FF2E63" />
                  <Text style={styles.compatibilityText}>
                    {match.partner.compatibilityScore}% Compatibility
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.celebrationActionStack}>
              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                title="Start Exclusive Chat ❤️"
                icon={<MessageCircle size={18} color={theme.colors.textOnAccent} strokeWidth={2.4} />}
                onPress={handleStartChat}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  inner: {
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
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 46, 99, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 2,
  },
  headerBadgeText: {
    color: '#FF2E63',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 18,
    letterSpacing: -0.3,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Romantic Hero Card
  heroCard: {
    backgroundColor: '#160B14',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 46, 99, 0.3)',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  floatingHeart1: {
    position: 'absolute',
    top: 24,
    left: 20,
  },
  floatingHeart2: {
    position: 'absolute',
    top: 28,
    right: 22,
  },
  heroCenter: {
    alignItems: 'center',
  },
  heartCenterGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 46, 99, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 46, 99, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  heroHeading: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 24,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 290,
  },

  // Radar Animation
  radarContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  radarWave: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FF2E63',
    backgroundColor: 'rgba(255, 46, 99, 0.12)',
  },
  radarWaveSecond: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#FF758F',
    backgroundColor: 'rgba(255, 117, 143, 0.08)',
  },
  queueStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    marginTop: 14,
  },
  queueLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF2E63',
  },
  queueStatusText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },

  matchedTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 46, 99, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.3)',
  },
  matchedTagText: {
    color: '#FF758F',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },

  // Active Match Card
  activeMatchCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 46, 99, 0.25)',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  activeMatchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partnerAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 46, 99, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInfoCol: {
    flex: 1,
  },
  partnerCodeName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 17,
  },
  partnerUni: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    marginTop: 2,
  },
  matchedPill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  matchedPillText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  partnerBio: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    fontStyle: 'italic',
  },
  interestChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  interestChip: {
    backgroundColor: 'rgba(255, 46, 99, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.15)',
  },
  interestChipText: {
    color: '#FF2E63',
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
  },
  matchCardDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 16,
  },
  matchCardActionRow: {
    marginBottom: 8,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  withdrawBtnText: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
  },

  // How it works card
  howItWorksCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 17,
    letterSpacing: -0.3,
    marginBottom: 18,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 18,
  },
  stepIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 46, 99, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    marginBottom: 3,
  },
  stepDesc: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
  },

  // Safety Card
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  safetyTitle: {
    color: '#065F46',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
  },
  safetyDesc: {
    color: '#047857',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    marginTop: 2,
  },

  // Bottom Fixed Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  inQueueActions: {
    width: '100%',
  },

  // Celebration Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 8, 14, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalGlowOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 46, 99, 0.2)',
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1E0E1B',
    borderRadius: 30,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 46, 99, 0.5)',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  heartsConnectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: 14,
  },
  animatedHeartBox: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleBetween: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationTitle: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 26,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  matchTeaserBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.2)',
  },
  teaserCodeName: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
  },
  teaserUni: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  compatibilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 46, 99, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  compatibilityText: {
    color: '#FF758F',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  celebrationActionStack: {
    width: '100%',
  },
});
