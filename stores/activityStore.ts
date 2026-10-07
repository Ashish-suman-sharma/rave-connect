import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy, 
  arrayUnion, 
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Activity } from '@/types';
import { ACTIVITY_CATEGORIES } from '@/lib/constants';

const JOINED_STORAGE_KEY = '@rave_joined_activity_ids';

const saveCachedJoinedIds = async (ids: string[]) => {
  try {
    await AsyncStorage.setItem(JOINED_STORAGE_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to cache joined ids:', err);
  }
};

interface ActivityState {
  activities: Activity[];
  selectedActivity: Activity | null;
  joinedActivityIds: string[];
  isLoading: boolean;
  filter: string | null;

  initializeActivities: () => () => void;
  syncUserJoined: (userId: string) => () => void;
  isActivityJoined: (activityId: string, creatorId?: string) => boolean;
  addActivity: (activityData: any) => Promise<string | undefined>;
  joinActivity: (activityId: string) => Promise<void>;
  leaveActivity: (activityId: string) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;
  setFilter: (filter: string | null) => void;
  selectActivity: (activity: Activity | null) => void;
  
  // Legacy aliases
  loadMockData: () => void;
  fetchActivities: () => Promise<void>;
  fetchJoinedActivities: () => Promise<void>;
}

let userUnsubscribe: (() => void) | null = null;

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  selectedActivity: null,
  joinedActivityIds: [],
  isLoading: true,
  filter: null,

  initializeActivities: () => {
    set({ isLoading: true });

    // 1. Immediately load persisted joinedActivityIds from AsyncStorage for zero-delay UI
    AsyncStorage.getItem(JOINED_STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              set((state) => ({
                joinedActivityIds: [...new Set([...state.joinedActivityIds, ...parsed])],
              }));
            }
          } catch (e) {
            console.error('Error parsing stored joined ids', e);
          }
        }
      })
      .catch(console.error);

    // 2. Listen to all activities from Firestore
    const q = query(collection(db, 'activities'), orderBy('start_time', 'asc'));
    const unsubscribeActivities = onSnapshot(
      q,
      (snapshot) => {
        const activitiesData: Activity[] = [];
        const currentUserId = auth.currentUser?.uid;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const category = ACTIVITY_CATEGORIES.find((c) => c.id === data.category_id);

          activitiesData.push({
            id: docSnap.id,
            creator_id: data.creator_id,
            category_id: data.category_id,
            title: data.title || category?.name || '',
            description: data.description || null,
            location_name: data.location_name,
            start_time: data.start_time,
            max_participants: data.max_participants || null,
            participant_count: data.participant_count || 1,
            status: data.status || 'UPCOMING',
            created_at: data.created_at || new Date().toISOString(),
            category,
          } as Activity);
        });

        // Auto-include activities created by the current user into joinedActivityIds
        if (currentUserId) {
          const userCreatedIds = activitiesData
            .filter((a) => a.creator_id === currentUserId)
            .map((a) => a.id);
          if (userCreatedIds.length > 0) {
            const merged = [...new Set([...get().joinedActivityIds, ...userCreatedIds])];
            set({ joinedActivityIds: merged });
            saveCachedJoinedIds(merged);
          }
        }

        set({ activities: activitiesData, isLoading: false });
      },
      (error) => {
        console.error('Error fetching activities:', error);
        set({ isLoading: false });
      }
    );

    // 3. Attach user joined activities listener if user is logged in
    const userId = auth.currentUser?.uid;
    if (userId) {
      get().syncUserJoined(userId);
    }

    return () => {
      unsubscribeActivities();
      if (userUnsubscribe) userUnsubscribe();
    };
  },

  syncUserJoined: (userId: string) => {
    if (userUnsubscribe) {
      userUnsubscribe();
      userUnsubscribe = null;
    }

    const userRef = doc(db, 'profiles', userId);
    userUnsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.joined_activities)) {
          const merged = [...new Set([...get().joinedActivityIds, ...data.joined_activities])];
          set({ joinedActivityIds: merged });
          saveCachedJoinedIds(merged);
        }
      }
    });

    return () => {
      if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = null;
      }
    };
  },

  isActivityJoined: (activityId: string, creatorId?: string) => {
    const { joinedActivityIds } = get();
    const currentUserId = auth.currentUser?.uid;
    if (joinedActivityIds.includes(activityId)) return true;
    if (currentUserId && creatorId && creatorId === currentUserId) return true;
    return false;
  },

  addActivity: async (activityData) => {
    const userId = auth.currentUser?.uid || 'user_' + Date.now();

    try {
      const newActivity = {
        ...activityData,
        creator_id: userId,
        participant_count: 1, // Creator is automatically the first participant
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'activities'), newActivity);
      const newActivityId = docRef.id;

      // 1. Immediately mark creator as joined in store
      const updatedJoined = [...new Set([...get().joinedActivityIds, newActivityId])];
      set({ joinedActivityIds: updatedJoined });
      await saveCachedJoinedIds(updatedJoined);

      // 2. Persist to Firestore profile if authenticated
      if (auth.currentUser?.uid) {
        try {
          await updateDoc(doc(db, 'profiles', userId), {
            joined_activities: arrayUnion(newActivityId),
          });
        } catch (e) {
          console.warn('Could not update profile joined_activities:', e);
        }
      }

      return newActivityId;
    } catch (err) {
      console.error('Failed to create activity:', err);
    }
  },

  joinActivity: async (activityId: string) => {
    const userId = auth.currentUser?.uid;
    const { joinedActivityIds, activities } = get();
    if (joinedActivityIds.includes(activityId)) return;

    const newJoined = [...new Set([...joinedActivityIds, activityId])];
    set({
      joinedActivityIds: newJoined,
      activities: activities.map((a) =>
        a.id === activityId ? { ...a, participant_count: a.participant_count + 1 } : a
      ),
    });
    await saveCachedJoinedIds(newJoined);

    if (!userId) return;

    try {
      // Get current participant count and increment
      const activityRef = doc(db, 'activities', activityId);
      const actDoc = await getDoc(activityRef);
      if (actDoc.exists()) {
        const currentCount = actDoc.data().participant_count || 0;
        await updateDoc(activityRef, { participant_count: currentCount + 1 });
      }

      // Add to user's joined list
      await updateDoc(doc(db, 'profiles', userId), {
        joined_activities: arrayUnion(activityId),
      });
    } catch (err) {
      console.error('Failed to join activity on Firestore:', err);
    }
  },

  leaveActivity: async (activityId: string) => {
    const userId = auth.currentUser?.uid;
    const { joinedActivityIds, activities } = get();
    const newJoined = joinedActivityIds.filter((id) => id !== activityId);

    set({
      joinedActivityIds: newJoined,
      activities: activities.map((a) =>
        a.id === activityId ? { ...a, participant_count: Math.max(1, a.participant_count - 1) } : a
      ),
    });
    await saveCachedJoinedIds(newJoined);

    if (!userId) return;

    try {
      // Get current participant count and decrement
      const activityRef = doc(db, 'activities', activityId);
      const actDoc = await getDoc(activityRef);
      if (actDoc.exists()) {
        const currentCount = actDoc.data().participant_count || 1;
        await updateDoc(activityRef, { participant_count: Math.max(1, currentCount - 1) });
      }

      // Remove from user's joined list
      await updateDoc(doc(db, 'profiles', userId), {
        joined_activities: arrayRemove(activityId),
      });
    } catch (err) {
      console.error('Failed to leave activity on Firestore:', err);
    }
  },

  deleteActivity: async (activityId: string) => {
    const { activities, joinedActivityIds } = get();
    const updatedActivities = activities.filter((a) => a.id !== activityId);
    const updatedJoined = joinedActivityIds.filter((id) => id !== activityId);

    set({ activities: updatedActivities, joinedActivityIds: updatedJoined });
    await saveCachedJoinedIds(updatedJoined);

    try {
      await deleteDoc(doc(db, 'activities', activityId));
    } catch (err) {
      console.warn('Failed to delete activity on Firestore:', err);
    }
  },

  setFilter: (filter) => set({ filter }),
  selectActivity: (activity) => set({ selectedActivity: activity }),

  loadMockData: () => {
    get().initializeActivities(); // Redirect legacy call to real Firebase init
  },
  fetchActivities: async () => {},
  fetchJoinedActivities: async () => {},
}));
