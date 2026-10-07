// ============================================================
// Rave Connect — Complete Privacy Policy Page
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Shield, Lock, EyeOff, UserCheck, Mail } from 'lucide-react-native';
import { theme } from '@/lib/theme';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { safeBack } from '@/lib/utils';

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedPressable onPress={() => safeBack('/(tabs)/profile')} style={styles.backBtn}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroIconCircle}>
              <Shield size={24} color="#101112" strokeWidth={2.2} />
            </View>
            <Text style={styles.heroTitle}>Your Privacy Matters</Text>
            <Text style={styles.heroSubtitle}>
              Rave Connect is committed to protecting the privacy, safety, and anonymity of students at Ravensbourne University London.
            </Text>
            <Text style={styles.lastUpdated}>Effective Date: October 2026</Text>
          </View>

          {/* Section 1: Overview */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>1. Introduction</Text>
            <Text style={styles.paragraph}>
              Rave Connect ("we", "our", or "the app") is a platform created specifically for students of Ravensbourne University London to meet through spontaneous campus activities and 1-on-1 blind dates. We believe meaningful social connection should never come at the expense of your personal data privacy.
            </Text>
          </View>

          {/* Section 2: Information We Collect */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>2. Information We Collect</Text>
            <Text style={styles.paragraph}>
              We collect minimal information necessary to provide a safe student experience:
            </Text>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Account Credentials:</Text> Your student email address and encrypted password for secure authentication via Firebase.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Basic Profile Information:</Text> Your first name, gender, and selected avatar style.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Activity & Chat Data:</Text> Activities you create or join, and chat messages sent within activity groups or blind dates.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>We DO NOT collect:</Text> Precise GPS background tracking, student ID card scans, or financial data.
              </Text>
            </View>
          </View>

          {/* Section 3: Blind Date Anonymity */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionIconRow}>
              <EyeOff size={18} color="#FF2E63" />
              <Text style={[styles.sectionHeading, { marginBottom: 0 }]}>3. Blind Date Anonymity Guarantee</Text>
            </View>
            <Text style={styles.paragraph}>
              Our Blind Date feature is engineered with strict privacy isolation:
            </Text>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Your identity, real name, email, and social accounts are completely hidden from your matched partner.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Blind Date conversations are strictly quarantined and never visible in public channels or normal activity chats.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Either participant may withdraw at any time, immediately closing and deleting the private connection.
              </Text>
            </View>
          </View>

          {/* Section 4: Data Security */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionIconRow}>
              <Lock size={18} color="#10B981" />
              <Text style={[styles.sectionHeading, { marginBottom: 0 }]}>4. Data Security & Storage</Text>
            </View>
            <Text style={styles.paragraph}>
              All user data is stored using industry-standard Google Firebase infrastructure with role-based security rules and TLS 1.3 encryption in transit. We do not sell, rent, or trade your personal data to any third-party advertisers or data brokers under any circumstances.
            </Text>
          </View>

          {/* Section 5: Student Safety & Moderation */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionIconRow}>
              <UserCheck size={18} color="#3B82F6" />
              <Text style={[styles.sectionHeading, { marginBottom: 0 }]}>5. Student Safety & Community Standards</Text>
            </View>
            <Text style={styles.paragraph}>
              Rave Connect operates a zero-tolerance policy against harassment, impersonation, hate speech, and non-consensual behavior. Reports submitted by students are reviewed immediately, and violators are permanently removed from the platform.
            </Text>
          </View>

          {/* Section 6: Your Rights */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>6. Your Rights & Data Deletion</Text>
            <Text style={styles.paragraph}>
              Under applicable UK data protection regulations (UK GDPR), you retain the right to:
            </Text>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Access and request a copy of your personal data.</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Modify or update your profile details at any time.</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Permanently delete your account and all associated messages.</Text>
            </View>
          </View>

          {/* Section 7: Contact */}
          <View style={styles.contactCard}>
            <Mail size={22} color={theme.colors.textPrimary} strokeWidth={2.2} />
            <Text style={styles.contactTitle}>Questions or Data Inquiries?</Text>
            <Text style={styles.contactText}>
              For any privacy questions, data requests, or concerns, please contact our team directly at:
            </Text>
            <Text style={styles.contactEmail}>theju8445@gmail.com</Text>
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

  heroBanner: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 22,
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 10,
  },
  lastUpdated: {
    color: theme.colors.accent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },

  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeading: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    marginBottom: 10,
  },
  paragraph: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
  },
  bulletDot: {
    color: theme.colors.accent,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  bulletText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  boldText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
  },

  contactCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
    marginTop: 6,
  },
  contactTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  contactText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  contactEmail: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 16,
    backgroundColor: theme.colors.backgroundAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
  },
});
