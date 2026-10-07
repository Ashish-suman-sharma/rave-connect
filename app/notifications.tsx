// ============================================================
// Rave Connect — Notifications Screen
// ============================================================
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Bell, Calendar, MessageCircle, UserPlus } from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { safeBack } from '@/lib/utils';

export default function NotificationsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const notifications = [
    {
      id: '1',
      type: 'activity_starting',
      title: 'Coffee in Canary Wharf is starting soon',
      time: '10m ago',
      icon: <Calendar size={18} color={theme.colors.accent} />,
      isRead: false,
    },
    {
      id: '2',
      type: 'new_message',
      title: 'New message in Gaming',
      time: '1h ago',
      icon: <MessageCircle size={18} color={theme.colors.secondary} />,
      isRead: false,
    },
    {
      id: '3',
      type: 'connection',
      title: 'Someone wants to connect with you',
      time: '2h ago',
      icon: <UserPlus size={18} color={theme.colors.success} />,
      isRead: true,
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Pressable onPress={() => safeBack('/(tabs)')} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {notifications.map((notif) => (
            <Pressable 
              key={notif.id} 
              style={[
                styles.notificationItem, 
                !notif.isRead && styles.notificationUnread
              ]}
            >
              <View style={styles.iconContainer}>
                {notif.icon}
              </View>
              <View style={styles.contentContainer}>
                <Text style={styles.title}>{notif.title}</Text>
                <Text style={styles.time}>{notif.time}</Text>
              </View>
              {!notif.isRead && <View style={styles.unreadDot} />}
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.h3,
    fontWeight: '700',
  },
  list: {
    padding: theme.spacing.lg,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notificationUnread: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.borderLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    color: theme.colors.textTertiary,
    fontSize: theme.typography.sizes.caption,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    marginLeft: theme.spacing.sm,
  },
});
