// ============================================================
// Rave Connect — Activity Detail (Unified Design System)
// Clean layout, consistent buttons, polished centered join confirmation
// ============================================================
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Share2,
  Flag,
  MessageCircle,
  CheckCircle2,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import { theme, getCategoryStyle } from '@/lib/theme';
import { useCountdown } from '@/hooks/useCountdown';
import { useActivityStore } from '@/stores/activityStore';
import { formatActivityTime, safeBack } from '@/lib/utils';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AppButton } from '@/components/ui/AppButton';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activities, joinActivity, leaveActivity, isActivityJoined } = useActivityStore();
  const activity = activities.find((a) => a.id === id);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const joinModalScale = useRef(new Animated.Value(0.9)).current;
  const joinModalOpacity = useRef(new Animated.Value(0)).current;

  const isJoined = activity ? isActivityJoined(activity.id, activity.creator_id) : false;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  if (!activity) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorState}>
            <Text style={styles.errorTitle}>Activity not found</Text>
            <AppButton
              variant="outline"
              size="md"
              title="Go back"
              onPress={() => safeBack('/(tabs)')}
              style={{ width: 140 }}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const catStyle = getCategoryStyle(activity.category_id);
  const isFull = activity.max_participants
    ? activity.participant_count >= activity.max_participants
    : false;

  const handleJoin = async () => {
    await joinActivity(activity.id);
    setShowJoinModal(true);
    Animated.parallel([
      Animated.spring(joinModalScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
      Animated.timing(joinModalOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const handleLeave = async () => {
    await leaveActivity(activity.id);
  };

  const closeJoinModal = () => {
    Animated.parallel([
      Animated.timing(joinModalScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
      Animated.timing(joinModalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setShowJoinModal(false);
    });
  };

  const handleOpenChatFromModal = () => {
    closeJoinModal();
    setTimeout(() => {
      router.push(`/activity/${activity.id}/chat`);
    }, 150);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me for "${activity.title || activity.category?.name}" at ${activity.location_name} on Rave Connect!`,
      });
    } catch (e) {
      console.log('Error sharing:', e);
    }
  };

  const displayTitle = activity.title || activity.category?.name || 'Activity';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <AnimatedPressable onPress={() => safeBack('/(tabs)')} style={styles.headerBtn}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
            </AnimatedPressable>
            <Text style={styles.headerTitle}>Activity Details</Text>
            <AnimatedPressable onPress={handleShare} style={styles.headerBtn}>
              <Share2 size={18} color={theme.colors.textPrimary} strokeWidth={2.2} />
            </AnimatedPressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={[styles.heroCategoryTag, { backgroundColor: catStyle.bg }]}>
                  <Text style={styles.heroCategoryEmoji}>{activity.category?.icon}</Text>
                  <Text style={[styles.heroCategoryName, { color: catStyle.text }]}>
                    {activity.category?.name}
                  </Text>
                </View>

                {isJoined && (
                  <View style={styles.joinedTag}>
                    <CheckCircle2 size={13} color={theme.colors.textOnAccent} strokeWidth={2.5} />
                    <Text style={styles.joinedTagText}>You're In</Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text style={styles.heroTitle}>{displayTitle}</Text>

              {/* Location & Time Info */}
              <View style={styles.heroInfoBlock}>
                <View style={styles.heroRow}>
                  <View style={styles.heroIconWrap}>
                    <MapPin size={16} color={theme.colors.textOnAccent} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.heroText}>{activity.location_name}</Text>
                </View>

                <View style={styles.heroRow}>
                  <View style={styles.heroIconWrap}>
                    <Clock size={16} color={theme.colors.textOnAccent} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.heroText}>{formatActivityTime(activity.start_time)}</Text>
                </View>
              </View>

              {/* Description */}
              {activity.description ? (
                <View style={styles.descriptionWrap}>
                  <Text style={styles.descriptionLabel}>ABOUT THIS ACTIVITY</Text>
                  <Text style={styles.heroDescription}>{activity.description}</Text>
                </View>
              ) : null}
            </View>

            {/* Countdown timer card */}
            <CountdownCard startTime={activity.start_time} />

            {/* Participants Card */}
            <View style={styles.participantsCard}>
              <Text style={styles.cardLabel}>People joining</Text>
              <View style={styles.participantCountRow}>
                <Text style={styles.countBig}>{activity.participant_count}</Text>
                <Text style={styles.countSuffix}>
                  {activity.max_participants ? `/ ${activity.max_participants}` : ''}{' '}
                  {activity.participant_count === 1 ? 'student' : 'students'}
                </Text>
              </View>

              <Text style={styles.anonymousNote}>
                Participants become visible to each other when the activity begins
              </Text>

              {activity.max_participants && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(100, (activity.participant_count / activity.max_participants) * 100)}%`,
                        backgroundColor: isFull ? theme.colors.warning : theme.colors.success,
                      },
                    ]}
                  />
                </View>
              )}
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.actionsRow}>
              <AnimatedPressable onPress={handleShare} style={styles.actionBtn}>
                <Share2 size={18} color={theme.colors.textSecondary} strokeWidth={2.2} />
                <Text style={styles.actionLabel}>Share</Text>
              </AnimatedPressable>

              <AnimatedPressable
                onPress={() => router.push(`/activity/${activity.id}/chat`)}
                style={styles.actionBtn}
              >
                <MessageCircle size={18} color={theme.colors.textSecondary} strokeWidth={2.2} />
                <Text style={styles.actionLabel}>Group Chat</Text>
              </AnimatedPressable>

              <AnimatedPressable style={styles.actionBtn}>
                <Flag size={18} color={theme.colors.textSecondary} strokeWidth={2.2} />
                <Text style={styles.actionLabel}>Report</Text>
              </AnimatedPressable>
            </View>

            <View style={{ height: 110 }} />
          </ScrollView>

          {/* Bottom Action Bar (Fixed, Uniform Heights & Radii) */}
          <View style={styles.bottomBar}>
            {isJoined ? (
              <View style={styles.joinedActionRow}>
                <AppButton
                  variant="danger"
                  size="lg"
                  title="Leave"
                  icon={<LogOut size={16} color={theme.colors.danger} strokeWidth={2.2} />}
                  onPress={handleLeave}
                  style={styles.leaveBtn}
                />
                <AppButton
                  variant="primary"
                  size="lg"
                  title="Open Chat"
                  icon={<MessageCircle size={18} color={theme.colors.textOnAccent} strokeWidth={2.5} />}
                  onPress={() => router.push(`/activity/${activity.id}/chat`)}
                  style={styles.chatBtn}
                />
              </View>
            ) : (
              <AppButton
                variant={isFull ? 'secondary' : 'primary'}
                size="lg"
                fullWidth
                title={isFull ? 'Activity is full' : 'Join Activity'}
                icon={!isFull ? <CheckCircle2 size={18} color={theme.colors.textOnAccent} strokeWidth={2.5} /> : undefined}
                disabled={isFull}
                onPress={handleJoin}
              />
            )}
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Join Confirmation Modal — Safely centered & beautifully framed */}
      <Modal visible={showJoinModal} transparent animationType="none">
        <View style={styles.modalBackdrop}>
          <Animated.View
            style={[
              styles.joinModalCard,
              {
                opacity: joinModalOpacity,
                transform: [{ scale: joinModalScale }],
              },
            ]}
          >
            {/* Close Button */}
            <AnimatedPressable onPress={closeJoinModal} style={styles.modalCloseBtn}>
              <X size={18} color={theme.colors.textSecondary} strokeWidth={2.2} />
            </AnimatedPressable>

            {/* Celebration Icon */}
            <View style={styles.modalIconRing}>
              <CheckCircle2 size={42} color={theme.colors.success} strokeWidth={2.5} />
            </View>

            {/* Title & Body */}
            <Text style={styles.modalTitle}>You're in! 🎉</Text>
            <Text style={styles.modalSubtitle}>
              You've successfully joined <Text style={{ fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textPrimary }}>{displayTitle}</Text>.
            </Text>

            {/* Mini Activity Pill */}
            <View style={styles.modalActivitySummary}>
              <View style={styles.modalSummaryRow}>
                <MapPin size={14} color={theme.colors.accent} strokeWidth={2.2} />
                <Text style={styles.modalSummaryText} numberOfLines={1}>{activity.location_name}</Text>
              </View>
              <View style={styles.modalSummaryRow}>
                <Clock size={14} color={theme.colors.accent} strokeWidth={2.2} />
                <Text style={styles.modalSummaryText} numberOfLines={1}>{formatActivityTime(activity.start_time)}</Text>
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalButtonStack}>
              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                title="Open Group Chat"
                icon={<MessageCircle size={18} color={theme.colors.textOnAccent} strokeWidth={2.2} />}
                onPress={handleOpenChatFromModal}
              />
              <AppButton
                variant="outline"
                size="md"
                fullWidth
                title="Done"
                onPress={closeJoinModal}
                style={{ marginTop: 8 }}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function CountdownCard({ startTime }: { startTime: string }) {
  const { timeLeft, isExpired } = useCountdown(startTime);
  return (
    <View style={styles.countdownCard}>
      {isExpired ? (
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>LIVE NOW</Text>
        </View>
      ) : (
        <>
          <Text style={styles.countdownLabel}>STARTS IN</Text>
          <Text style={styles.countdownTime}>{timeLeft}</Text>
        </>
      )}
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.bodyLarge,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },

  // Hero Card
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  heroCategoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  heroCategoryEmoji: {
    fontSize: 14,
  },
  heroCategoryName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.caption,
  },
  joinedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  joinedTagText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 28,
    marginBottom: theme.spacing.lg,
  },
  heroInfoBlock: {
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.body,
    flex: 1,
  },
  descriptionWrap: {
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  descriptionLabel: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroDescription: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.body,
    lineHeight: 22,
  },

  // Countdown
  countdownCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.radius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  countdownLabel: {
    color: theme.colors.textOnDarkMuted,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  countdownTime: {
    color: theme.colors.accent,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 36,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1.5,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.live,
  },
  liveLabel: {
    color: theme.colors.live,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.h3,
    letterSpacing: 1.5,
  },

  // Participants
  participantsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  cardLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.body,
    marginBottom: 6,
  },
  participantCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  countBig: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 34,
  },
  countSuffix: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.body,
    marginLeft: 6,
  },
  anonymousNote: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.backgroundAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Actions Row
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: theme.spacing.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
  },

  // Bottom Fixed Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 18,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  joinedActionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  leaveBtn: {
    flex: 1,
  },
  chatBtn: {
    flex: 2,
  },

  // Error State
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  errorTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.fontFamily.bold,
  },

  // Centered Join Confirmation Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  joinModalCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 22,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  modalSubtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalActivitySummary: {
    width: '100%',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: 14,
    padding: 12,
    gap: 6,
    marginBottom: 20,
  },
  modalSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalSummaryText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    flex: 1,
  },
  modalButtonStack: {
    width: '100%',
  },
});
