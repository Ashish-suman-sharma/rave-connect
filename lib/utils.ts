// ============================================================
// Rave Connect — Utility Functions
// ============================================================

import { differenceInSeconds, format, isToday, isTomorrow } from 'date-fns';
import { router } from 'expo-router';

/**
 * Safely navigates back if there is a screen in history,
 * otherwise falls back to a default route (defaults to '/(tabs)')
 */
export function safeBack(fallbackRoute: string = '/(tabs)'): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackRoute as any);
  }
}

/**
 * Format countdown from seconds remaining
 */
export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Calculate seconds remaining until a target time
 */
export function getSecondsUntil(targetTime: string): number {
  const target = new Date(targetTime);
  const now = new Date();
  const diff = differenceInSeconds(target, now);
  return Math.max(0, diff);
}

/**
 * Format activity time for display
 */
export function formatActivityTime(startTime: string): string {
  const date = new Date(startTime);

  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, 'h:mm a')}`;
  }
  return format(date, 'EEE d MMM, h:mm a');
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/**
 * Get relative time label (e.g. "Starts in 34 min")
 */
export function getRelativeTimeLabel(startTime: string): string {
  const seconds = getSecondsUntil(startTime);

  if (seconds <= 0) return 'Starting now';
  if (seconds < 60) return 'Starting soon';
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `Starts in ${mins} min`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (mins === 0) return `Starts in ${hours}h`;
  return `Starts in ${hours}h ${mins}m`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Generate mock activity data for development
 */
export function generateMockActivities() {
  const now = new Date();

  return [
    {
      id: '1',
      creator_id: 'user-1',
      category_id: 'coffee',
      category: { id: 'coffee', name: 'Coffee', icon: '☕', description: 'Grab a coffee', is_active: true, sort_order: 1 },
      title: 'Coffee',
      description: 'Trying a new coffee spot after class.',
      location_name: 'Canary Wharf',
      latitude: 51.5054,
      longitude: -0.0235,
      start_time: new Date(now.getTime() + 34 * 60 * 1000 + 18 * 1000).toISOString(),
      max_participants: 20,
      participant_count: 12,
      status: 'UPCOMING' as const,
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      creator_id: 'user-2',
      category_id: 'food',
      category: { id: 'food', name: 'Food', icon: '🍔', description: 'Get food', is_active: true, sort_order: 2 },
      title: 'Food',
      description: 'Late dinner after class. Open to everyone!',
      location_name: 'North Greenwich',
      latitude: 51.5003,
      longitude: 0.0034,
      start_time: new Date(now.getTime() + 72 * 60 * 1000 + 42 * 1000).toISOString(),
      max_participants: null,
      participant_count: 7,
      status: 'UPCOMING' as const,
      created_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      creator_id: 'user-3',
      category_id: 'gaming',
      category: { id: 'gaming', name: 'Gaming', icon: '🎮', description: 'Play games', is_active: true, sort_order: 3 },
      title: 'Gaming',
      description: 'Looking for people to play tonight. Any game works.',
      location_name: 'Stratford',
      latitude: 51.5415,
      longitude: -0.0035,
      start_time: new Date(now.getTime() + 48 * 60 * 1000 + 9 * 1000).toISOString(),
      max_participants: 8,
      participant_count: 5,
      status: 'UPCOMING' as const,
      created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      creator_id: 'user-4',
      category_id: 'explore',
      category: { id: 'explore', name: 'Explore', icon: '🌆', description: 'Explore the city', is_active: true, sort_order: 9 },
      title: 'Explore',
      description: 'Exploring Southbank this evening. Let\'s discover something new.',
      location_name: 'Southbank',
      latitude: 51.5055,
      longitude: -0.1146,
      start_time: new Date(now.getTime() + 95 * 60 * 1000).toISOString(),
      max_participants: 15,
      participant_count: 8,
      status: 'UPCOMING' as const,
      created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      creator_id: 'user-5',
      category_id: 'study',
      category: { id: 'study', name: 'Study', icon: '📚', description: 'Study session', is_active: true, sort_order: 8 },
      title: 'Study',
      description: 'Group study session for finals. Bring your laptop.',
      location_name: 'Greenwich',
      latitude: 51.4769,
      longitude: -0.0005,
      start_time: new Date(now.getTime() + 120 * 60 * 1000).toISOString(),
      max_participants: 12,
      participant_count: 4,
      status: 'UPCOMING' as const,
      created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      creator_id: 'user-6',
      category_id: 'going-out',
      category: { id: 'going-out', name: 'Going Out', icon: '🎉', description: 'Go out tonight', is_active: true, sort_order: 10 },
      title: 'Going Out',
      description: 'Hitting the bars in Shoreditch tonight. The more the merrier!',
      location_name: 'Shoreditch',
      latitude: 51.5233,
      longitude: -0.0755,
      start_time: new Date(now.getTime() + 180 * 60 * 1000).toISOString(),
      max_participants: 25,
      participant_count: 16,
      status: 'UPCOMING' as const,
      created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '7',
      creator_id: 'user-7',
      category_id: 'walk',
      category: { id: 'walk', name: 'Walk', icon: '🚶', description: 'Go for a walk', is_active: true, sort_order: 5 },
      title: 'Walk',
      description: 'Sunset walk along the Thames. Peaceful vibes.',
      location_name: 'Westminster',
      latitude: 51.4975,
      longitude: -0.1357,
      start_time: new Date(now.getTime() + 55 * 60 * 1000).toISOString(),
      max_participants: null,
      participant_count: 3,
      status: 'UPCOMING' as const,
      created_at: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '8',
      creator_id: 'user-8',
      category_id: 'talk',
      category: { id: 'talk', name: 'Talk', icon: '💬', description: 'Meet and talk', is_active: true, sort_order: 11 },
      title: 'Talk',
      description: 'New to London and just want to meet people. No agenda.',
      location_name: "King's Cross",
      latitude: 51.5308,
      longitude: -0.1238,
      start_time: new Date(now.getTime() + 25 * 60 * 1000).toISOString(),
      max_participants: 6,
      participant_count: 2,
      status: 'UPCOMING' as const,
      created_at: new Date(now.getTime() - 0.5 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}
