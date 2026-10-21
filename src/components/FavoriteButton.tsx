import { Pressable, StyleSheet, Text } from 'react-native';

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
      accessibilityLabel={active ? 'Убрать из избранного' : 'Добавить в избранное'}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.button,
        active && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.star, active && styles.active]}>{active ? '★' : '☆'}</Text>
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
    borderColor: '#e5e9e2',
    backgroundColor: '#f7f9f5',
  },
  selected: {
    backgroundColor: '#eafaaf',
    borderColor: '#d3e993',
  },
  pressed: {
    opacity: 0.65,
  },
  star: {
    fontSize: 25,
    lineHeight: 30,
    color: '#7a8476',
  },
  active: {
    color: '#36532b',
  },
});
