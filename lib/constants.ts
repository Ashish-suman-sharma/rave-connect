// ============================================================
// Rave Connect — Design Tokens & Constants
// ============================================================

// ---- ACTIVITY CATEGORIES ----
export const ACTIVITY_CATEGORIES = [
  { id: 'coffee', name: 'Coffee', icon: '☕', description: 'Grab a coffee with someone' },
  { id: 'food', name: 'Food', icon: '🍔', description: 'Get food together' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', description: 'Play games together' },
  { id: 'movie', name: 'Movie', icon: '🎬', description: 'Watch a movie together' },
  { id: 'walk', name: 'Walk', icon: '🚶', description: 'Go for a walk' },
  { id: 'gym', name: 'Gym', icon: '🏋️', description: 'Hit the gym together' },
  { id: 'football', name: 'Football', icon: '⚽', description: 'Play football' },
  { id: 'study', name: 'Study', icon: '📚', description: 'Study session' },
  { id: 'explore', name: 'Explore', icon: '🌆', description: 'Explore the city' },
  { id: 'going-out', name: 'Going Out', icon: '🎉', description: 'Go out tonight' },
  { id: 'talk', name: 'Talk', icon: '💬', description: 'Meet and talk' },
] as const;

// ---- LONDON LOCATIONS ----
export const LOCATIONS = [
  { name: 'North Greenwich', latitude: 51.5003, longitude: 0.0034 },
  { name: 'Greenwich', latitude: 51.4769, longitude: -0.0005 },
  { name: 'Canary Wharf', latitude: 51.5054, longitude: -0.0235 },
  { name: 'Stratford', latitude: 51.5415, longitude: -0.0035 },
  { name: 'Central London', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Westminster', latitude: 51.4975, longitude: -0.1357 },
  { name: "King's Cross", latitude: 51.5308, longitude: -0.1238 },
  { name: 'Shoreditch', latitude: 51.5233, longitude: -0.0755 },
  { name: 'Camden', latitude: 51.5391, longitude: -0.1426 },
  { name: 'Southbank', latitude: 51.5055, longitude: -0.1146 },
  { name: 'Brixton', latitude: 51.4613, longitude: -0.1156 },
  { name: 'Hackney', latitude: 51.5450, longitude: -0.0553 },
] as const;

// ---- UNIVERSITIES ----
export const UNIVERSITIES = [
  'University of Greenwich',
  'King\'s College London',
  'University College London',
  'Imperial College London',
  'London School of Economics',
  'Queen Mary University',
  'City, University of London',
  'University of Westminster',
  'Goldsmiths, University of London',
  'SOAS University of London',
  'Brunel University London',
  'London Metropolitan University',
  'University of East London',
  'Kingston University',
  'Middlesex University',
  'University of the Arts London',
  'Ravensbourne University London',
  'Other',
] as const;

// ---- INTERESTS ----
export const INTERESTS = [
  'Coffee', 'Food', 'Gaming', 'Movies', 'Music', 'Football',
  'Basketball', 'Gym', 'Yoga', 'Reading', 'Photography',
  'Art', 'Tech', 'Coding', 'Travel', 'Fashion', 'Cooking',
  'Nightlife', 'Comedy', 'Theatre', 'Volunteering', 'Startups',
  'Dancing', 'Hiking', 'Running', 'Cycling', 'Swimming',
] as const;

// ---- ACTIVITY LIMITS ----
export const ACTIVITY_LIMITS = {
  MAX_ACTIVE_ACTIVITIES_PER_USER: 3,
  MIN_PARTICIPANTS: 1,
  MAX_PARTICIPANTS: 50,
  MIN_DESCRIPTION_LENGTH: 0,
  MAX_DESCRIPTION_LENGTH: 200,
  ACTIVITY_DURATION_HOURS: 4, // Activity auto-completes after this
} as const;

// ---- AGE REQUIREMENT ----
export const MIN_AGE = 18;
