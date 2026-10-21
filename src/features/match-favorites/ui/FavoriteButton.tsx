import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../../shared/config';

type Props = {
  active: boolean;
  onPress: () => void;
};

export function FavoriteButton({ active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={
        active ? 'Убрать из избранного' : 'Добавить в избранное'
      }
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.button,
        active && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.star, active && styles.active]}>
        {active ? '★' : '☆'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.raised,
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.65,
  },
  star: {
    fontSize: 25,
    lineHeight: 30,
    color: colors.muted,
  },
  active: {
    color: colors.accentInk,
  },
});
