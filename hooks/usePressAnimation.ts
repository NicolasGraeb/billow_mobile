import { useCallback } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PRESS_DURATION_MS, PRESS_SCALE } from '@/lib/animations';

const PRESS_EASING = Easing.out(Easing.cubic);

export function usePressAnimation(scale = PRESS_SCALE) {
  const reducedMotion = useReducedMotion();
  const pressed = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));

  const onPressIn = useCallback(() => {
    if (reducedMotion) return;
    pressed.value = withTiming(scale, {
      duration: PRESS_DURATION_MS,
      easing: PRESS_EASING,
    });
  }, [reducedMotion, pressed, scale]);

  const onPressOut = useCallback(() => {
    if (reducedMotion) return;
    pressed.value = withTiming(1, {
      duration: PRESS_DURATION_MS,
      easing: PRESS_EASING,
    });
  }, [reducedMotion, pressed]);

  const resetScale = useCallback(() => {
    pressed.value = 1;
  }, [pressed]);

  return { animatedStyle, onPressIn, onPressOut, resetScale, reducedMotion };
}
