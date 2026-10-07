// ============================================================
// Rave Connect — Help & Support Screen
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Mail,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AppButton } from '@/components/ui/AppButton';
import { safeBack } from '@/lib/utils';

const SUPPORT_EMAIL = 'theju8445@gmail.com';

const FAQS = [
  {
    question: 'How does the Blind Date feature work?',
    answer:
      'When you tap "Join a Blind Date", you enter a private queue with fellow Ravensbourne students. When a compatible match is found, two hearts connect and you are paired in an exclusive anonymous chat. You stay anonymous until you decide together to meet at a campus café or public spot.',
  },
  {
    question: 'How do I create an activity?',
    answer:
      'Tap the "+" button at the top of the Home screen. Pick a category (Coffee, Study Break, Cinema, Gym, etc.), choose a meeting spot around Greenwich, set a start time, and publish. Other students can immediately tap "Join" to participate.',
  },
  {
    question: 'Is my identity protected?',
    answer:
      'Yes. In Blind Date, your real name, phone number, and social profiles are completely hidden. In group activities, other students only see your first name and student avatar.',
  },
  {
    question: 'What if someone behaves inappropriately?',
    answer:
      'We have zero tolerance for harassment. You can tap the 3-dot options menu inside any chat to immediately "Report Concern" and leave the date. Reports are reviewed by our team immediately.',
  },
  {
    question: 'Can non-students join Rave Connect?',
    answer:
      'Rave Connect is exclusively built for the Ravensbourne University London student community to ensure safety and authenticity.',
  },
];

export default function SupportScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleOpenEmailApp = async () => {
    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=Rave%20Connect%20Student%20Support%20Query&body=Hi%20Rave%20Connect%20Team%2C%0A%0AMy%20query%20is%3A%0A`;
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert(
          'Email App Not Found',
          `Please email your query directly to:\n\n${SUPPORT_EMAIL}`,
          [{ text: 'OK' }]
        );
      }
    } catch {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedPressable onPress={() => safeBack('/(tabs)/profile')} style={styles.backBtn}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Email Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.emailIconRing}>
              <Mail size={28} color="#101112" strokeWidth={2.2} />
            </View>

            <Text style={styles.heroTitle}>Student Support Team</Text>
            <Text style={styles.heroText}>
              For any query, feedback, or assistance, please email us directly at:
            </Text>

            {/* Email Address Pill */}
            <View style={styles.emailPill}>
              <Text style={styles.emailPillText}>{SUPPORT_EMAIL}</Text>
            </View>

            {/* Prominent Action Button to Open Email App */}
            <AppButton
              variant="primary"
              size="lg"
              fullWidth
              title="Open Email App (Gmail) ✉️"
              icon={<ExternalLink size={18} color={theme.colors.textOnAccent} strokeWidth={2.4} />}
              onPress={handleOpenEmailApp}
              style={styles.openEmailBtn}
            />

            <View style={styles.responseTimeRow}>
              <Clock size={14} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.responseTimeText}>We usually reply within a few hours</Text>
            </View>
          </View>

          {/* Campus Location Card */}
          <View style={styles.campusCard}>
            <View style={styles.campusIconCircle}>
              <MapPin size={20} color={theme.colors.accent} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.campusHeading}>Ravensbourne University London</Text>
              <Text style={styles.campusAddress}>6 Penrose Way, Greenwich Peninsula, London SE10 0EW</Text>
            </View>
          </View>

          {/* FAQ Accordion Section */}
          <View style={styles.faqSection}>
            <View style={styles.faqHeaderRow}>
              <HelpCircle size={18} color={theme.colors.textPrimary} strokeWidth={2.2} />
              <Text style={styles.faqSectionTitle}>Frequently Asked Questions</Text>
            </View>

            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <AnimatedPressable
                  key={idx}
                  onPress={() => toggleFaq(idx)}
                  style={[styles.faqCard, isOpen && styles.faqCardOpen]}
                  activeScale={0.99}
                >
                  <View style={styles.faqQuestionRow}>
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    {isOpen ? (
                      <ChevronUp size={18} color={theme.colors.textSecondary} />
                    ) : (
                      <ChevronDown size={18} color={theme.colors.textTertiary} />
                    )}
                  </View>

                  {isOpen && (
                    <View style={styles.faqAnswerWrap}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </AnimatedPressable>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 17,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Main Email Hero Card
  heroCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 255, 61, 0.2)',
    shadowColor: '#101112',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  emailIconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 22,
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
    maxWidth: 290,
  },
  emailPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200, 255, 61, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    marginBottom: 18,
  },
  emailPillText: {
    color: theme.colors.accent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  openEmailBtn: {
    marginBottom: 14,
  },
  responseTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  responseTimeText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
  },

  // Campus Location
  campusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  campusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campusHeading: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  campusAddress: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },

  // FAQ
  faqSection: {
    marginBottom: 20,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  faqSectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
  },
  faqCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  faqCardOpen: {
    borderColor: theme.colors.accent,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQuestionText: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    lineHeight: 19,
  },
  faqAnswerWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  faqAnswerText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
  },
});
