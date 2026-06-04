import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressAnimation } from '@/hooks/usePressAnimation';
import { PRESS_SCALE } from '@/lib/animations';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = PressableProps & {
  scale?: number;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function AnimatedPressable({
  children,
  scale = PRESS_SCALE,
  haptic = false,
  disabled,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: AnimatedPressableProps) {
  const { animatedStyle, onPressIn: animateIn, onPressOut: animateOut, resetScale } =
    usePressAnimation(scale);

  const handlePressIn = useCallback(
    (event: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      if (!disabled) {
        animateIn();
        if (haptic) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
      onPressIn?.(event);
    },
    [disabled, animateIn, haptic, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      if (!disabled) {
        animateOut();
      } else {
        resetScale();
      }
      onPressOut?.(event);
    },
    [disabled, animateOut, resetScale, onPressOut],
  );

  return (
    <AnimatedPressableBase
      {...rest}
      disabled={disabled}
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressableBase>
  );
}
