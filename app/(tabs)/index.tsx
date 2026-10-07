// ============================================================
// Rave Connect — Homepage (Professional Modern)
// Clean white canvas, refined typography, smooth interactions
// ============================================================
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, ChevronRight, Zap, Heart, Sparkles, MessageCircle } from 'lucide-react-native';
import { theme, getCategoryStyle } from '@/lib/theme';
import { getGreeting } from '@/lib/utils';
import { ACTIVITY_CATEGORIES } from '@/lib/constants';
import { useActivityStore } from '@/stores/activityStore';
import { useBlindDateStore } from '@/stores/blindDateStore';
import { useAuthStore } from '@/stores/authStore';
import { useBlindDateUnlockStore } from '@/stores/blindDateUnlockStore';
import ActivityCard from '@/components/activity/ActivityCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Lock } from 'lucide-react-native';

export default function HomeScreen() {
  const {
    activities,
    loadMockData,
    joinActivity,
    joinedActivityIds,
    filter,
    setFilter,
  } = useActivityStore();

  const { status: blindDateStatus, match: blindDateMatch } = useBlindDateStore();
  const { user } = useAuthStore();
  const {
    isUnlocked,
    isUserEligibleForInstantBypass,
  } = useBlindDateUnlockStore();

  const isEligibleUnlocked = isUnlocked || isUserEligibleForInstantBypass(user);

  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadMockData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Ambient romantic pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.14, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const filteredActivities = filter
    ? activities.filter((a) => a.category_id === filter)
    : activities;

  const sortedActivities = [...filteredActivities].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const handleJoin = (activityId: string) => {
    if (!joinedActivityIds.includes(activityId)) {
      joinActivity(activityId);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.subGreeting}>See what's happening nearby</Text>
            </View>
            <AnimatedPressable
              onPress={() => router.push('/create')}
              style={styles.createBtn}
            >
              <Plus size={20} color={theme.colors.textOnAccent} strokeWidth={2.5} />
            </AnimatedPressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.accent}
              />
            }
          >
            {/* ================= BLIND DATE SHOW-STEALER HERO CARD ================= */}
            <AnimatedPressable
              onPress={() => {
                if (!isEligibleUnlocked) {
                  router.push('/blind-date/unlock');
                } else {
                  router.push('/blind-date');
                }
              }}
              style={[
                styles.blindDateCard,
                !isEligibleUnlocked && styles.blindDateCardLocked,
                blindDateStatus === 'matched' && styles.blindDateCardMatched,
              ]}
              activeScale={0.98}
            >
              {/* Subtle ambient corner sparkle */}
              <View style={styles.blindDateSparkleWrap}>
                <Sparkles
                  size={16}
                  color={!isEligibleUnlocked ? '#C8FF3D' : '#FF758F'}
                  opacity={0.7}
                />
              </View>

              <View style={styles.blindDateLeft}>
                <Animated.View
                  style={[
                    styles.blindDateIconWrap,
                    !isEligibleUnlocked && styles.blindDateIconWrapLocked,
                    blindDateStatus === 'matched' && styles.blindDateIconWrapMatched,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  {!isEligibleUnlocked ? (
                    <Lock size={20} color="#FFFFFF" strokeWidth={2.4} />
                  ) : (
                    <Heart
                      size={22}
                      color="#FFFFFF"
                      fill={blindDateStatus === 'matched' ? '#FF2E63' : '#FF4D6D'}
                      strokeWidth={1.5}
                    />
                  )}
                </Animated.View>

                <View style={styles.blindDateTextCol}>
                  <View style={styles.blindDateTitleRow}>
                    <Text style={styles.blindDateTitle}>Blind Date</Text>

                    {!isEligibleUnlocked ? (
                      <View style={styles.lockedBadge}>
                        <Lock size={10} color="#101112" strokeWidth={2.8} />
                        <Text style={styles.lockedBadgeText}>Locked</Text>
                      </View>
                    ) : blindDateStatus === 'matched' ? (
                      <View style={styles.matchedBadge}>
                        <View style={styles.matchedPulseDot} />
                        <Text style={styles.matchedBadgeText}>Connected ❤️</Text>
                      </View>
                    ) : blindDateStatus === 'in_queue' ? (
                      <View style={styles.searchingBadge}>
                        <View style={styles.searchingDot} />
                        <Text style={styles.searchingBadgeText}>Searching…</Text>
                      </View>
                    ) : (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>1-on-1</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.blindDateSubtitle} numberOfLines={1}>
                    {!isEligibleUnlocked
                      ? 'Meet someone special today · Anonymous'
                      : blindDateStatus === 'matched' && blindDateMatch
                      ? `Connected with ${blindDateMatch.partner.codeName} · Tap to view`
                      : blindDateStatus === 'in_queue'
                      ? 'Looking for your match on campus…'
                      : 'Meet someone special today · Anonymous'}
                  </Text>
                </View>
              </View>

              <View style={styles.blindDateRight}>
                <ChevronRight size={20} color="rgba(255, 255, 255, 0.55)" strokeWidth={2.2} />
              </View>
            </AnimatedPressable>

            {/* Category Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
              style={styles.chipsScroll}
            >
              <AnimatedPressable
                onPress={() => setFilter(null)}
                style={[styles.chip, !filter && styles.chipActive]}
                hapticFeedback={false}
              >
                <Text style={[styles.chipText, !filter && styles.chipTextActive]}>All</Text>
              </AnimatedPressable>
              {ACTIVITY_CATEGORIES.map((cat) => {
                const isActive = filter === cat.id;
                return (
                  <AnimatedPressable
                    key={cat.id}
                    onPress={() => setFilter(isActive ? null : cat.id)}
                    style={[
                      styles.chip,
                      isActive && styles.chipActive,
                    ]}
                    hapticFeedback={false}
                  >
                    <Text style={styles.chipEmoji}>{cat.icon}</Text>
                    <Text style={[
                      styles.chipText,
                      isActive && styles.chipTextActive,
                    ]}>
                      {cat.name}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </ScrollView>

            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>What's happening</Text>
              <View style={styles.countBadge}>
                <Text style={styles.sectionCount}>{sortedActivities.length}</Text>
              </View>
            </View>

            {/* Activity Cards */}
            {sortedActivities.length > 0 ? (
              sortedActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onPress={() => router.push(`/activity/${activity.id}`)}
                  onJoin={() => handleJoin(activity.id)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Zap size={32} color={theme.colors.textTertiary} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>Quiet right now</Text>
                <Text style={styles.emptySubtitle}>
                  Be the first person to start something.
                </Text>
                <AnimatedPressable
                  onPress={() => router.push('/create')}
                  style={styles.emptyBtn}
                >
                  <Plus size={16} color={theme.colors.textOnAccent} strokeWidth={2.5} />
                  <Text style={styles.emptyBtnText}>Create Activity</Text>
                </AnimatedPressable>
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  inner: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  greeting: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.h1,
    letterSpacing: -0.5,
  },
  subGreeting: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.body,
    marginTop: 4,
  },
  createBtn: {
    backgroundColor: theme.colors.accent,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
  },

  // ================= BLIND DATE SHOW-STEALER CARD =================
  blindDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#180B15', // Luxury velvet dark wine
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 46, 99, 0.35)',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  blindDateCardMatched: {
    borderColor: 'rgba(255, 46, 99, 0.7)',
    backgroundColor: '#1F0C1B',
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },
  blindDateSparkleWrap: {
    position: 'absolute',
    top: 10,
    right: 14,
  },
  blindDateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  blindDateIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 46, 99, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 46, 99, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  blindDateIconWrapMatched: {
    backgroundColor: 'rgba(255, 46, 99, 0.3)',
    borderColor: '#FF2E63',
  },
  blindDateTextCol: {
    flex: 1,
  },
  blindDateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  blindDateTitle: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.bodyLarge,
    letterSpacing: -0.3,
  },
  matchedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF2E63',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  matchedPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  matchedBadgeText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  searchingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  searchingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF758F',
  },
  searchingBadgeText: {
    color: '#FF758F',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  newBadge: {
    backgroundColor: 'rgba(255, 46, 99, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  newBadgeText: {
    color: '#FF758F',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  // Locked State Styles
  blindDateCardLocked: {
    borderColor: 'rgba(200, 255, 61, 0.3)', // Subtle Lime Spark border
    backgroundColor: '#120D14', // Sleek dark canvas
    shadowColor: '#101112',
    shadowOpacity: 0.15,
  },
  blindDateIconWrapLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#101112',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accent, // Lime Spark badge
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  lockedBadgeText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  blindDateSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.caption,
    marginTop: 1,
  },
  blindDateRight: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatIndicatorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF2E63',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },

  // Chips
  chipsScroll: {
    marginBottom: theme.spacing.xl,
    marginHorizontal: -theme.spacing.xl,
  },
  chipsContainer: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  chipEmoji: { fontSize: 14 },
  chipText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.caption,
  },
  chipTextActive: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.h2,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  sectionCount: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.micro,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.huge,
  },
  emptyIconWrap: { 
    width: 64, height: 64, borderRadius: 32, 
    backgroundColor: theme.colors.backgroundAlt, 
    alignItems: 'center', justifyContent: 'center',
    marginBottom: theme.spacing.lg 
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.h2,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.body,
    marginBottom: theme.spacing.xxl,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.pill,
  },
  emptyBtnText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.body,
  },
});
