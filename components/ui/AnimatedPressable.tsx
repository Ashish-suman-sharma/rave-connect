import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle, View, Platform, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  activeScale?: number;
  hapticFeedback?: boolean;
}

const isNative = Platform.OS !== 'web';

const AnimatedPressableComponent = React.forwardRef<View, AnimatedPressableProps>(
  ({ children, style, onPressIn, onPressOut, onPress, activeScale = 0.95, hapticFeedback = true, ...props }, ref) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = (e: any) => {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      Animated.spring(scaleAnim, {
        toValue: activeScale,
        useNativeDriver: isNative,
        speed: 20,
        bounciness: 10,
      }).start();
      if (onPressIn) onPressIn(e);
    };

    const handlePressOut = (e: any) => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: isNative,
        speed: 20,
        bounciness: 10,
      }).start();
      if (onPressOut) onPressOut(e);
    };

    const handlePress = (e: any) => {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      if (onPress) onPress(e);
    };

    return (
      <Pressable
        {...props}
        style={(state) => {
          const resolvedStyle = typeof style === 'function' ? style(state) : style;
          const flat = StyleSheet.flatten(resolvedStyle);
          if (!flat) return undefined;
          return {
            ...(flat.flex !== undefined ? { flex: flat.flex } : {}),
            ...(flat.flexGrow !== undefined ? { flexGrow: flat.flexGrow } : {}),
            ...(flat.flexShrink !== undefined ? { flexShrink: flat.flexShrink } : {}),
            ...(flat.width !== undefined ? { width: flat.width } : {}),
            ...(flat.alignSelf !== undefined ? { alignSelf: flat.alignSelf } : {}),
          };
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        {({ pressed }) => (
          <Animated.View
            style={[
              typeof style === 'function' ? style({ pressed }) : style,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            {typeof children === 'function' ? (children as any)({ pressed }) : children}
          </Animated.View>
        )}
      </Pressable>
    );
  }
);

export const AnimatedPressable = AnimatedPressableComponent;
