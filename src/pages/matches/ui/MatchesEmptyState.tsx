import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../../shared/config';

type Props = {
  loading: boolean;
  failed: boolean;
  favoritesOnly: boolean;
  filtered: boolean;
  onReset: () => void;
};

export function MatchesEmptyState({
  loading,
  failed,
  favoritesOnly,
  filtered,
  onReset,
}: Props) {
  const title = failed
    ? 'Не удалось загрузить матчи'
    : filtered
      ? 'Матчи не найдены'
      : favoritesOnly
        ? 'Пока нет избранных матчей'
        : 'В этом туре пока нет матчей';
  const description = failed
    ? 'Проверьте соединение и попробуйте ещё раз.'
    : filtered
      ? 'Попробуйте другое название клуба или измените фильтр.'
      : favoritesOnly
        ? 'Нажмите звёздочку в карточке — матч появится здесь.'
        : 'Обновите расписание чуть позже.';

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color={colors.green} />
          <Text style={styles.title}>Загружаем матчи</Text>
          <Text style={styles.description}>Готовим расписание тура…</Text>
        </>
      ) : (
        <>
          <Text style={styles.symbol}>
            {failed ? '!' : favoritesOnly ? '☆' : '—'}
          </Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          {!failed && (filtered || favoritesOnly) && (
            <Pressable
              accessibilityRole="button"
              onPress={onReset}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {filtered ? 'Сбросить фильтры' : 'Посмотреть все матчи'}
              </Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 55,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    gap: 12,
  },
  symbol: {
    fontSize: 30,
    color: colors.muted,
    width: 52,
    height: 52,
    textAlign: 'center',
    lineHeight: 52,
    backgroundColor: colors.background,
    borderRadius: 26,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.muted,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  buttonText: { color: colors.accentInk, fontSize: 12, fontWeight: '700' },
});
