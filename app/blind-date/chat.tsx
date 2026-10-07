// ============================================================
// Rave Connect — Exclusive Blind Date Chat
// Private romantic space for matched students to connect & plan meetings
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
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Send,
  MoreVertical,
  ShieldAlert,
  LogOut,
  Sparkles,
  MapPin,
  Calendar,
  Coffee,
  Check,
  X,
} from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { safeBack } from '@/lib/utils';
import { useBlindDateStore, BlindDateMessage } from '@/stores/blindDateStore';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

export default function BlindDateChatScreen() {
  const { match, messages, sendMessage, withdrawFromMatch, reportMatch, setMeetingIdea } = useBlindDateStore();
  const [inputText, setInputText] = useState('');
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showSafetyTipsModal, setShowSafetyTipsModal] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // Auto-scroll to latest message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSelectPrompt = (promptText: string) => {
    sendMessage(promptText);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const confirmWithdraw = () => {
    setShowOptionsModal(false);
    Alert.alert(
      'End Blind Date?',
      'Are you sure you want to withdraw from this date? The chat and connection will be closed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave Date',
          style: 'destructive',
          onPress: async () => {
            await withdrawFromMatch();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const handleReport = () => {
    setShowOptionsModal(false);
    Alert.alert(
      'Report User',
      'Please let us know why you are reporting this user. Your report is completely confidential.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Inappropriate Messages',
          onPress: async () => {
            await reportMatch('inappropriate_content');
            router.replace('/(tabs)');
          },
        },
        {
          text: 'Sharing Personal Info',
          onPress: async () => {
            await reportMatch('shared_identity');
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active Blind Date found</Text>
          <AnimatedPressable onPress={() => safeBack('/blind-date')} style={styles.backHomeBtn}>
            <Text style={styles.backHomeText}>Return to Home</Text>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    );
  }

  const meetingPrompts = [
    { icon: '☕', label: 'Coffee break on campus' },
    { icon: '🍕', label: 'Quick bite nearby' },
    { icon: '🚶', label: 'Walk around Cutty Sark' },
    { icon: '📚', label: 'Library study break' },
    { icon: '📅', label: 'Free this Thursday?' },
  ];

  const renderMessageItem = ({ item }: { item: BlindDateMessage }) => {
    const isMe = item.isMe;
    const timeFormatted = item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
        {!isMe && (
          <View style={styles.miniPartnerAvatar}>
            <Heart size={12} color="#FF2E63" fill="#FF2E63" />
          </View>
        )}

        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
            {item.text}
          </Text>
          {timeFormatted ? (
            <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeOther]}>
              {timeFormatted}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
            {/* Top Romantic Header */}
            <View style={styles.header}>
              <AnimatedPressable onPress={() => safeBack('/blind-date')} style={styles.headerBackBtn}>
                <ArrowLeft size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
              </AnimatedPressable>

              <View style={styles.partnerInfoBlock}>
                <View style={styles.avatarWithHeart}>
                  <View style={styles.partnerAvatarCircle}>
                    <Heart size={18} color="#FF2E63" fill="#FF2E63" />
                  </View>
                  <View style={styles.onlineHeartDot} />
                </View>
                <View>
                  <Text style={styles.partnerHeaderName}>{match.partner.codeName}</Text>
                  <Text style={styles.partnerHeaderSub}>
                    {match.partner.university} · {match.partner.compatibilityScore}% Match
                  </Text>
                </View>
              </View>

              <AnimatedPressable onPress={() => setShowOptionsModal(true)} style={styles.moreOptionsBtn}>
                <MoreVertical size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
              </AnimatedPressable>
            </View>

            {/* Elegant Anonymous Safety Warning Notice */}
            <View style={styles.safetyNoticeContainer}>
              <View style={styles.safetyIconBox}>
                <Heart size={14} color="#FF2E63" fill="#FF2E63" />
              </View>
              <View style={styles.safetyTextBox}>
                <Text style={styles.safetyNoticeTitle}>Keep it anonymous for now ❤️</Text>
                <Text style={styles.safetyNoticeDesc}>
                  Please don't share your real name, phone number, social media, address, or other identifying information. Sharing personal identity details may result in removal from the Blind Date feature.
                </Text>
              </View>
            </View>

            {/* Chat Messages */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessageItem}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              ListHeaderComponent={
                <View style={styles.meetingSuggestionHero}>
                  <View style={styles.suggestionHeartRing}>
                    <Coffee size={22} color="#FF2E63" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.suggestionTitle}>Where should we meet? ❤️</Text>
                  <Text style={styles.suggestionSubtitle}>
                    Break the ice and decide on a relaxed, public campus spot to meet in person.
                  </Text>

                  {/* Suggestion Prompt Chips */}
                  <View style={styles.promptsRow}>
                    {meetingPrompts.map((p, idx) => (
                      <AnimatedPressable
                        key={idx}
                        onPress={() => handleSelectPrompt(p.label)}
                        style={styles.promptChip}
                        activeScale={0.96}
                      >
                        <Text style={styles.promptEmoji}>{p.icon}</Text>
                        <Text style={styles.promptText}>{p.label}</Text>
                      </AnimatedPressable>
                    ))}
                  </View>
                </View>
              }
            />

            {/* Input Bar */}
            <View style={styles.inputArea}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Send an anonymous message..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={400}
                />

                <AnimatedPressable
                  onPress={handleSend}
                  disabled={!inputText.trim()}
                  style={[
                    styles.sendButton,
                    !inputText.trim() && styles.sendButtonDisabled,
                  ]}
                  activeScale={0.92}
                >
                  <Send
                    size={18}
                    color={inputText.trim() ? '#FFFFFF' : theme.colors.textTertiary}
                    strokeWidth={2.4}
                  />
                </AnimatedPressable>
              </View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Options Menu Modal */}
      <Modal visible={showOptionsModal} transparent animationType="fade">
        <View style={styles.optionsModalBackdrop}>
          <AnimatedPressable
            style={styles.modalDismissOverlay}
            onPress={() => setShowOptionsModal(false)}
          />

          <View style={styles.optionsSheet}>
            <View style={styles.optionsDragHandle} />

            <Text style={styles.optionsSheetTitle}>Blind Date Settings</Text>

            <AnimatedPressable
              onPress={() => {
                setShowOptionsModal(false);
                setShowSafetyTipsModal(true);
              }}
              style={styles.optionRow}
            >
              <Sparkles size={18} color="#FF2E63" strokeWidth={2.2} />
              <Text style={styles.optionRowText}>Dating Safety & Tips</Text>
            </AnimatedPressable>

            <AnimatedPressable onPress={handleReport} style={styles.optionRow}>
              <ShieldAlert size={18} color={theme.colors.danger} strokeWidth={2.2} />
              <Text style={[styles.optionRowText, { color: theme.colors.danger }]}>Report Concern</Text>
            </AnimatedPressable>

            <AnimatedPressable onPress={confirmWithdraw} style={styles.optionRow}>
              <LogOut size={18} color={theme.colors.danger} strokeWidth={2.2} />
              <Text style={[styles.optionRowText, { color: theme.colors.danger }]}>
                End / Leave Blind Date
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={() => setShowOptionsModal(false)}
              style={styles.optionsCancelBtn}
            >
              <Text style={styles.optionsCancelText}>Cancel</Text>
            </AnimatedPressable>
          </View>
        </View>
      </Modal>

      {/* Safety Tips Modal */}
      <Modal visible={showSafetyTipsModal} transparent animationType="fade">
        <View style={styles.optionsModalBackdrop}>
          <View style={styles.safetyTipsCard}>
            <View style={styles.safetyTipsHeaderRow}>
              <Text style={styles.safetyTipsTitle}>Campus Dating Safety</Text>
              <AnimatedPressable onPress={() => setShowSafetyTipsModal(false)}>
                <X size={20} color={theme.colors.textPrimary} />
              </AnimatedPressable>
            </View>

            <Text style={styles.tipParagraph}>
              1. <Text style={{ fontFamily: theme.typography.fontFamily.bold }}>Always meet in public:</Text> Choose a well-lit campus café, student lounge, or library.
            </Text>
            <Text style={styles.tipParagraph}>
              2. <Text style={{ fontFamily: theme.typography.fontFamily.bold }}>Tell a friend:</Text> Let a roommate or friend know who and where you're meeting.
            </Text>
            <Text style={styles.tipParagraph}>
              3. <Text style={{ fontFamily: theme.typography.fontFamily.bold }}>Protect your privacy:</Text> Don't share addresses, social handles, or passwords until you're completely comfortable.
            </Text>

            <AnimatedPressable
              onPress={() => setShowSafetyTipsModal(false)}
              style={styles.gotItBtn}
            >
              <Text style={styles.gotItText}>Got it, thank you!</Text>
            </AnimatedPressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F5', // Soft luxury warm cream with romantic undertone
  },
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    marginBottom: 16,
  },
  backHomeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  backHomeText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 46, 99, 0.1)',
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  partnerInfoBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWithHeart: {
    position: 'relative',
  },
  partnerAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 46, 99, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 46, 99, 0.3)',
  },
  onlineHeartDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  partnerHeaderName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 15,
  },
  partnerHeaderSub: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    marginTop: 1,
  },
  moreOptionsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Elegant Safety Notice
  safetyNoticeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFF0F3', // Soft rose tinted blush
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0E6',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  safetyIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 46, 99, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  safetyTextBox: {
    flex: 1,
  },
  safetyNoticeTitle: {
    color: '#E11D48',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    marginBottom: 2,
  },
  safetyNoticeDesc: {
    color: '#881337',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 16,
  },

  // Suggestion Hero in Chat
  meetingSuggestionHero: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  suggestionHeartRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 46, 99, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.2)',
  },
  suggestionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 17,
    marginBottom: 4,
  },
  suggestionSubtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 280,
    marginBottom: 16,
  },
  promptsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3D9DF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  promptEmoji: {
    fontSize: 14,
  },
  promptText: {
    color: '#9F1239',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },

  // Messages List
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    maxWidth: '82%',
  },
  messageRowMe: {
    alignSelf: 'flex-end',
  },
  messageRowOther: {
    alignSelf: 'flex-start',
    gap: 6,
  },
  miniPartnerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 46, 99, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: '#FF2E63', // Electric romantic rose
    borderBottomRightRadius: 4,
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EAE5E0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  bubbleTextOther: {
    color: theme.colors.textPrimary,
  },
  bubbleTime: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  bubbleTimeMe: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  bubbleTimeOther: {
    color: theme.colors.textTertiary,
  },

  // Input Area
  inputArea: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 46, 99, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F2EE',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
    maxHeight: 110,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF2E63',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#EAE6E1',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Options Modal
  optionsModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 8, 14, 0.65)',
    justifyContent: 'flex-end',
  },
  modalDismissOverlay: {
    flex: 1,
  },
  optionsSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  optionsDragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  optionsSheetTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  optionRowText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 15,
  },
  optionsCancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  optionsCancelText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
  },

  // Safety Tips Card
  safetyTipsCard: {
    margin: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 26,
    padding: 24,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 340,
  },
  safetyTipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  safetyTipsTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 18,
  },
  tipParagraph: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  gotItBtn: {
    backgroundColor: '#FF2E63',
    paddingVertical: 13,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    marginTop: 8,
  },
  gotItText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
  },
});
