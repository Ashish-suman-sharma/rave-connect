// ============================================================
// Rave Connect — Blind Date Unlock Store
// 24-Hour Persistence, WhatsApp Referral & Real-Time Tracking
// ============================================================
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert } from 'react-native';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { User } from '@/types';

const STORAGE_UNLOCK_KEY = '@rave_blind_date_unlock_v2';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export interface BlindDateUnlockState {
  isUnlocked: boolean;
  unlockStartedAt: number | null; // Timestamp in milliseconds
  hasShared: boolean;
  sharedAt: number | null;
  referralCode: string;
  referralsCount: number;
  isLoading: boolean;

  // Actions
  initialize: (user: User | null) => () => void;
  startCountdown: (userId?: string) => Promise<void>;
  shareOnWhatsApp: (userId?: string) => Promise<void>;
  simulateFriendClick: (userId?: string) => Promise<void>;
  checkAutoUnlock: (userId?: string) => boolean;
  getRemainingMs: () => number;
  formatCountdown: (remainingMs: number) => string;
  getReferralUrl: (code?: string) => string;
  isUserEligibleForInstantBypass: (user: User | null) => boolean;
}

export const useBlindDateUnlockStore = create<BlindDateUnlockState>((set, get) => ({
  isUnlocked: false,
  unlockStartedAt: null,
  hasShared: false,
  sharedAt: null,
  referralCode: '',
  referralsCount: 0,
  isLoading: true,

  // Rule 7: Female registration exception
  isUserEligibleForInstantBypass: (user: User | null) => {
    if (!user) return false;
    const g = (user.gender || '').toLowerCase().trim();
    return g === 'female' || g === 'girl';
  },

  getReferralUrl: (code?: string) => {
    const ref = code || get().referralCode || 'RAVE';
    const baseUrl = (process.env.EXPO_PUBLIC_PORTAL_URL || 'https://raveup-website.vercel.app').replace(/\/$/, '');
    return `${baseUrl}/invite?ref=${ref}`;
  },

  getRemainingMs: () => {
    const { unlockStartedAt, isUnlocked } = get();
    if (isUnlocked || !unlockStartedAt) return 0;
    const elapsed = Date.now() - unlockStartedAt;
    return Math.max(0, TWENTY_FOUR_HOURS_MS - elapsed);
  },

  formatCountdown: (remainingMs: number) => {
    if (remainingMs <= 0) return '00:00:00';
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  initialize: (user: User | null) => {
    // 1. Check girl registration exception first
    if (get().isUserEligibleForInstantBypass(user)) {
      set({ isUnlocked: true, isLoading: false });
      return () => {};
    }

    const userId = user?.id || auth.currentUser?.uid;
    const defaultRefCode = (userId ? userId.slice(0, 8) : 'RAVE').toUpperCase();
    set({ referralCode: defaultRefCode });

    // 2. Load cached local state for instant rendering
    AsyncStorage.getItem(STORAGE_UNLOCK_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const now = Date.now();
          const autoUnlocked = Boolean(parsed.unlockStartedAt && now >= parsed.unlockStartedAt + TWENTY_FOUR_HOURS_MS);
          
          set({
            isUnlocked: Boolean(parsed.isUnlocked || autoUnlocked),
            unlockStartedAt: parsed.unlockStartedAt || null,
            hasShared: !!parsed.hasShared,
            sharedAt: parsed.sharedAt || null,
            referralCode: parsed.referralCode || defaultRefCode,
            referralsCount: parsed.referralsCount || 0,
            isLoading: false,
          });
        } catch (e) {
          console.warn('Error reading unlock state from storage:', e);
        }
      }
    });

    if (!userId) {
      set({ isLoading: false });
      return () => {};
    }

    // 3. Listen to user profile & referrals in Firestore in real-time
    const userDocRef = doc(db, 'profiles', userId);
    const unsubscribeProfile = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const now = Date.now();
        const startedAt = data.unlock_started_at ? Number(data.unlock_started_at) : get().unlockStartedAt;
        const autoUnlocked = Boolean(startedAt && now >= startedAt + TWENTY_FOUR_HOURS_MS);
        const unlocked = Boolean(data.blind_date_unlocked === true || autoUnlocked);
        const hasShared = Boolean(data.has_shared === true || get().hasShared);
        const refCount = Number(data.referrals_count || 0);

        set({
          isUnlocked: unlocked,
          unlockStartedAt: startedAt,
          hasShared,
          referralsCount: refCount,
          referralCode: data.referral_code || defaultRefCode,
          isLoading: false,
        });

        // Sync to AsyncStorage
        AsyncStorage.setItem(
          STORAGE_UNLOCK_KEY,
          JSON.stringify({
            isUnlocked: unlocked,
            unlockStartedAt: startedAt,
            hasShared,
            referralsCount: refCount,
            referralCode: data.referral_code || defaultRefCode,
          })
        ).catch(() => {});
      }
    });

    return () => {
      unsubscribeProfile();
    };
  },

  // Start the 24-hour countdown if not started yet
  startCountdown: async (userId?: string) => {
    const { unlockStartedAt, isUnlocked } = get();
    if (isUnlocked || unlockStartedAt) return; // Already running or unlocked

    const now = Date.now();
    set({ unlockStartedAt: now });

    const uid = userId || auth.currentUser?.uid;
    const refCode = (uid ? uid.slice(0, 8) : 'RAVE').toUpperCase();

    // Cache locally
    await AsyncStorage.setItem(
      STORAGE_UNLOCK_KEY,
      JSON.stringify({
        isUnlocked: false,
        unlockStartedAt: now,
        hasShared: get().hasShared,
        referralCode: refCode,
        referralsCount: get().referralsCount,
      })
    );

    // Save to Firestore profile
    if (uid) {
      try {
        await updateDoc(doc(db, 'profiles', uid), {
          unlock_started_at: now,
          referral_code: refCode,
        });
      } catch (e) {
        // Doc might not exist yet, set it with merge
        await setDoc(doc(db, 'profiles', uid), { unlock_started_at: now, referral_code: refCode }, { merge: true });
      }
    }
  },

  // Share on WhatsApp with unique referral message
  shareOnWhatsApp: async (userId?: string) => {
    const uid = userId || auth.currentUser?.uid;
    const refCode = (uid ? uid.slice(0, 8) : 'RAVE').toUpperCase();
    const shareUrl = get().getReferralUrl(refCode);

    const message = `Hey! 👋 Join me on Rave Connect — the Ravensbourne University London student community. Meet peers & unlock 1-on-1 Blind Dates! 💚 Tap to join: ${shareUrl}`;
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?text=${encoded}`;
    const webFallbackUrl = `https://api.whatsapp.com/send?text=${encoded}`;

    // Mark shared state locally
    const now = Date.now();
    set({ hasShared: true, sharedAt: now, referralCode: refCode });

    // Cache locally
    await AsyncStorage.setItem(
      STORAGE_UNLOCK_KEY,
      JSON.stringify({
        isUnlocked: get().isUnlocked,
        unlockStartedAt: get().unlockStartedAt,
        hasShared: true,
        sharedAt: now,
        referralCode: refCode,
        referralsCount: get().referralsCount,
      })
    );

    // Sync to Firestore
    if (uid) {
      try {
        await updateDoc(doc(db, 'profiles', uid), {
          has_shared: true,
          shared_at: now,
          referral_code: refCode,
        });
        
        // Also ensure referral registry doc exists for deep-link tracking
        await setDoc(
          doc(db, 'referrals', refCode),
          {
            referrer_id: uid,
            code: refCode,
            link: shareUrl,
            created_at: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Failed to update share record on Firestore:', e);
      }
    }

    // Open WhatsApp
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(webFallbackUrl);
      }
    } catch (err) {
      // Fallback to browser WhatsApp
      await Linking.openURL(webFallbackUrl).catch(() => {
        Alert.alert('Could not open WhatsApp', 'Please ensure WhatsApp is installed on your device.');
      });
    }
  },

  // Backend verification: simulate or trigger friend click
  simulateFriendClick: async (userId?: string) => {
    const uid = userId || auth.currentUser?.uid;
    const refCode = get().referralCode || (uid ? uid.slice(0, 8) : 'RAVE').toUpperCase();

    try {
      // 1. Record referral click in Firestore referrals collection
      await setDoc(
        doc(db, 'referrals', refCode),
        {
          referrer_id: uid,
          code: refCode,
          click_count: increment(1),
          last_clicked_at: serverTimestamp(),
          verified: true,
        },
        { merge: true }
      );

      // 2. Mark profile as unlocked
      if (uid) {
        await updateDoc(doc(db, 'profiles', uid), {
          blind_date_unlocked: true,
          referral_completed: true,
          referrals_count: increment(1),
        });
      }

      set({ isUnlocked: true, referralsCount: get().referralsCount + 1 });
      await AsyncStorage.setItem(
        STORAGE_UNLOCK_KEY,
        JSON.stringify({
          isUnlocked: true,
          unlockStartedAt: get().unlockStartedAt,
          hasShared: true,
          referralCode: refCode,
          referralsCount: get().referralsCount + 1,
        })
      );
    } catch (err) {
      console.warn('Simulate click failed:', err);
      // Local fallback
      set({ isUnlocked: true });
    }
  },

  // Check 24-hour auto unlock
  checkAutoUnlock: (userId?: string) => {
    const { unlockStartedAt, isUnlocked } = get();
    if (isUnlocked) return true;
    if (!unlockStartedAt) return false;

    if (Date.now() >= unlockStartedAt + TWENTY_FOUR_HOURS_MS) {
      set({ isUnlocked: true });
      const uid = userId || auth.currentUser?.uid;
      if (uid) {
        updateDoc(doc(db, 'profiles', uid), {
          blind_date_unlocked: true,
        }).catch(() => {});
      }
      return true;
    }
    return false;
  },
}));
