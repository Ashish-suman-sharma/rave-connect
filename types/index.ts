// ============================================================
// Rave Connect — Core Types
// ============================================================

// Activity status lifecycle
export type ActivityStatus =
  | 'UPCOMING'
  | 'STARTING'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FULL';

// Connection status between users
export type ConnectionStatus =
  | 'PENDING'
  | 'CONNECTED'
  | 'BLOCKED'
  | 'REJECTED';

// Participant status within an activity
export type ParticipantStatus =
  | 'JOINED'
  | 'LEFT'
  | 'REMOVED';

// Report status
export type ReportStatus =
  | 'PENDING'
  | 'REVIEWED'
  | 'RESOLVED'
  | 'DISMISSED';

// ============================================================
// Activity Category
// ============================================================
export interface ActivityCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

// ============================================================
// Activity
// ============================================================
export interface Activity {
  id: string;
  creator_id: string;
  category_id: string;
  category?: ActivityCategory;
  title: string;
  description: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  start_time: string; // ISO 8601
  max_participants: number | null;
  participant_count: number;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
}

// ============================================================
// User Profile
// ============================================================
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_photo?: string | null;
  avatar_url?: string | null;
  university?: string | null;
  course?: string | null;
  year?: number | null;
  bio?: string | null;
  city?: string | null;
  interests?: string[];
  gender?: 'male' | 'female' | 'other' | string | null;
  date_of_birth?: string | null;
  is_onboarded: boolean;
  created_at: string;
  updated_at?: string;
}

export type User = UserProfile;

// ============================================================
// Activity Participant (limited view)
// ============================================================
export interface ActivityParticipant {
  id: string;
  activity_id: string;
  user_id: string;
  joined_at: string;
  status: ParticipantStatus;
}

// ============================================================
// Connection
// ============================================================
export interface Connection {
  id: string;
  user_a: string;
  user_b: string;
  activity_id: string | null;
  status: ConnectionStatus;
  created_at: string;
}

// ============================================================
// Activity Message (chat)
// ============================================================
export interface ActivityMessage {
  id: string;
  activity_id: string;
  sender_id: string;
  sender_name?: string;
  message: string;
  created_at: string;
}

// ============================================================
// Report
// ============================================================
export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  activity_id: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  created_at: string;
}

// ============================================================
// UI / Navigation types
// ============================================================
export type MainTab = 'home' | 'discover' | 'create' | 'messages' | 'profile';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

// Create activity form data
export interface CreateActivityForm {
  category_id: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  start_time: string;
  description?: string;
  max_participants?: number;
}

// Auth form types
export interface SignUpForm {
  email: string;
  password: string;
  name: string;
  date_of_birth: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

// Onboarding form
export interface OnboardingForm {
  name: string;
  university: string;
  course: string;
  year: number;
  interests: string[];
  city: string;
}
