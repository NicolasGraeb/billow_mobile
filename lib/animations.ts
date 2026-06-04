import { Easing, FadeIn, type EntryOrExitLayoutType } from 'react-native-reanimated';

export const PRESS_SCALE = 0.992;
export const PRESS_DURATION_MS = 100;

const STAGGER_DELAY = 35;
const MAX_STAGGER_INDEX = 10;

const STAGGER_BASE = FadeIn.duration(220).easing(Easing.out(Easing.cubic));

export const STAGGERED_ENTERING: EntryOrExitLayoutType[] = Array.from(
  { length: MAX_STAGGER_INDEX + 1 },
  (_, index) => STAGGER_BASE.delay(index * STAGGER_DELAY),
);

export const SCREEN_FADE_IN: EntryOrExitLayoutType = FadeIn.duration(240).easing(
  Easing.out(Easing.cubic),
);
export const HEADER_ENTER: EntryOrExitLayoutType = FadeIn.duration(280).easing(
  Easing.out(Easing.cubic),
);
export const SPLASH_FADE_IN: EntryOrExitLayoutType = FadeIn.duration(220);

export function getStaggeredEntering(index: number): EntryOrExitLayoutType {
  const clamped = Math.min(Math.max(0, index), MAX_STAGGER_INDEX);
  return STAGGERED_ENTERING[clamped];
}
