// ============================================================
// Rave Connect — My Activities Screen (Created & Joined)
// With Live / Past toggles, Host Delete, and Participant Leave actions
// ============================================================
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  LogOut,
  MessageCircle,
  Plus,
  Users,
  Compass,
} from 'lucide-react-native';
import { theme, getCategoryStyle } from '@/lib/theme';
import { useActivityStore } from '@/stores/activityStore';
import { useAuthStore } from '@/stores/authStore';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AppButton } from '@/components/ui/AppButton';
import { formatActivityTime, safeBack } from '@/lib/utils';
import { Activity } from '@/types';

type MainSection = 'joined' | 'created';
type TimeFilter = 'live' | 'past';

export default function MyActivitiesScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialSection: MainSection = params.tab === 'created' ? 'created' : 'joined';

  const [activeSection, setActiveSection] = useState<MainSection>(initialSection);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('live'); // Default to Live!

  // React to tab parameter changes if user navigates again
  useEffect(() => {
    if (params.tab === 'created') {
      setActiveSection('created');
    } else if (params.tab === 'joined') {
      setActiveSection('joined');
    }
  }, [params.tab]);

  const { activities, joinedActivityIds, deleteActivity, leaveActivity } = useActivityStore();
  const { user } = useAuthStore();

  const currentUserId = user?.id || 'current-user';

  // 1. Created Activities
  const myCreatedActivities = useMemo(() => {
    return activities.filter(
      (a) => a.creator_id === currentUserId || a.creator_id === 'current-user'
    );
  }, [activities, currentUserId]);

  // 2. Joined Activities (excluding user-created activities)
  const myJoinedActivities = useMemo(() => {
    return activities.filter((a) => {
      const isJoined = joinedActivityIds.includes(a.id);
      const isCreator = a.creator_id === currentUserId || a.creator_id === 'current-user';
      return isJoined && !isCreator;
    });
  }, [activities, joinedActivityIds, currentUserId]);

  // Helper to test if activity is still Live / Upcoming vs Past
  // We consider an activity past if it's completed, cancelled, or older than 2 hours from start_time
  const isActivityLive = (activity: Activity) => {
    if (activity.status === 'COMPLETED' || activity.status === 'CANCELLED') return false;
    if (!activity.start_time) return true;
    const startTimeMs = new Date(activity.start_time).getTime();
    if (isNaN(startTimeMs)) return true;
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    return startTimeMs > twoHoursAgo;
  };

  // Filtered by Live vs Past
  const displayedActivities = useMemo(() => {
    const sourceList = activeSection === 'created' ? myCreatedActivities : myJoinedActivities;
    return sourceList.filter((a) => {
      const live = isActivityLive(a);
      return timeFilter === 'live' ? live : !live;
    });
  }, [activeSection, timeFilter, myCreatedActivities, myJoinedActivities]);

  // Host Delete Confirmation
  const handleDeleteEvent = (activity: Activity) => {
    Alert.alert(
      'Delete Activity?',
      `Are you sure you want to cancel and delete "${activity.title || activity.category?.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteActivity(activity.id);
          },
        },
      ]
    );
  };

  // Participant Leave Confirmation
  const handleLeaveEvent = (activity: Activity) => {
    Alert.alert(
      'Leave Activity?',
      `Are you sure you want to leave "${activity.title || activity.category?.name}"? You will be removed from participants.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            await leaveActivity(activity.id);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedPressable onPress={() => safeBack('/(tabs)/profile')} style={styles.backBtn}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>My Activities</Text>
          <AnimatedPressable onPress={() => router.push('/create')} style={styles.createBtn}>
            <Plus size={18} color={theme.colors.textOnAccent} strokeWidth={2.5} />
          </AnimatedPressable>
        </View>

        {/* Primary Segmented Switcher (Joined vs Created) */}
        <View style={styles.primaryTabContainer}>
          <Pressable
            onPress={() => setActiveSection('joined')}
            style={[
              styles.primaryTab,
              activeSection === 'joined' ? styles.primaryTabActive : styles.primaryTabInactive,
            ]}
          >
            <Text
              style={[
                styles.primaryTabText,
                activeSection === 'joined' ? styles.primaryTabTextActive : styles.primaryTabTextInactive,
              ]}
            >
              Joined by Me
            </Text>
            <View
              style={[
                styles.primaryTabBadge,
                activeSection === 'joined' ? styles.primaryTabBadgeActive : styles.primaryTabBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.primaryTabBadgeText,
                  activeSection === 'joined' ? styles.primaryTabBadgeTextActive : styles.primaryTabBadgeTextInactive,
                ]}
              >
                {myJoinedActivities.length}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setActiveSection('created')}
            style={[
              styles.primaryTab,
              activeSection === 'created' ? styles.primaryTabActive : styles.primaryTabInactive,
            ]}
          >
            <Text
              style={[
                styles.primaryTabText,
                activeSection === 'created' ? styles.primaryTabTextActive : styles.primaryTabTextInactive,
              ]}
            >
              Created by Me
            </Text>
            <View
              style={[
                styles.primaryTabBadge,
                activeSection === 'created' ? styles.primaryTabBadgeActive : styles.primaryTabBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.primaryTabBadgeText,
                  activeSection === 'created' ? styles.primaryTabBadgeTextActive : styles.primaryTabBadgeTextInactive,
                ]}
              >
                {myCreatedActivities.length}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Sub-filter Toggle: Live / Current (Default) vs Past / Completed */}
        <View style={styles.subFilterRow}>
          <AnimatedPressable
            onPress={() => setTimeFilter('live')}
            style={[
              styles.subFilterPill,
              timeFilter === 'live' && styles.subFilterPillActive,
            ]}
            activeScale={0.96}
          >
            <View
              style={[
                styles.liveDot,
                timeFilter === 'live' && styles.liveDotActive,
              ]}
            />
            <Text
              style={[
                styles.subFilterText,
                timeFilter === 'live' && styles.subFilterTextActive,
              ]}
            >
              {activeSection === 'created' ? 'Live / Upcoming' : 'Current / Live'}
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={() => setTimeFilter('past')}
            style={[
              styles.subFilterPill,
              timeFilter === 'past' && styles.subFilterPillActive,
            ]}
            activeScale={0.96}
          >
            <Text
              style={[
                styles.subFilterText,
                timeFilter === 'past' && styles.subFilterTextActive,
              ]}
            >
              Past / Completed
            </Text>
          </AnimatedPressable>
        </View>

        {/* Activities List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollList}
        >
          {displayedActivities.length > 0 ? (
            displayedActivities.map((activity) => {
              const catStyle = getCategoryStyle(activity.category_id);
              const isHost = activity.creator_id === currentUserId || activity.creator_id === 'current-user';

              return (
                <View key={activity.id} style={styles.activityCard}>
                  {/* Card Header Row */}
                  <View style={styles.cardTopRow}>
                    <View style={[styles.categoryPill, { backgroundColor: catStyle.bg }]}>
                      <Text style={styles.categoryEmoji}>{activity.category?.icon}</Text>
                      <Text style={[styles.categoryName, { color: catStyle.text }]}>
                        {activity.category?.name}
                      </Text>
                    </View>

                    {isHost ? (
                      <View style={styles.hostBadge}>
                        <Text style={styles.hostBadgeText}>Host</Text>
                      </View>
                    ) : (
                      <View style={styles.joinedBadge}>
                        <Text style={styles.joinedBadgeText}>Joined</Text>
                      </View>
                    )}
                  </View>

                  {/* Activity Title */}
                  <AnimatedPressable
                    onPress={() => router.push(`/activity/${activity.id}`)}
                    activeScale={0.99}
                  >
                    <Text style={styles.activityTitle}>
                      {activity.title || activity.category?.name}
                    </Text>
                  </AnimatedPressable>

                  {/* Location & Time info */}
                  <View style={styles.infoStack}>
                    <View style={styles.infoRow}>
                      <MapPin size={14} color={theme.colors.textTertiary} strokeWidth={2.2} />
                      <Text style={styles.infoText} numberOfLines={1}>
                        {activity.location_name}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Clock size={14} color={theme.colors.textTertiary} strokeWidth={2.2} />
                      <Text style={styles.infoText}>
                        {formatActivityTime(activity.start_time)}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Users size={14} color={theme.colors.textTertiary} strokeWidth={2.2} />
                      <Text style={styles.infoText}>
                        {activity.participant_count} {activity.participant_count === 1 ? 'student' : 'students'}
                      </Text>
                    </View>
                  </View>

                  {/* Action Bar at bottom of card */}
                  <View style={styles.cardActionRow}>
                    {/* View Details Button */}
                    <AppButton
                      variant="secondary"
                      size="sm"
                      title="Details"
                      onPress={() => router.push(`/activity/${activity.id}`)}
                      style={{ flex: 1 }}
                    />

                    {/* Chat Button */}
                    <AppButton
                      variant="outline"
                      size="sm"
                      title="Chat"
                      icon={<MessageCircle size={14} color={theme.colors.textPrimary} strokeWidth={2.2} />}
                      onPress={() => router.push(`/activity/${activity.id}/chat`)}
                      style={{ flex: 1 }}
                    />

                    {/* HOST ACTION: Delete Event (for Created tab) */}
                    {isHost && (
                      <AppButton
                        variant="danger"
                        size="sm"
                        title="Delete"
                        icon={<Trash2 size={14} color={theme.colors.danger} strokeWidth={2.2} />}
                        onPress={() => handleDeleteEvent(activity)}
                        style={{ flex: 1.1 }}
                      />
                    )}

                    {/* PARTICIPANT ACTION: Leave Event (for Joined tab in Live mode) */}
                    {!isHost && timeFilter === 'live' && (
                      <AppButton
                        variant="danger"
                        size="sm"
                        title="Leave"
                        icon={<LogOut size={14} color={theme.colors.danger} strokeWidth={2.2} />}
                        onPress={() => handleLeaveEvent(activity)}
                        style={{ flex: 1.1 }}
                      />
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            /* Empty State */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                {activeSection === 'created' ? (
                  <Calendar size={32} color={theme.colors.textTertiary} strokeWidth={1.5} />
                ) : (
                  <Compass size={32} color={theme.colors.textTertiary} strokeWidth={1.5} />
                )}
              </View>

              <Text style={styles.emptyTitle}>
                {activeSection === 'created'
                  ? timeFilter === 'live'
                    ? 'No live activities created'
                    : 'No past hosted activities'
                  : timeFilter === 'live'
                  ? 'No current joined activities'
                  : 'No past joined activities'}
              </Text>

              <Text style={styles.emptySubtitle}>
                {activeSection === 'created'
                  ? timeFilter === 'live'
                    ? 'Host an activity for fellow Ravensbourne students to join!'
                    : 'Activities you host will appear here once completed.'
                  : timeFilter === 'live'
                  ? 'Explore campus activities nearby and join what interests you!'
                  : 'Activities you participate in will be recorded here.'}
              </Text>

              {timeFilter === 'live' && (
                <AppButton
                  variant="primary"
                  size="md"
                  title={activeSection === 'created' ? 'Host an Activity ⚡' : 'Discover Activities 🚀'}
                  onPress={() => {
                    if (activeSection === 'created') {
                      router.push('/create');
                    } else {
                      router.push('/(tabs)');
                    }
                  }}
                  style={{ marginTop: 16, width: 220 }}
                />
              )}
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 17,
  },
  createBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Primary Segmented Tab Switcher
  primaryTabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.pill,
    padding: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  primaryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: theme.radius.pill,
    gap: 8,
  },
  primaryTabActive: {
    backgroundColor: '#101112', // Obsidian black
    shadowColor: '#101112',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryTabInactive: {
    backgroundColor: 'transparent',
  },
  primaryTabText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
  },
  primaryTabTextActive: {
    color: '#FFFFFF', // Crisp white on black
  },
  primaryTabTextInactive: {
    color: '#101112', // Pure black on white
  },
  primaryTabBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTabBadgeActive: {
    backgroundColor: theme.colors.accent, // Lime Spark
  },
  primaryTabBadgeInactive: {
    backgroundColor: '#EDEAE1', // Soft cream/gray
  },
  primaryTabBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  primaryTabBadgeTextActive: {
    color: '#101112', // Black on lime
  },
  primaryTabBadgeTextInactive: {
    color: '#101112', // Black on soft cream
  },

  // Sub-filter Row: Live vs Past
  subFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  subFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  subFilterPillActive: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(200, 255, 61, 0.12)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.textTertiary,
  },
  liveDotActive: {
    backgroundColor: '#10B981', // Glowing green for live
  },
  subFilterText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
  },
  subFilterTextActive: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
  },

  // Activities List
  scrollList: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  activityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#101112',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  categoryEmoji: {
    fontSize: 13,
  },
  categoryName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  hostBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  hostBadgeText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  joinedBadge: {
    backgroundColor: 'rgba(200, 255, 61, 0.18)',
    borderWidth: 1,
    borderColor: theme.colors.accent,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  joinedBadgeText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  activityTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 17,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  infoStack: {
    gap: 6,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    flex: 1,
  },

  // Card Action Buttons
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 17,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 280,
  },
});
