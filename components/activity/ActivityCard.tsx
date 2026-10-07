// ============================================================
// Rave Connect — Activity Card (Unified Design System)
// Clean white cards, refined typography, persistent joined state, and smooth interactions
// ============================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, Clock, CheckCircle2 } from 'lucide-react-native';
import { theme, getCategoryStyle } from '@/lib/theme';
import { useCountdown } from '@/hooks/useCountdown';
import { Activity } from '@/types';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AppButton } from '@/components/ui/AppButton';
import { useActivityStore } from '@/stores/activityStore';

interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
  onJoin?: () => void;
  compact?: boolean;
}

export default function ActivityCard({ activity, onPress, onJoin, compact }: ActivityCardProps) {
  const { timeLeft, isExpired } = useCountdown(activity.start_time);
  const catStyle = getCategoryStyle(activity.category_id);
  const { isActivityJoined } = useActivityStore();
  
  const isJoined = isActivityJoined(activity.id, activity.creator_id);

  const handleJoin = () => {
    if (onJoin && !isJoined) {
      onJoin();
    }
  };

  const displayTitle = activity.title || activity.category?.name || 'Activity';

  if (compact) {
    return (
      <AnimatedPressable onPress={onPress} style={styles.compactCard} activeScale={0.98}>
        <View style={[styles.compactIcon, { backgroundColor: catStyle.bg }]}>
          <Text style={styles.compactEmoji}>{activity.category?.icon}</Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={1}>{displayTitle}</Text>
          <Text style={styles.compactMeta} numberOfLines={1}>{activity.location_name}</Text>
        </View>
        <View style={styles.compactRight}>
          {isJoined ? (
            <View style={styles.compactJoinedBadge}>
              <CheckCircle2 size={13} color={theme.colors.textOnAccent} strokeWidth={2.5} />
              <Text style={styles.compactJoinedText}>Joined</Text>
            </View>
          ) : (
            <>
              <Text style={styles.compactCount}>{activity.participant_count}</Text>
              <Text style={styles.compactCountLabel}>joined</Text>
            </>
          )}
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable onPress={onPress} style={styles.card} activeScale={0.99}>
      {/* Category tag & Live/Countdown badge */}
      <View style={styles.topRow}>
        <View style={[styles.categoryTag, { backgroundColor: catStyle.bg }]}>
          <Text style={styles.categoryEmoji}>{activity.category?.icon}</Text>
          <Text style={[styles.categoryName, { color: catStyle.text }]}>
            {activity.category?.name}
          </Text>
        </View>

        {isExpired ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        ) : (
          <View style={styles.timeBadge}>
            <Clock size={12} color={theme.colors.textSecondary} strokeWidth={2.5} />
            <Text style={styles.timeText}>{timeLeft}</Text>
          </View>
        )}
      </View>

      {/* Main Activity Heading/Title */}
      <Text style={styles.title} numberOfLines={2}>
        {displayTitle}
      </Text>

      {/* Meeting Location */}
      <View style={styles.locationRow}>
        <MapPin size={15} color={theme.colors.textTertiary} strokeWidth={2.2} />
        <Text style={styles.locationText} numberOfLines={1}>
          {activity.location_name}
        </Text>
      </View>

      {/* Description if present */}
      {activity.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {activity.description}
        </Text>
      ) : null}

      {/* Bottom row: Participant counts + Join/Joined state */}
      <View style={styles.bottomRow}>
        <View style={styles.participantInfo}>
          <Text style={styles.participantCount}>{activity.participant_count}</Text>
          <Text style={styles.participantLabel}>
            {activity.max_participants ? `/${activity.max_participants} ` : ' '}
            {activity.participant_count === 1 ? 'student' : 'students'}
          </Text>
        </View>

        {isJoined ? (
          <AppButton
            size="sm"
            variant="joined"
            title="Joined"
            pill
            icon={<CheckCircle2 size={15} color={theme.colors.textPrimary} strokeWidth={2.5} />}
            disabled
            style={styles.actionBtn}
          />
        ) : (
          <AppButton
            size="sm"
            variant="primary"
            title="Join"
            pill
            onPress={handleJoin}
            style={styles.actionBtn}
          />
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.caption,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.live,
  },
  liveText: {
    color: theme.colors.live,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.micro,
    letterSpacing: 1,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  timeText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.caption,
    fontVariant: ['tabular-nums'],
  },

  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: 6,
    lineHeight: 24,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.body,
    flex: 1,
  },

  description: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.body,
    lineHeight: 21,
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  participantCount: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 22,
  },
  participantLabel: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.caption,
    marginLeft: 6,
  },

  actionBtn: {
    minWidth: 92,
  },

  // Compact variant
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  compactIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  compactEmoji: {
    fontSize: 20,
  },
  compactInfo: {
    flex: 1,
    marginRight: 8,
  },
  compactTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.body,
  },
  compactMeta: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.caption,
    marginTop: 2,
  },
  compactRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactJoinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  compactJoinedText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.micro,
  },
  compactCount: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.h3,
  },
  compactCountLabel: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.micro,
  },
});
