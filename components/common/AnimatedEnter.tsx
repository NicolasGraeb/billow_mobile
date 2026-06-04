import { memo, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useReducedMotion,
  type EntryOrExitLayoutType,
} from 'react-native-reanimated';

interface AnimatedEnterProps {
  entering: EntryOrExitLayoutType;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function AnimatedEnter({ entering, children, style }: AnimatedEnterProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

export default memo(AnimatedEnter);
