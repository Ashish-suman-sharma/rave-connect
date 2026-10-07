// ============================================================
// Rave Connect — Blind Date Store (Persistent Matching & Chat)
// ============================================================
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export type BlindDateStatus = 'idle' | 'in_queue' | 'matched';

export interface BlindDatePartner {
  id: string;
  codeName: string;
  university: string;
  course?: string;
  year?: number;
  interests: string[];
  bio: string;
  avatarIcon: string;
  compatibilityScore: number;
}

export interface BlindDateMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  isMe: boolean;
}

export interface BlindDateMatch {
  matchId: string;
  partner: BlindDatePartner;
  matchedAt: string;
  status: 'ACTIVE' | 'WITHDRAWN';
  meetingIdea?: string | null;
}

interface BlindDateStore {
  status: BlindDateStatus;
  match: BlindDateMatch | null;
  messages: BlindDateMessage[];
  queueJoinedAt: string | null;
  isMatchingAnimationVisible: boolean;
  searchProgressText: string;
  unreadCount: number;

  // Actions
  initialize: () => Promise<void>;
  joinQueue: () => Promise<void>;
  leaveQueue: () => Promise<void>;
  setMatch: (match: BlindDateMatch) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  withdrawFromMatch: () => Promise<void>;
  reportMatch: (reason: string) => Promise<void>;
  dismissMatchingAnimation: () => void;
  setMeetingIdea: (idea: string) => void;
  resetAll: () => Promise<void>;
  _persistState: () => Promise<void>;
  _startQueueSimulation: () => void;
  _subscribeToFirestoreMessages: (matchId: string) => void;
}

const STORAGE_KEY = '@rave_blind_date_state_v1';

const MOCK_PARTNERS: BlindDatePartner[] = [
  {
    id: 'partner_sofia',
    codeName: 'Mystery Creative ✨',
    university: 'University of Greenwich',
    course: 'Architecture & Design',
    year: 2,
    interests: ['Coffee', 'Late Night Walks', 'Cinema', 'Indie Music'],
    bio: 'Looking for genuine conversations and exploring cozy coffee spots around campus.',
    avatarIcon: 'heart-spark',
    compatibilityScore: 94,
  },
  {
    id: 'partner_alex',
    codeName: 'Secret Bookworm 📚',
    university: 'University of Greenwich',
    course: 'Computer Science',
    year: 3,
    interests: ['Matcha', 'Podcasts', 'Museums', 'Gaming'],
    bio: 'Big fan of spontaneous campus chats and finding quiet reading nooks.',
    avatarIcon: 'rose',
    compatibilityScore: 97,
  },
  {
    id: 'partner_maya',
    codeName: 'Campus Romantic 🌙',
    university: 'University of Greenwich',
    course: 'Business & Media',
    year: 2,
    interests: ['Sunsets', 'Foodie Spots', 'Thrifting', 'Talk'],
    bio: 'Always down for a walk by the river and trying new street food.',
    avatarIcon: 'star',
    compatibilityScore: 92,
  },
];

export const useBlindDateStore = create<BlindDateStore>((set, get) => ({
  status: 'idle',
  match: null,
  messages: [],
  queueJoinedAt: null,
  isMatchingAnimationVisible: false,
  searchProgressText: 'Connecting to campus matchmaking...',
  unreadCount: 0,

  initialize: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({
          status: parsed.status || 'idle',
          match: parsed.match || null,
          messages: parsed.messages || [],
          queueJoinedAt: parsed.queueJoinedAt || null,
        });

        // If in queue when reopened, start simulation check
        if (parsed.status === 'in_queue') {
          get()._startQueueSimulation();
        }

        // If matched, sync messages from Firestore if available
        if (parsed.match?.matchId) {
          get()._subscribeToFirestoreMessages(parsed.match.matchId);
        }
      }
    } catch (err) {
      console.warn('Failed to load Blind Date state:', err);
    }
  },

  joinQueue: async () => {
    const joinedAt = new Date().toISOString();
    set({
      status: 'in_queue',
      queueJoinedAt: joinedAt,
      searchProgressText: 'Searching for someone special nearby...',
    });

    await get()._persistState();

    // Start matching process
    get()._startQueueSimulation();
  },

  leaveQueue: async () => {
    set({
      status: 'idle',
      queueJoinedAt: null,
      searchProgressText: '',
    });
    await get()._persistState();
  },

  setMatch: async (newMatch: BlindDateMatch) => {
    set({
      status: 'matched',
      match: newMatch,
      isMatchingAnimationVisible: true,
      unreadCount: 1,
    });

    // Seed welcoming initial greeting from partner
    const initialGreeting: BlindDateMessage = {
      id: `msg_welcome_${Date.now()}`,
      senderId: newMatch.partner.id,
      text: `Hi there! ❤️ We were matched on Blind Date. Nice to meet you anonymously!`,
      createdAt: new Date().toISOString(),
      isMe: false,
    };

    set({ messages: [initialGreeting] });
    await get()._persistState();
    get()._subscribeToFirestoreMessages(newMatch.matchId);
  },

  sendMessage: async (text: string) => {
    const { match, messages } = get();
    if (!match || !text.trim()) return;

    const currentUserId = auth.currentUser?.uid || 'current_user';
    const newMsg: BlindDateMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      senderId: currentUserId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isMe: true,
    };

    const updated = [...messages, newMsg];
    set({ messages: updated });
    await get()._persistState();

    // Try sending to Firestore
    try {
      await addDoc(collection(db, `blind_dates/${match.matchId}/messages`), {
        senderId: currentUserId,
        text: text.trim(),
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      // Offline / fallback to local state is already handled
    }

    // Friendly automated reply after 2.5 seconds if counterpart isn't real human
    if (match.partner.id.startsWith('partner_')) {
      setTimeout(() => {
        const partnerReplies = [
          "That's so true! What are you studying at Greenwich? 😊",
          "I love that! Have you been around Cutty Sark recently? It's so pretty around sunset. 🌅",
          "Haha totally agree! Would you want to grab a quick coffee between lectures sometime? ☕",
          "Nice! What day this week are you usually free on campus? ❤️",
        ];
        const randomReply = partnerReplies[Math.floor(Math.random() * partnerReplies.length)];
        const replyMsg: BlindDateMessage = {
          id: `msg_reply_${Date.now()}`,
          senderId: match.partner.id,
          text: randomReply,
          createdAt: new Date().toISOString(),
          isMe: false,
        };
        const withReply = [...get().messages, replyMsg];
        set({ messages: withReply, unreadCount: get().unreadCount + 1 });
        get()._persistState();
      }, 2500);
    }
  },

  withdrawFromMatch: async () => {
    set({
      status: 'idle',
      match: null,
      messages: [],
      queueJoinedAt: null,
      isMatchingAnimationVisible: false,
      unreadCount: 0,
    });
    await get()._persistState();
  },

  reportMatch: async (reason: string) => {
    console.log('Reported blind date:', reason);
    await get().withdrawFromMatch();
  },

  dismissMatchingAnimation: () => {
    set({ isMatchingAnimationVisible: false });
  },

  setMeetingIdea: (idea: string) => {
    const { match } = get();
    if (!match) return;
    set({ match: { ...match, meetingIdea: idea } });
    get()._persistState();
  },

  resetAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({
      status: 'idle',
      match: null,
      messages: [],
      queueJoinedAt: null,
      isMatchingAnimationVisible: false,
      unreadCount: 0,
    });
  },

  // Internal helper to persist Zustand state into AsyncStorage
  _persistState: async () => {
    const { status, match, messages, queueJoinedAt } = get();
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ status, match, messages, queueJoinedAt })
      );
    } catch (err) {
      console.warn('Failed to save Blind Date state:', err);
    }
  },

  // Internal simulated matching queue for instant reliable demo
  _startQueueSimulation: () => {
    const progressMessages = [
      'Finding active students in your university...',
      'Checking compatible vibes & shared interests...',
      'Almost there! Preparing your match...',
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (get().status !== 'in_queue') {
        clearInterval(interval);
        return;
      }

      if (step < progressMessages.length) {
        set({ searchProgressText: progressMessages[step] });
        step++;
      } else {
        clearInterval(interval);
        if (get().status === 'in_queue') {
          // Select a partner
          const randomPartner = MOCK_PARTNERS[Math.floor(Math.random() * MOCK_PARTNERS.length)];
          const newMatch: BlindDateMatch = {
            matchId: `bd_match_${Date.now()}`,
            partner: randomPartner,
            matchedAt: new Date().toISOString(),
            status: 'ACTIVE',
          };
          get().setMatch(newMatch);
        }
      }
    }, 1400);
  },

  // Internal Firestore listener
  _subscribeToFirestoreMessages: (matchId: string) => {
    try {
      const q = query(collection(db, `blind_dates/${matchId}/messages`), orderBy('timestamp', 'asc'));
      onSnapshot(q, (snapshot) => {
        const currentUserId = auth.currentUser?.uid || 'current_user';
        const fetchedMsgs: BlindDateMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedMsgs.push({
            id: docSnap.id,
            senderId: data.senderId,
            text: data.text,
            createdAt: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
            isMe: data.senderId === currentUserId,
          });
        });

        if (fetchedMsgs.length > 0) {
          // Merge avoiding duplicates
          const existingIds = new Set(fetchedMsgs.map((m) => m.id));
          const localOnly = get().messages.filter((m) => !existingIds.has(m.id));
          set({ messages: [...localOnly, ...fetchedMsgs] });
          get()._persistState();
        }
      });
    } catch (e) {
      // Offline fallback
    }
  },
} as any));
