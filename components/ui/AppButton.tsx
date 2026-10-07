// ============================================================
// Rave Connect — Reusable AppButton Component
// Unified design system button with consistent sizing, radius, and tactile feedback
// ============================================================
import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { theme } from '@/lib/theme';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'danger-solid'
  | 'success'
  | 'joined'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  pill?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  pill = false,
  style,
  textStyle,
  children,
}) => {
  const getContainerStyle = (): StyleProp<ViewStyle> => {
    const list: ViewStyle[] = [styles.base];

    // Sizing
    switch (size) {
      case 'sm':
        list.push(styles.sizeSm);
        break;
      case 'md':
        list.push(styles.sizeMd);
        break;
      case 'lg':
      default:
        list.push(styles.sizeLg);
        break;
    }

    // Border Radius
    if (pill) {
      list.push(styles.pillRadius);
    } else {
      list.push(styles.standardRadius);
    }

    // Variants
    switch (variant) {
      case 'primary':
        list.push(styles.variantPrimary);
        break;
      case 'secondary':
        list.push(styles.variantSecondary);
        break;
      case 'outline':
        list.push(styles.variantOutline);
        break;
      case 'danger':
        list.push(styles.variantDanger);
        break;
      case 'danger-solid':
        list.push(styles.variantDangerSolid);
        break;
      case 'success':
        list.push(styles.variantSuccess);
        break;
      case 'joined':
        list.push(styles.variantJoined);
        break;
      case 'ghost':
        list.push(styles.variantGhost);
        break;
    }

    if (fullWidth) {
      list.push(styles.fullWidth);
    }

    if (disabled || loading) {
      list.push(styles.disabled);
    }

    return list;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return theme.colors.textOnAccent; // '#101112' on lime
      case 'danger-solid':
      case 'success':
        return '#FFFFFF';
      case 'danger':
        return theme.colors.danger;
      case 'joined':
        return theme.colors.textPrimary;
      case 'secondary':
      case 'outline':
      case 'ghost':
      default:
        return theme.colors.textPrimary;
    }
  };

  const getTextSizeStyle = (): StyleProp<TextStyle> => {
    switch (size) {
      case 'sm':
        return styles.textSm;
      case 'md':
        return styles.textMd;
      case 'lg':
      default:
        return styles.textLg;
    }
  };

  const textColor = getTextColor();

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      activeScale={0.97}
      hapticFeedback={!disabled}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={[styles.iconWrap, { marginRight: title || children ? 8 : 0 }]}>
              {icon}
            </View>
          )}

          {title ? (
            <Text style={[styles.baseText, getTextSizeStyle(), { color: textColor }, textStyle]}>
              {title}
            </Text>
          ) : (
            children
          )}

          {icon && iconPosition === 'right' && (
            <View style={[styles.iconWrap, { marginLeft: title || children ? 8 : 0 }]}>
              {icon}
            </View>
          )}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  standardRadius: {
    borderRadius: theme.radius.xl, // 16px
  },
  pillRadius: {
    borderRadius: theme.radius.pill, // 999px
  },
  fullWidth: {
    width: '100%',
  },

  // Sizing (Fixed uniform heights!)
  sizeSm: {
    height: 38,
    paddingHorizontal: theme.spacing.md,
  },
  sizeMd: {
    height: 46,
    paddingHorizontal: theme.spacing.lg,
  },
  sizeLg: {
    height: 52,
    paddingHorizontal: theme.spacing.xl,
  },

  // Variants
  variantPrimary: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
    shadowColor: '#101112',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  variantSecondary: {
    backgroundColor: theme.colors.backgroundAlt,
    borderColor: theme.colors.border,
  },
  variantOutline: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  variantDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  variantDangerSolid: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
  },
  variantSuccess: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  variantJoined: {
    backgroundColor: theme.colors.accentMuted,
    borderColor: 'rgba(200, 255, 61, 0.6)',
  },
  variantGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  disabled: {
    opacity: 0.5,
  },

  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  baseText: {
    fontFamily: theme.typography.fontFamily.bold,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  textSm: {
    fontSize: theme.typography.sizes.caption,
  },
  textMd: {
    fontSize: theme.typography.sizes.body,
  },
  textLg: {
    fontSize: theme.typography.sizes.bodyLarge,
  },
});

export default AppButton;
