import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/config';

export function MatchesFooter({ compact }: { compact: boolean }) {
  return (
    <View
      testID="matches-footer"
      style={[styles.footer, compact && styles.compact]}
    >
      <Text style={styles.footerText}>Футбол, за которым хочется следить.</Text>
      <Text style={[styles.footerHint, compact && styles.hidden]}>
        Отмечайте любимые матчи звёздочкой
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { alignItems: 'center', paddingVertical: 14, gap: 8 },
  footerText: { fontSize: 11, fontWeight: '600', color: colors.muted },
  footerHint: { fontSize: 10, color: colors.subtle },
  compact: { paddingVertical: 10 },
  hidden: { display: 'none' },
});
