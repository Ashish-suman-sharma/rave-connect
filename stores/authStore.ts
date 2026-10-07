// ============================================================
// Rave Connect — Auth Store (Firebase)
// ============================================================
import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';
import { useActivityStore } from '@/stores/activityStore';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isOnboarded: boolean;

  initialize: () => void;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setOnboarded: (val: boolean) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,
  isOnboarded: false,

  initialize: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        set({ firebaseUser });
        
        // Sync joined activities in activityStore
        useActivityStore.getState().syncUserJoined(firebaseUser.uid);

        // Fetch user profile from Firestore
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            set({
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: data.name || '',
                avatar_url: data.avatar_url || null,
                profile_photo: data.profile_photo || null,
                university: data.university || null,
                course: data.course || null,
                year: data.year || null,
                bio: data.bio || null,
                city: data.city || null,
                interests: data.interests || [],
                gender: data.gender || null,
                date_of_birth: data.date_of_birth || null,
                created_at: data.created_at || new Date().toISOString(),
                is_onboarded: data.is_onboarded === true,
              },
              isOnboarded: data.is_onboarded === true,
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        set({ firebaseUser: null, user: null, isOnboarded: false });
      }
      set({ isLoading: false });
    });
  },

  signIn: async (email, pass) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  },

  signUp: async (email, pass, name) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, pass);
      
      // Create user profile in Firestore
      const newProfile = {
        name,
        email,
        is_onboarded: false,
        created_at: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'profiles', user.uid), newProfile);
      
      set({
        user: {
          id: user.uid,
          ...newProfile
        } as User,
      });

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Signup failed' };
    }
  },

  signOut: async () => {
    await signOut(auth);
    set({ firebaseUser: null, user: null, isOnboarded: false });
  },

  setOnboarded: (val) => set({ isOnboarded: val }),
  setUser: (user) => set({ user }),
}));
