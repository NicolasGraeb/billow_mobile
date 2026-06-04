import { memo, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { getStaggeredEntering } from '@/lib/animations';

interface StaggeredFadeInProps {
  index: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function StaggeredFadeIn({ index, children, style }: StaggeredFadeInProps) {
  const reducedMotion = useReducedMotion();
  const entering = reducedMotion ? undefined : getStaggeredEntering(index);

  if (!entering) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

export default memo(StaggeredFadeIn);
