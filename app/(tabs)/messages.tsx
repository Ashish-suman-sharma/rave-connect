// ============================================================
// Rave Connect — Messages Screen (Professional Modern)
// ============================================================
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { theme, getCategoryStyle } from '@/lib/theme';
import { useActivityStore } from '@/stores/activityStore';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

export default function MessagesScreen() {
  const { activities, joinedActivityIds } = useActivityStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const joinedActivities = activities.filter((a) => joinedActivityIds.includes(a.id));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Chats</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {joinedActivities.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>Active activity chats</Text>
                {joinedActivities.map((activity) => {
                  const style = getCategoryStyle(activity.category_id);
                  return (
                    <AnimatedPressable
                      key={activity.id}
                      onPress={() => router.push(`/activity/${activity.id}/chat`)}
                      style={styles.chatItem}
                    >
                      <View style={[styles.chatIcon, { backgroundColor: style.bg }]}>
                        <Text style={styles.chatEmoji}>{activity.category?.icon}</Text>
                      </View>
                      <View style={styles.chatInfo}>
                        <Text style={styles.chatTitle}>{activity.category?.name}</Text>
                        <Text style={styles.chatMeta} numberOfLines={1}>
                          {activity.location_name} · {activity.participant_count} people
                        </Text>
                      </View>
                      <View style={styles.chatBadge}>
                        <View style={styles.chatDot} />
                      </View>
                    </AnimatedPressable>
                  );
                })}
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <MessageSquare size={32} color={theme.colors.textTertiary} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No chats yet</Text>
                <Text style={styles.emptySubtitle}>
                  Join an activity to start chatting with the group.
                </Text>
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
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.h1,
    letterSpacing: -0.5,
  },

  scrollContent: { paddingHorizontal: theme.spacing.xl },

  sectionLabel: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.micro,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
  },

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chatIcon: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  chatEmoji: { fontSize: 24 },
  chatInfo: { flex: 1 },
  chatTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.bodyLarge,
  },
  chatMeta: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.caption,
    marginTop: 4,
  },
  chatBadge: {
    marginLeft: theme.spacing.sm,
  },
  chatDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: theme.spacing.massive,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
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
    textAlign: 'center',
    maxWidth: 260,
  },
});
