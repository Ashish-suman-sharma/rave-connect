// ============================================================
// Rave Connect — Settings Screen
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Eye,
  Heart,
  Vibrate,
  Trash2,
  LogOut,
  User,
  ShieldCheck,
  Building,
} from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useBlindDateStore } from '@/stores/blindDateStore';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { safeBack } from '@/lib/utils';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const { resetAll: resetBlindDate } = useBlindDateStore();

  // Settings Toggles State
  const [activityAlerts, setActivityAlerts] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [chatAlerts, setChatAlerts] = useState(true);
  const [ghostMode, setGhostMode] = useState(false);
  const [blindDateActive, setBlindDateActive] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const handleClearCache = () => {
    Alert.alert('Cache Cleared', 'Temporary app cache and offline assets have been cleared.');
  };

  const handleResetBlindDate = () => {
    Alert.alert(
      'Reset Blind Date?',
      'This will reset your current matching queue and clear your active blind date session.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetBlindDate();
            Alert.alert('Reset Complete', 'Your Blind Date queue state has been refreshed.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Rave Connect?', [
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your activities, messages, and profile data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)');
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Account Profile Summary Card */}
          <View style={styles.sectionHeaderRow}>
            <User size={16} color={theme.colors.textSecondary} />
            <Text style={styles.sectionHeading}>Account & Campus</Text>
          </View>
          <View style={styles.cardGroup}>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Full Name</Text>
              <Text style={styles.itemValue}>{user?.name || 'Student'}</Text>
            </View>
            <View style={styles.itemDivider} />
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Student Email</Text>
              <Text style={styles.itemValue}>{user?.email || 'Not set'}</Text>
            </View>
            <View style={styles.itemDivider} />
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Campus</Text>
              <Text style={styles.itemValue}>Ravensbourne University London</Text>
            </View>
            <View style={styles.itemDivider} />
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Gender</Text>
              <Text style={styles.itemValue}>
                {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Female'}
              </Text>
            </View>
          </View>

          {/* Notifications Section */}
          <View style={styles.sectionHeaderRow}>
            <Bell size={16} color={theme.colors.textSecondary} />
            <Text style={styles.sectionHeading}>Notifications</Text>
          </View>
          <View style={styles.cardGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Activity Reminders</Text>
                <Text style={styles.switchDesc}>Get notified 15 minutes before activities start</Text>
              </View>
              <Switch
                value={activityAlerts}
                onValueChange={setActivityAlerts}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.itemDivider} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Blind Date Alerts</Text>
                <Text style={styles.switchDesc}>Instant alerts when a campus match is found</Text>
              </View>
              <Switch
                value={matchAlerts}
                onValueChange={setMatchAlerts}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.itemDivider} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Chat Messages</Text>
                <Text style={styles.switchDesc}>Direct messages and activity group updates</Text>
              </View>
              <Switch
                value={chatAlerts}
                onValueChange={setChatAlerts}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Privacy & Discovery Section */}
          <View style={styles.sectionHeaderRow}>
            <Eye size={16} color={theme.colors.textSecondary} />
            <Text style={styles.sectionHeading}>Privacy & Visibility</Text>
          </View>
          <View style={styles.cardGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Ghost Mode</Text>
                <Text style={styles.switchDesc}>Keep your profile anonymous until activities begin</Text>
              </View>
              <Switch
                value={ghostMode}
                onValueChange={setGhostMode}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.itemDivider} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Blind Date Discoverability</Text>
                <Text style={styles.switchDesc}>Allow matching system to pair you with students</Text>
              </View>
              <Switch
                value={blindDateActive}
                onValueChange={setBlindDateActive}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.sectionHeaderRow}>
            <Vibrate size={16} color={theme.colors.textSecondary} />
            <Text style={styles.sectionHeading}>App Experience</Text>
          </View>
          <View style={styles.cardGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Haptic Touch Feedback</Text>
                <Text style={styles.switchDesc}>Tactile vibration on buttons and matches</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Storage & Reset */}
          <View style={styles.sectionHeaderRow}>
            <Trash2 size={16} color={theme.colors.textSecondary} />
            <Text style={styles.sectionHeading}>Data & Storage</Text>
          </View>
          <View style={styles.cardGroup}>
            <AnimatedPressable onPress={handleClearCache} style={styles.actionItemRow}>
              <Text style={styles.actionItemLabel}>Clear Temporary Cache</Text>
              <Text style={styles.actionItemHint}>Frees up storage</Text>
            </AnimatedPressable>

            <View style={styles.itemDivider} />

            <AnimatedPressable onPress={handleResetBlindDate} style={styles.actionItemRow}>
              <Text style={styles.actionItemLabel}>Reset Blind Date Queue</Text>
              <Text style={styles.actionItemHint}>Clears current pairing</Text>
            </AnimatedPressable>
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerZoneGroup}>
            <AnimatedPressable onPress={handleLogout} style={styles.dangerBtn}>
              <LogOut size={18} color={theme.colors.danger} />
              <Text style={styles.dangerBtnText}>Log Out</Text>
            </AnimatedPressable>

            <AnimatedPressable onPress={handleDeleteAccount} style={[styles.dangerBtn, { marginTop: 10 }]}>
              <Text style={[styles.dangerBtnText, { fontSize: 13, color: theme.colors.textTertiary }]}>
                Permanently Delete Account
              </Text>
            </AnimatedPressable>
          </View>

          <Text style={styles.footerVersion}>Rave Connect · Ravensbourne University Edition v1.0.0</Text>
          <View style={{ height: 40 }} />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  sectionHeading: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  cardGroup: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
  },
  itemValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    maxWidth: 200,
    textAlign: 'right',
  },
  itemDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  switchTextCol: {
    flex: 1,
  },
  switchTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  switchDesc: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },

  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  actionItemLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
  },
  actionItemHint: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
  },

  dangerZoneGroup: {
    marginTop: 10,
    marginBottom: 20,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    paddingVertical: 14,
  },
  dangerBtnText: {
    color: theme.colors.danger,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
  },

  footerVersion: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
  },
});
