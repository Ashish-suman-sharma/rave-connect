// ============================================================
// Rave Connect — Profile Screen (Redesigned)
// Compact horizontal profile card: Name on Left, Avatar on Right
// Dedicated to Ravensbourne University London
// ============================================================
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronRight,
  History,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Settings,
  Heart,
  Sparkles,
  Edit3,
  GraduationCap,
  CheckCircle2,
  Lock,
} from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useActivityStore } from '@/stores/activityStore';
import { useBlindDateStore } from '@/stores/blindDateStore';
import { useBlindDateUnlockStore } from '@/stores/blindDateUnlockStore';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { joinedActivityIds, activities } = useActivityStore();
  const { status: blindDateStatus, match: blindDateMatch } = useBlindDateStore();
  const { isUnlocked, isUserEligibleForInstantBypass } = useBlindDateUnlockStore();

  const isEligibleUnlocked = isUnlocked || isUserEligibleForInstantBypass(user);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const displayName = user?.name || 'Ashish';
  const university = user?.university || 'Ravensbourne University London';
  const avatarUrl = user?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/png?seed=Felix&backgroundColor=ffd5dc,b6e3f4';
  const genderLabel = user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Student';

  const currentUserId = user?.id || 'current-user';
  const myCreatedCount = activities.filter(
    (a) => a.creator_id === currentUserId || a.creator_id === 'current-user'
  ).length;

  const myJoinedCount = activities.filter(
    (a) => joinedActivityIds.includes(a.id) && a.creator_id !== currentUserId && a.creator_id !== 'current-user'
  ).length;

  const stats = [
    {
      label: 'Joined',
      value: myJoinedCount,
      onPress: () => router.push('/my-activities?tab=joined'),
    },
    {
      label: 'Created',
      value: myCreatedCount,
      onPress: () => router.push('/my-activities?tab=created'),
    },
    {
      label: 'Blind Date',
      value: !isEligibleUnlocked ? '🔒' : blindDateStatus === 'matched' ? '1 ❤️' : '0',
      onPress: () => {
        if (!isEligibleUnlocked) {
          router.push('/blind-date/unlock');
        } else {
          router.push('/blind-date');
        }
      },
    },
  ];

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <AnimatedPressable
              onPress={() => router.push('/settings')}
              style={styles.headerSettingsBtn}
            >
              <Settings size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
            </AnimatedPressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* ================= COMPACT PROFILE CARD ================= */}
            {/* Left side: Name & Campus | Right side: Avatar */}
            <View style={styles.compactProfileCard}>
              {/* Left Column */}
              <View style={styles.profileLeftCol}>
                <View style={styles.campusTagPill}>
                  <GraduationCap size={12} color="#101112" />
                  <Text style={styles.campusTagText}>Ravensbourne</Text>
                </View>

                <Text style={styles.profileName} numberOfLines={1}>
                  {displayName}
                </Text>

                <Text style={styles.profileUniversity} numberOfLines={2}>
                  {university}
                </Text>

                <View style={styles.badgeRow}>
                  <View style={styles.genderPill}>
                    <Text style={styles.genderPillText}>{genderLabel}</Text>
                  </View>

                  <AnimatedPressable
                    onPress={() => router.push('/(onboarding)')}
                    style={styles.editPillBtn}
                  >
                    <Edit3 size={11} color={theme.colors.textPrimary} />
                    <Text style={styles.editPillText}>Edit Avatar</Text>
                  </AnimatedPressable>
                </View>
              </View>

              {/* Right Column: Avatar */}
              <View style={styles.profileRightCol}>
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                  {/* Verified Check Badge */}
                  <View style={styles.verifiedBadge}>
                    <CheckCircle2 size={13} color="#101112" strokeWidth={3} />
                  </View>
                </View>
              </View>
            </View>

            {/* Stats Row — Interactive (Tap to view Joined or Created lists) */}
            <View style={styles.statsRow}>
              {stats.map((stat, idx) => (
                <View key={idx} style={styles.statCol}>
                  <AnimatedPressable
                    onPress={stat.onPress}
                    style={styles.statCard}
                    activeScale={0.95}
                  >
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <View style={styles.statLabelRow}>
                      <Text style={styles.statLabel} numberOfLines={1}>
                        {stat.label}
                      </Text>
                      <ChevronRight size={10} color={theme.colors.textTertiary} strokeWidth={2.5} />
                    </View>
                  </AnimatedPressable>
                </View>
              ))}
            </View>

            {/* Blind Date Quick Feature Banner */}
            <AnimatedPressable
              onPress={() => {
                if (!isEligibleUnlocked) {
                  router.push('/blind-date/unlock');
                } else {
                  router.push('/blind-date');
                }
              }}
              style={styles.blindDateBanner}
              activeScale={0.98}
            >
              <View style={styles.bannerIconBox}>
                {!isEligibleUnlocked ? (
                  <Lock size={18} color="#FFFFFF" strokeWidth={2.4} />
                ) : (
                  <Heart size={20} color="#FFFFFF" fill="#FF2E63" />
                )}
              </View>
              <View style={styles.bannerTextBox}>
                <View style={styles.bannerTitleRow}>
                  <Text style={styles.bannerTitle}>Blind Date</Text>
                  {!isEligibleUnlocked ? (
                    <View style={styles.bannerBadgeLocked}>
                      <Text style={styles.bannerBadgeLockedText}>🔒 Locked</Text>
                    </View>
                  ) : blindDateStatus === 'matched' ? (
                    <View style={styles.bannerBadgeMatched}>
                      <Text style={styles.bannerBadgeText}>Matched ❤️</Text>
                    </View>
                  ) : (
                    <View style={styles.bannerBadgeActive}>
                      <Text style={styles.bannerBadgeText}>Active 💫</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.bannerSub} numberOfLines={1}>
                  {!isEligibleUnlocked
                    ? '24h countdown active · Tap to unlock instantly'
                    : blindDateStatus === 'matched' && blindDateMatch
                    ? `Active chat with ${blindDateMatch.partner.codeName}`
                    : 'Anonymous 1-on-1 campus matching'}
                </Text>
              </View>
              <ChevronRight size={18} color="rgba(255, 255, 255, 0.6)" />
            </AnimatedPressable>

            {/* Menu Group 1: Activity & Notifications */}
            <Text style={styles.groupHeading}>ACTIVITIES</Text>
            <View style={styles.menuGroup}>
              <AnimatedPressable
                onPress={() => router.push('/my-activities?tab=joined')}
                style={styles.menuItem}
                activeScale={0.98}
              >
                <View style={styles.menuIconWrap}>
                  <History size={18} color={theme.colors.textPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>My Activities</Text>
                  <Text style={styles.menuSubLabel}>Joined & hosted events</Text>
                </View>
                <ChevronRight size={18} color={theme.colors.textTertiary} />
              </AnimatedPressable>

              <View style={styles.menuDivider} />

              <AnimatedPressable
                onPress={() => router.push('/notifications')}
                style={styles.menuItem}
                activeScale={0.98}
              >
                <View style={styles.menuIconWrap}>
                  <Bell size={18} color={theme.colors.textPrimary} />
                </View>
                <Text style={styles.menuLabel}>Notifications</Text>
                <ChevronRight size={18} color={theme.colors.textTertiary} />
              </AnimatedPressable>
            </View>

            {/* Menu Group 2: Settings, Privacy & Help */}
            <Text style={styles.groupHeading}>PREFERENCES & SUPPORT</Text>
            <View style={styles.menuGroup}>
              <AnimatedPressable
                onPress={() => router.push('/settings')}
                style={styles.menuItem}
                activeScale={0.98}
              >
                <View style={styles.menuIconWrap}>
                  <Settings size={18} color={theme.colors.textPrimary} />
                </View>
                <Text style={styles.menuLabel}>Settings</Text>
                <ChevronRight size={18} color={theme.colors.textTertiary} />
              </AnimatedPressable>

              <View style={styles.menuDivider} />

              <AnimatedPressable
                onPress={() => router.push('/privacy')}
                style={styles.menuItem}
                activeScale={0.98}
              >
                <View style={styles.menuIconWrap}>
                  <Shield size={18} color={theme.colors.textPrimary} />
                </View>
                <Text style={styles.menuLabel}>Privacy Policy</Text>
                <ChevronRight size={18} color={theme.colors.textTertiary} />
              </AnimatedPressable>

              <View style={styles.menuDivider} />

              <AnimatedPressable
                onPress={() => router.push('/support')}
                style={styles.menuItem}
                activeScale={0.98}
              >
                <View style={styles.menuIconWrap}>
                  <HelpCircle size={18} color={theme.colors.textPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>Help & Support</Text>
                  <Text style={styles.menuSubLabel}>theju8445@gmail.com</Text>
                </View>
                <ChevronRight size={18} color={theme.colors.textTertiary} />
              </AnimatedPressable>
            </View>

            {/* Log Out Button */}
            <AnimatedPressable onPress={handleLogout} style={styles.logoutBtn} activeScale={0.96}>
              <LogOut size={18} color={theme.colors.danger} />
              <Text style={styles.logoutText}>Log Out</Text>
            </AnimatedPressable>

            <Text style={styles.version}>Ravensbourne University London Edition · v1.0.0</Text>
            <View style={{ height: 100 }} />
          </ScrollView>
        </Animated.View>
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
  inner: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.h1,
    letterSpacing: -0.5,
  },
  headerSettingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  // ================= COMPACT PROFILE CARD =================
  compactProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceDark, // Deep obsidian black
    borderRadius: 26,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(200, 255, 61, 0.25)', // Lime spark subtle outline
    shadowColor: '#101112',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  profileLeftCol: {
    flex: 1,
    marginRight: 16,
  },
  campusTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  campusTagText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  profileName: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 22,
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  profileUniversity: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genderPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  genderPillText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
  },
  editPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  editPillText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },

  // Right Column Avatar
  profileRightCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
    borderColor: theme.colors.accent,
    backgroundColor: '#F3F0E6',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surfaceDark,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginBottom: 16,
    alignItems: 'stretch',
  },
  statCol: {
    flex: 1,
  },
  statCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#101112',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 20,
  },
  statLabel: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 3,
  },

  // Blind Date Banner
  blindDateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#180B15', // Luxury dark wine
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 46, 99, 0.35)',
    gap: 12,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 46, 99, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextBox: {
    flex: 1,
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 16,
  },
  bannerBadgeMatched: {
    backgroundColor: '#FF2E63',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  bannerBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  bannerBadgeLocked: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  bannerBadgeLockedText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  bannerBadgeText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  bannerSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
  },

  // Menu Groups
  groupHeading: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginLeft: 54,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 15,
  },
  menuSubLabel: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    marginTop: 1,
  },

  // Log out button
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  logoutText: {
    color: theme.colors.danger,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
  },
  version: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    textAlign: 'center',
  },
});
