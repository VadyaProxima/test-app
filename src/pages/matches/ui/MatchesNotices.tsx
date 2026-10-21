import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/config';

type Props = {
  error: string | null;
  storageError: string | null;
  busy: boolean;
  refresh: () => void;
};
export function MatchesNotices({ error, storageError, busy, refresh }: Props) {
  return (
    <>
      {error && (
        <View accessibilityRole="alert" style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={refresh}
            disabled={busy}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Повторить</Text>
          </Pressable>
        </View>
      )}
      {storageError && (
        <View accessibilityRole="alert" style={styles.errorBanner}>
          <Text style={styles.errorText}>{storageError}</Text>
        </View>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: colors.dangerSurface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 20 },
  retryButton: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 7,
    backgroundColor: colors.accent,
  },
  retryText: { color: colors.accentInk, fontSize: 12, fontWeight: '700' },
});
