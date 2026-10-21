import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/config';

type Props = {
  round?: number;
  liveCount: number;
  compact: boolean;
  dense: boolean;
  showHero: boolean;
};

export function MatchesHeader({
  round,
  liveCount,
  compact,
  dense,
  showHero,
}: Props) {
  return (
    <>
      <View style={[styles.navbar, dense && styles.denseNavbar]}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>м</Text>
          </View>
          <Text style={styles.brandName}>
            матчдэй<Text style={styles.brandPeriod}>.</Text>
          </Text>
        </View>
        <View style={styles.navPill}>
          <View style={styles.navDot} />
          <Text style={styles.navText}>ФУТБОЛ</Text>
        </View>
      </View>

      <View
        style={[
          styles.hero,
          compact && styles.compactHero,
          dense && styles.denseHero,
          !showHero && styles.hidden,
        ]}
      >
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, dense && styles.hidden]}>
            КАЖДЫЙ МАТЧ. КАЖДАЯ ЭМОЦИЯ.
          </Text>
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              compact && styles.compactTitle,
              dense && styles.denseTitle,
            ]}
          >
            Матчи тура
          </Text>
          <Text style={[styles.subtitle, dense && styles.hidden]}>
            Большой футбол — в одном месте.
          </Text>
          <View style={[styles.heroBadges, dense && styles.denseBadges]}>
            <View style={styles.roundBadge}>
              <Text style={styles.roundBadgeText}>
                {round != null ? `${round}-й тур` : 'Текущий тур'}
              </Text>
            </View>
            {liveCount > 0 && (
              <View style={styles.liveBadge}>
                <View style={styles.heroLiveDot} />
                <Text style={styles.liveBadgeText}>В эфире: {liveCount}</Text>
              </View>
            )}
          </View>
        </View>
        {!compact && !dense && (
          <View style={styles.pitch} accessibilityElementsHidden>
            <View style={styles.pitchLine} />
            <View style={styles.pitchCircle} />
            <View style={styles.pitchGoal} />
            <Text style={styles.pitchNumber}>{round ?? '—'}</Text>
            <Text style={styles.pitchLabel}>ТУР</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 27,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: {
    backgroundColor: colors.raised,
    width: 31,
    height: 31,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  brandIconText: {
    color: colors.accent,
    fontWeight: '900',
    fontSize: 23,
    marginTop: -4,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
  },
  brandPeriod: { color: colors.accent },
  navPill: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 11,
    backgroundColor: colors.surface,
  },
  navDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  navText: {
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: colors.text,
  },
  hero: {
    backgroundColor: colors.hero,
    borderRadius: 24,
    padding: 36,
    overflow: 'hidden',
    minHeight: 250,
    flexDirection: 'row',
    marginBottom: 36,
  },
  compactHero: { padding: 24, minHeight: 226, marginBottom: 28 },
  heroCopy: { flex: 1, justifyContent: 'center', zIndex: 1 },
  eyebrow: {
    color: colors.heroMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.9,
  },
  title: {
    color: colors.text,
    fontSize: 49,
    lineHeight: 62,
    fontWeight: '800',
    letterSpacing: -2,
    marginTop: 11,
  },
  compactTitle: { fontSize: 37, lineHeight: 48, letterSpacing: -1.5 },
  subtitle: { color: colors.heroMuted, fontSize: 13, marginTop: 4 },
  heroBadges: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 25,
    alignItems: 'center',
  },
  roundBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  roundBadgeText: { fontSize: 11, fontWeight: '800', color: colors.accentInk },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  liveBadgeText: { color: colors.heroMuted, fontSize: 11 },
  pitch: {
    width: 228,
    position: 'absolute',
    right: -17,
    top: 25,
    bottom: 25,
    borderWidth: 1,
    borderColor: colors.pitchLine,
    borderRadius: 5,
    transform: [{ rotate: '-14deg' }],
  },
  pitchLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.pitchLine,
  },
  pitchCircle: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 42,
    borderWidth: 1,
    borderColor: colors.pitchLine,
    top: 59,
    left: 72,
  },
  pitchGoal: {
    position: 'absolute',
    top: 50,
    bottom: 50,
    right: 0,
    width: 36,
    borderWidth: 1,
    borderColor: colors.pitchLine,
  },
  pitchNumber: {
    color: colors.accent,
    fontWeight: '900',
    fontSize: 116,
    letterSpacing: -8,
    position: 'absolute',
    top: 7,
    left: 25,
    transform: [{ rotate: '14deg' }],
  },
  pitchLabel: {
    color: colors.heroMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 5,
    position: 'absolute',
    bottom: 15,
    left: 84,
    transform: [{ rotate: '14deg' }],
  },
  denseNavbar: { paddingVertical: 12 },
  denseHero: {
    minHeight: 100,
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  denseTitle: { fontSize: 29, lineHeight: 35, marginTop: 0, letterSpacing: -1 },
  denseBadges: { marginTop: 9 },
  hidden: { display: 'none' },
});
