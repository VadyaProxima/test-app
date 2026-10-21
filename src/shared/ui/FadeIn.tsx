import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing } from 'react-native';

export function FadeIn({ children }: { children: ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress]);

  return (
    <Animated.View style={{
      opacity: progress,
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
    }}>
      {children}
    </Animated.View>
  );
}
