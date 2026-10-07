// ============================================================
// Rave Connect — Activity Chat Screen (Firebase)
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Send, Users, ShieldAlert } from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { useActivityStore } from '@/stores/activityStore';
import { useAuthStore } from '@/stores/authStore';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { safeBack } from '@/lib/utils';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
}

export default function ActivityChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activities } = useActivityStore();
  const { firebaseUser, user } = useAuthStore();
  
  const activity = activities.find((a) => a.id === id);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (!id) return;

    // Listen to Firebase real-time messages
    const q = query(
      collection(db, `activities/${id}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(msgs);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [id]);

  const handleSend = async () => {
    if (!inputText.trim() || !id || !firebaseUser) return;
    
    const textToSend = inputText.trim();
    setInputText('');

    try {
      await addDoc(collection(db, `activities/${id}/messages`), {
        senderId: firebaseUser.uid,
        senderName: user?.name || 'Anonymous Student',
        text: textToSend,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMe = item.senderId === firebaseUser?.uid;
    const showHeader = index === 0 || messages[index - 1].senderId !== item.senderId;
    const timeString = item.timestamp?.toDate 
      ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Sending...';

    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperOther]}>
        {!isMe && showHeader && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>
            {item.text}
          </Text>
        </View>
        <Text style={styles.messageTime}>
          {timeString}
        </Text>
      </View>
    );
  };

  if (!activity) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <AnimatedPressable onPress={() => safeBack(id ? `/activity/${id}` : '/(tabs)')} style={styles.backButton} hapticFeedback={false}>
              <ArrowLeft size={24} color={theme.colors.textOnDark} />
            </AnimatedPressable>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {activity.category?.icon} {activity.title || activity.category?.name}
              </Text>
              <View style={styles.headerSubtitleRow}>
                <Users size={14} color={theme.colors.textOnDarkMuted} />
                <Text style={styles.headerSubtitle}>
                  {activity.participant_count} participants
                </Text>
              </View>
            </View>
            <AnimatedPressable style={styles.reportButton} hapticFeedback={false}>
              <ShieldAlert size={20} color={theme.colors.textOnDarkMuted} />
            </AnimatedPressable>
          </View>

          {/* Safety Notice */}
          <View style={styles.safetyNotice}>
            <Text style={styles.safetyText}>
              Identities remain hidden until the activity starts. Be respectful and safe.
            </Text>
          </View>

          {/* Chat List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />

          {/* Input Area */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Message the group..."
              placeholderTextColor={theme.colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <AnimatedPressable 
              onPress={handleSend} 
              disabled={!inputText.trim()}
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              activeScale={0.9}
            >
              <Send size={18} color={inputText.trim() ? theme.colors.textOnAccent : theme.colors.textTertiary} strokeWidth={2.5} />
            </AnimatedPressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceDark,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.textOnDark,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.bodyLarge,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  headerSubtitle: {
    color: theme.colors.textOnDarkMuted,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.caption,
  },
  reportButton: {
    padding: theme.spacing.xs,
  },
  safetyNotice: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  safetyText: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.micro,
    textAlign: 'center',
  },
  chatList: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  messageWrapper: {
    marginBottom: theme.spacing.md,
    maxWidth: '80%',
  },
  messageWrapperMe: {
    alignSelf: 'flex-end',
  },
  messageWrapperOther: {
    alignSelf: 'flex-start',
  },
  senderName: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.micro,
    marginBottom: 4,
    marginLeft: 4,
  },
  messageBubble: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.xl,
  },
  messageBubbleMe: {
    backgroundColor: theme.colors.accent,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.body,
    lineHeight: 22,
  },
  messageTextMe: {
    color: theme.colors.textOnAccent,
  },
  messageTextOther: {
    color: theme.colors.textPrimary,
  },
  messageTime: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 14,
    paddingBottom: 14,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.body,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: theme.colors.accent,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
