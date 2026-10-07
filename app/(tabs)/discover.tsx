// ============================================================
// Rave Connect — Discover Screen (Professional Modern)
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, Flame, Clock, MapPin, TrendingUp, Compass } from 'lucide-react-native';
import { theme, getCategoryStyle } from '@/lib/theme';
import { ACTIVITY_CATEGORIES } from '@/lib/constants';
import { useActivityStore } from '@/stores/activityStore';
import ActivityCard from '@/components/activity/ActivityCard';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

type DiscoverSection = 'nearby' | 'trending' | 'starting-soon' | 'tonight';

export default function DiscoverScreen() {
  const { activities, joinActivity, joinedActivityIds, loadMockData } = useActivityStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<DiscoverSection>('nearby');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activities.length === 0) loadMockData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const filteredActivities = searchQuery
    ? activities.filter(
        (a) =>
          a.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activities;

  const getSectionActivities = () => {
    switch (activeSection) {
      case 'starting-soon':
        return [...filteredActivities].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      case 'trending':
        return [...filteredActivities].sort((a, b) => b.participant_count - a.participant_count);
      case 'tonight': {
        const tonight = new Date();
        tonight.setHours(23, 59, 59, 999);
        return filteredActivities.filter((a) => new Date(a.start_time).getTime() <= tonight.getTime());
      }
      default:
        return filteredActivities;
    }
  };

  const sectionActivities = getSectionActivities();

  const sections: { key: DiscoverSection; label: string; icon: React.ReactNode }[] = [
    { key: 'nearby', label: 'Nearby', icon: <MapPin size={16} color={activeSection === 'nearby' ? theme.colors.textOnAccent : theme.colors.textSecondary} strokeWidth={2.5} /> },
    { key: 'trending', label: 'Popular', icon: <Flame size={16} color={activeSection === 'trending' ? theme.colors.textOnAccent : theme.colors.textSecondary} strokeWidth={2.5} /> },
    { key: 'starting-soon', label: 'Soon', icon: <Clock size={16} color={activeSection === 'starting-soon' ? theme.colors.textOnAccent : theme.colors.textSecondary} strokeWidth={2.5} /> },
    { key: 'tonight', label: 'Tonight', icon: <TrendingUp size={16} color={activeSection === 'tonight' ? theme.colors.textOnAccent : theme.colors.textSecondary} strokeWidth={2.5} /> },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Discover</Text>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Search size={18} color={theme.colors.textTertiary} strokeWidth={2.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search activities, places..."
              placeholderTextColor={theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>

          {/* Section Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
            style={styles.tabsScroll}
          >
            {sections.map((s) => (
              <AnimatedPressable
                key={s.key}
                onPress={() => setActiveSection(s.key)}
                style={[styles.tab, activeSection === s.key && styles.tabActive]}
                hapticFeedback={false}
              >
                {s.icon}
                <Text style={[styles.tabText, activeSection === s.key && styles.tabTextActive]}>
                  {s.label}
                </Text>
              </AnimatedPressable>
            ))}
          </ScrollView>

          {/* Category grid */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catGrid}
            style={styles.catGridScroll}
          >
            {ACTIVITY_CATEGORIES.map((cat) => {
              const count = activities.filter((a) => a.category_id === cat.id).length;
              const style = getCategoryStyle(cat.id);
              return (
                <AnimatedPressable
                  key={cat.id}
                  style={[styles.catCard, { backgroundColor: style.bg }]}
                >
                  <Text style={styles.catEmoji}>{cat.icon}</Text>
                  <Text style={[styles.catName, { color: style.text }]}>{cat.name}</Text>
                  {count > 0 && <Text style={styles.catCount}>{count} active</Text>}
                </AnimatedPressable>
              );
            })}
          </ScrollView>

          {/* Results */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.results}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {activeSection === 'nearby' && 'Nearby'}
                {activeSection === 'trending' && 'Most popular'}
                {activeSection === 'starting-soon' && 'Starting soon'}
                {activeSection === 'tonight' && 'Happening tonight'}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.resultsCount}>{sectionActivities.length}</Text>
              </View>
            </View>

            {sectionActivities.length > 0 ? (
              sectionActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onPress={() => router.push(`/activity/${activity.id}`)}
                  onJoin={() => {
                    if (!joinedActivityIds.includes(activity.id)) joinActivity(activity.id);
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Compass size={32} color={theme.colors.textTertiary} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No activities found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search</Text>
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
    paddingBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.h1,
    letterSpacing: -0.5,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 52,
    gap: theme.spacing.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.body,
  },

  tabsScroll: { marginBottom: theme.spacing.lg },
  tabsContainer: { paddingHorizontal: theme.spacing.xl, gap: theme.spacing.sm },
  tab: {
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
  tabActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.caption,
  },
  tabTextActive: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
  },

  catGridScroll: { marginBottom: theme.spacing.xl },
  catGrid: { paddingHorizontal: theme.spacing.xl, gap: theme.spacing.sm },
  catCard: {
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    minWidth: 100,
    gap: 6,
  },
  catEmoji: { fontSize: 28 },
  catName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.caption,
  },
  catCount: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.micro,
  },

  results: { paddingHorizontal: theme.spacing.xl },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  resultsTitle: {
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
  resultsCount: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.micro,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: theme.spacing.huge,
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
  },
});
