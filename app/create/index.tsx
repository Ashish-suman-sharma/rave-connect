// ============================================================
// Rave Connect — Create Activity Screen (Built Clean from Scratch)
// Zero-crumple, full-width spacious card architecture, unified design tokens
// ============================================================
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  X,
  MapPin,
  Clock,
  AlignLeft,
  ChevronRight,
  Check,
  Type,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import { theme, getCategoryStyle } from '@/lib/theme';
import { ACTIVITY_CATEGORIES, LOCATIONS } from '@/lib/constants';
import { useActivityStore } from '@/stores/activityStore';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AppButton } from '@/components/ui/AppButton';
import { safeBack } from '@/lib/utils';

type Step = 'category' | 'location' | 'time' | 'details' | 'review';

export default function CreateActivityScreen() {
  const { addActivity } = useActivityStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Form State
  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  // Stable time slots calculated ONCE at mount so selection never resets on re-renders
  const timeOptions = useMemo(() => {
    const base = new Date();
    // Anchor to the next 15-minute mark
    const mins = base.getMinutes();
    const rounded = Math.ceil(mins / 15) * 15;
    const anchor = new Date(base);
    anchor.setMinutes(rounded, 0, 0);

    const slotOffsets = [
      { mins: 15, rel: 'In 15 minutes', badge: 'Soon' },
      { mins: 30, rel: 'In 30 minutes', badge: 'Popular' },
      { mins: 45, rel: 'In 45 minutes', badge: 'Soon' },
      { mins: 60, rel: 'In 1 hour', badge: 'Today' },
      { mins: 90, rel: 'In 1.5 hours', badge: 'Today' },
      { mins: 120, rel: 'In 2 hours', badge: 'Later today' },
      { mins: 180, rel: 'In 3 hours', badge: 'Later today' },
      { mins: 240, rel: 'In 4 hours', badge: 'Tonight' },
    ];

    return slotOffsets.map(({ mins, rel, badge }) => {
      const target = new Date(anchor.getTime() + mins * 60 * 1000);
      const h = target.getHours();
      const m = target.getMinutes();
      const formattedM = m < 10 ? `0${m}` : m;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;

      return {
        id: `slot_${mins}`,
        label: `${displayH}:${formattedM} ${ampm}`,
        relative: rel,
        badge,
        isoString: target.toISOString(),
      };
    });
  }, []);

  const steps: Step[] = ['category', 'location', 'time', 'details', 'review'];
  const stepIndex = steps.indexOf(step);

  const canProceed = () => {
    switch (step) {
      case 'category':
        return !!selectedCategory;
      case 'location':
        return !!selectedLocation;
      case 'time':
        return !!selectedTime;
      case 'details':
        return true;
      case 'review':
        return !!selectedCategory && !!selectedLocation && !!selectedTime;
    }
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStep(steps[stepIndex + 1]);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStep(steps[stepIndex - 1]);
    }
  };

  const handlePublish = async () => {
    if (!selectedCategory || !selectedLocation || !selectedTime || isPublishing) return;

    try {
      setIsPublishing(true);
      const category = ACTIVITY_CATEGORIES.find((c) => c.id === selectedCategory);
      const finalTitle = title.trim() || category?.name || 'Activity';

      await addActivity({
        category_id: selectedCategory,
        title: finalTitle,
        description: description.trim() || null,
        location_name: selectedLocation,
        start_time: selectedTime,
        max_participants: maxParticipants ? parseInt(maxParticipants, 10) : null,
        status: 'UPCOMING',
      });

      safeBack('/(tabs)');
    } catch (err) {
      console.error('Failed to publish activity:', err);
      setIsPublishing(false);
    }
  };

  const categoryObj = ACTIVITY_CATEGORIES.find((c) => c.id === selectedCategory);
  const selectedTimeObj = timeOptions.find((t) => t.isoString === selectedTime);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <AnimatedPressable onPress={() => safeBack('/(tabs)')} style={styles.headerCloseBtn}>
              <X size={20} color={theme.colors.textPrimary} strokeWidth={2.2} />
            </AnimatedPressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Create Activity</Text>
              <Text style={styles.headerSubtitle}>Step {stepIndex + 1} of 5</Text>
            </View>

            <View style={styles.headerRightSpacer} />
          </View>

          {/* Stepper Progress Indicator */}
          <View style={styles.stepperContainer}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.stepperBar,
                  i <= stepIndex && styles.stepperBarActive,
                ]}
              />
            ))}
          </View>

          {/* Scrollable Form Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* ================= STEP 1: CATEGORY ================= */}
            {step === 'category' && (
              <View style={styles.stepBlock}>
                <Text style={styles.stepHeading}>What are you up for?</Text>
                <Text style={styles.stepSubheading}>
                  Select an activity you'd like to do with fellow students
                </Text>

                <View style={styles.listContainer}>
                  {ACTIVITY_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const catStyle = getCategoryStyle(cat.id);

                    return (
                      <AnimatedPressable
                        key={cat.id}
                        onPress={() => setSelectedCategory(cat.id)}
                        style={[
                          styles.fullCard,
                          isSelected && styles.fullCardSelected,
                        ]}
                      >
                        {/* Icon Bubble */}
                        <View
                          style={[
                            styles.cardIconBox,
                            { backgroundColor: isSelected ? catStyle.text : catStyle.bg },
                          ]}
                        >
                          <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                        </View>

                        {/* Text Column */}
                        <View style={styles.cardTextCol}>
                          <Text
                            style={[
                              styles.cardTitle,
                              isSelected && { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.black },
                            ]}
                          >
                            {cat.name}
                          </Text>
                          <Text style={styles.cardSubtitle} numberOfLines={1}>
                            {cat.description}
                          </Text>
                        </View>

                        {/* Radio Check Circle */}
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleActive,
                          ]}
                        >
                          {isSelected && <Check size={14} color="#101112" strokeWidth={3.5} />}
                        </View>
                      </AnimatedPressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ================= STEP 2: LOCATION ================= */}
            {step === 'location' && (
              <View style={styles.stepBlock}>
                <Text style={styles.stepHeading}>Where are you meeting?</Text>
                <Text style={styles.stepSubheading}>
                  Choose a campus or neighborhood meeting spot
                </Text>

                <View style={styles.listContainer}>
                  {LOCATIONS.map((loc) => {
                    const isSelected = selectedLocation === loc.name;

                    return (
                      <AnimatedPressable
                        key={loc.name}
                        onPress={() => setSelectedLocation(loc.name)}
                        style={[
                          styles.fullCard,
                          isSelected && styles.fullCardSelected,
                        ]}
                      >
                        <View
                          style={[
                            styles.cardIconBox,
                            isSelected
                              ? { backgroundColor: theme.colors.accent }
                              : { backgroundColor: theme.colors.backgroundAlt },
                          ]}
                        >
                          <MapPin
                            size={20}
                            color={isSelected ? '#101112' : theme.colors.textSecondary}
                            strokeWidth={2.2}
                          />
                        </View>

                        <View style={styles.cardTextCol}>
                          <Text
                            style={[
                              styles.cardTitle,
                              isSelected && { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.black },
                            ]}
                          >
                            {loc.name}
                          </Text>
                          <Text style={styles.cardSubtitle}>Campus & nearby meeting point</Text>
                        </View>

                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleActive,
                          ]}
                        >
                          {isSelected && <Check size={14} color="#101112" strokeWidth={3.5} />}
                        </View>
                      </AnimatedPressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ================= STEP 3: TIME ================= */}
            {step === 'time' && (
              <View style={styles.stepBlock}>
                <Text style={styles.stepHeading}>When are you starting?</Text>
                <Text style={styles.stepSubheading}>
                  Pick a start time for everyone to meet up
                </Text>

                <View style={styles.listContainer}>
                  {timeOptions.map((opt) => {
                    const isSelected = selectedTime === opt.isoString;

                    return (
                      <AnimatedPressable
                        key={opt.id}
                        onPress={() => setSelectedTime(opt.isoString)}
                        style={[
                          styles.fullCard,
                          isSelected && styles.fullCardSelected,
                        ]}
                      >
                        {/* Time Icon Bubble */}
                        <View
                          style={[
                            styles.cardIconBox,
                            isSelected
                              ? { backgroundColor: theme.colors.accent }
                              : { backgroundColor: theme.colors.backgroundAlt },
                          ]}
                        >
                          <Clock
                            size={20}
                            color={isSelected ? '#101112' : theme.colors.textSecondary}
                            strokeWidth={2.2}
                          />
                        </View>

                        {/* Time Text Column */}
                        <View style={styles.cardTextCol}>
                          <Text
                            style={[
                              styles.timeLargeLabel,
                              isSelected && { color: theme.colors.textPrimary },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          <Text style={styles.cardSubtitle}>
                            {opt.relative}
                          </Text>
                        </View>

                        {/* Relative Tag Badge */}
                        <View
                          style={[
                            styles.timePillBadge,
                            isSelected && styles.timePillBadgeActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.timePillText,
                              isSelected && styles.timePillTextActive,
                            ]}
                          >
                            {opt.badge}
                          </Text>
                        </View>

                        {/* Radio Check Circle */}
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleActive,
                          ]}
                        >
                          {isSelected && <Check size={14} color="#101112" strokeWidth={3.5} />}
                        </View>
                      </AnimatedPressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ================= STEP 4: DETAILS ================= */}
            {step === 'details' && (
              <View style={styles.stepBlock}>
                <Text style={styles.stepHeading}>Add details</Text>
                <Text style={styles.stepSubheading}>
                  Give your activity a clear heading and description
                </Text>

                {/* Heading / Title */}
                <View style={styles.fieldGroup}>
                  <View style={styles.fieldLabelRow}>
                    <View style={styles.fieldIconPill}>
                      <Type size={12} color="#101112" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.fieldLabel}>Activity Heading / Title</Text>
                  </View>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder={
                      categoryObj
                        ? `e.g. ${categoryObj.name} at student union`
                        : 'e.g. Quick study break at Library'
                    }
                    placeholderTextColor={theme.colors.textTertiary}
                    value={title}
                    onChangeText={setTitle}
                    maxLength={60}
                  />
                  <Text style={styles.fieldCounter}>{title.length}/60</Text>
                </View>

                {/* Description */}
                <View style={styles.fieldGroup}>
                  <View style={styles.fieldLabelRow}>
                    <View style={styles.fieldIconPill}>
                      <AlignLeft size={12} color="#101112" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.fieldLabel}>Description (optional)</Text>
                  </View>
                  <TextInput
                    style={styles.fieldTextarea}
                    placeholder="Tell others what you plan to do, table/room number, or what to bring..."
                    placeholderTextColor={theme.colors.textTertiary}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                  />
                  <Text style={styles.fieldCounter}>{description.length}/200</Text>
                </View>

                {/* Max Participants */}
                <View style={styles.fieldGroup}>
                  <View style={styles.fieldLabelRow}>
                    <View style={styles.fieldIconPill}>
                      <Users size={12} color="#101112" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.fieldLabel}>Max Participants (optional)</Text>
                  </View>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Leave empty for unlimited participants"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={maxParticipants}
                    onChangeText={(t) => setMaxParticipants(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>
            )}

            {/* ================= STEP 5: REVIEW ================= */}
            {step === 'review' && (
              <View style={styles.stepBlock}>
                <Text style={styles.stepHeading}>Review & publish</Text>
                <Text style={styles.stepSubheading}>
                  Everything looks ready! Confirm your details below.
                </Text>

                <View style={styles.reviewSummaryCard}>
                  {/* Category & Title Header */}
                  <View style={styles.reviewHeaderRow}>
                    <View style={styles.reviewEmojiBox}>
                      <Text style={styles.reviewEmoji}>{categoryObj?.icon}</Text>
                    </View>
                    <View style={styles.reviewHeaderCol}>
                      <Text style={styles.reviewTitleText}>
                        {title.trim() || categoryObj?.name || 'Activity'}
                      </Text>
                      <View style={styles.reviewCategoryPill}>
                        <Text style={styles.reviewCategoryName}>
                          {categoryObj?.name}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Location Info */}
                  <View style={styles.reviewDetailRow}>
                    <View style={styles.reviewIconCircle}>
                      <MapPin size={16} color="#101112" strokeWidth={2.4} />
                    </View>
                    <View style={styles.reviewDetailTextCol}>
                      <Text style={styles.reviewMetaLabel}>MEETING LOCATION</Text>
                      <Text style={styles.reviewMetaValue}>{selectedLocation}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Time Info */}
                  <View style={styles.reviewDetailRow}>
                    <View style={styles.reviewIconCircle}>
                      <Clock size={16} color="#101112" strokeWidth={2.4} />
                    </View>
                    <View style={styles.reviewDetailTextCol}>
                      <Text style={styles.reviewMetaLabel}>START TIME</Text>
                      <Text style={styles.reviewMetaValue}>
                        {selectedTimeObj
                          ? `${selectedTimeObj.label} (${selectedTimeObj.relative})`
                          : selectedTime}
                      </Text>
                    </View>
                  </View>

                  {/* Description if present */}
                  {description.trim() ? (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.reviewDetailRow}>
                        <View style={styles.reviewIconCircle}>
                          <AlignLeft size={16} color="#101112" strokeWidth={2.4} />
                        </View>
                        <View style={styles.reviewDetailTextCol}>
                          <Text style={styles.reviewMetaLabel}>DESCRIPTION</Text>
                          <Text style={styles.reviewDescValue}>{description.trim()}</Text>
                        </View>
                      </View>
                    </>
                  ) : null}

                  {/* Max Participants if set */}
                  {maxParticipants ? (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.reviewDetailRow}>
                        <View style={styles.reviewIconCircle}>
                          <Users size={16} color="#101112" strokeWidth={2.4} />
                        </View>
                        <View style={styles.reviewDetailTextCol}>
                          <Text style={styles.reviewMetaLabel}>CAPACITY</Text>
                          <Text style={styles.reviewMetaValue}>{maxParticipants} students maximum</Text>
                        </View>
                      </View>
                    </>
                  ) : null}
                </View>

                {/* Host confirmation note */}
                <View style={styles.hostBanner}>
                  <Check size={16} color={theme.colors.success} strokeWidth={2.5} />
                  <Text style={styles.hostBannerText}>
                    You will be automatically joined as the host.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Sticky Bottom Action Buttons */}
          <View style={styles.bottomBarContainer}>
            <SafeAreaView edges={['bottom']}>
              <View style={styles.bottomBarRow}>
                {step !== 'category' && (
                  <AppButton
                    variant="outline"
                    size="lg"
                    title="Back"
                    onPress={prevStep}
                    style={styles.backBtn}
                  />
                )}

                <AppButton
                  variant="primary"
                  size="lg"
                  title={step === 'review' ? 'Publish Activity' : 'Continue'}
                  icon={
                    step !== 'review' ? (
                      <ChevronRight size={18} color="#101112" strokeWidth={2.5} />
                    ) : undefined
                  }
                  iconPosition="right"
                  disabled={!canProceed()}
                  loading={isPublishing}
                  onPress={step === 'review' ? handlePublish : nextStep}
                  style={styles.nextBtn}
                />
              </View>
            </SafeAreaView>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 17,
  },
  headerSubtitle: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    marginTop: 2,
  },
  headerRightSpacer: {
    width: 44,
    height: 44,
  },

  // Stepper
  stepperContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginVertical: 10,
  },
  stepperBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
  },
  stepperBarActive: {
    backgroundColor: theme.colors.accent,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 130, // Generous padding so cards are never covered by bottom bar
  },

  stepBlock: {
    width: '100%',
  },
  stepHeading: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 26,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  stepSubheading: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },

  // Full Width Card List (No shrink, no crumble!)
  listContainer: {
    width: '100%',
    gap: 12,
  },
  fullCard: {
    width: '100%',
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  fullCardSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(200, 255, 61, 0.14)',
    shadowColor: '#101112',
    shadowOpacity: 0.06,
  },

  // Card Icon Wrap
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 24,
  },

  // Text Column
  cardTextCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    marginBottom: 2,
  },
  cardSubtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
  },
  timeLargeLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 19,
    letterSpacing: -0.4,
    marginBottom: 2,
  },

  // Time pill badge
  timePillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundAlt,
    marginRight: 10,
  },
  timePillBadgeActive: {
    backgroundColor: theme.colors.accent,
  },
  timePillText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
  },
  timePillTextActive: {
    color: '#101112',
    fontFamily: theme.typography.fontFamily.bold,
  },

  // Radio circle
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  radioCircleActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },

  // Field Inputs (Details Step)
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fieldIconPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
  },
  fieldInput: {
    width: '100%',
    height: 54,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 16,
  },
  fieldTextarea: {
    width: '100%',
    minHeight: 120,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  fieldCounter: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },

  // Review Card
  reviewSummaryCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  reviewEmojiBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewEmoji: {
    fontSize: 26,
  },
  reviewHeaderCol: {
    flex: 1,
  },
  reviewTitleText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.black,
    fontSize: 19,
    letterSpacing: -0.3,
  },
  reviewCategoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  reviewCategoryName: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  reviewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewDetailTextCol: {
    flex: 1,
  },
  reviewMetaLabel: {
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  reviewMetaValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 15,
  },
  reviewDescValue: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 14,
  },

  hostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  hostBannerText: {
    color: theme.colors.success,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
  },

  // Bottom Bar Container (Clean, fixed, properly padded)
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomBarRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
});
