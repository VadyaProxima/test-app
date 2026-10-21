import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';
import { colors } from '../../../shared/config';
import { formatMatchDate, getMatchStatusLabel } from '../model/matches';
import type { Match } from '../model/types';

type Props = {
  match: Match;
  actions?: ReactNode;
};

const clubColors: Record<string, string> = {
  zenit: '#2384B4',
  spartak: '#C34448',
  lokomotiv: '#348264',
  cska: '#405A9F',
  krasnodar: '#35755C',
  rostov: '#AD882E',
  dynamo: '#386CC0',
  rubin: '#9F4053',
  'pari-nn': '#3C8FAD',
  akron: '#B14F49',
  krylia: '#4B86A8',
  akhmat: '#38775A',
  baltika: '#466DAB',
  fakel: '#3A6490',
  orenburg: '#455E9E',
  'dynamo-mkh': '#4D7C9B',
};

function Club({ club, compact }: { club: Match['home']; compact: boolean }) {
  const initials = club.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('');

  return (
    <View style={styles.club}>
      <View
        accessibilityElementsHidden
        style={[
          styles.crest,
          { backgroundColor: clubColors[club.id] ?? colors.crestFallback },
          compact && styles.smallCrest,
        ]}
      >
        <Text style={[styles.crestText, compact && styles.smallCrestText]}>
          {initials}
        </Text>
        <View style={styles.crestStripe} />
      </View>
      <Text style={[styles.clubName, compact && styles.smallClubName]}>
        {club.name}
      </Text>
      <Text style={styles.city}>{club.city}</Text>
    </View>
  );
}

export function MatchCard({ match, actions }: Props) {
  const compact = useWindowDimensions().width < 600;
  const live = match.status === 'live';
  const postponed = match.status === 'postponed';

  return (
    <View
      style={[
        styles.card,
        live && styles.liveCard,
        compact && styles.compactCard,
      ]}
    >
      <View style={styles.topline}>
        <View
          style={[
            styles.status,
            live && styles.liveStatus,
            postponed && styles.postponedStatus,
          ]}
        >
          {live && <View style={styles.liveDot} />}
          <Text
            style={[
              styles.statusText,
              live && styles.liveText,
              postponed && styles.postponedText,
            ]}
          >
            {getMatchStatusLabel(match)}
          </Text>
        </View>
        {actions}
      </View>

      <View style={styles.matchup}>
        <Club club={match.home} compact={compact} />
        <View style={[styles.scoreBlock, compact && styles.smallScoreBlock]}>
          <Text
            accessibilityLabel={
              match.score
                ? `Счёт ${match.score.home} : ${match.score.away}`
                : 'Матч ещё не начался'
            }
            style={[
              styles.score,
              compact && styles.smallScore,
              live && styles.liveText,
              !match.score && styles.noScore,
            ]}
          >
            {match.score
              ? `${match.score.home} : ${match.score.away}`
              : '— : —'}
          </Text>
          <Text style={styles.scoreCaption}>
            {live
              ? 'МАТЧ ИДЁТ'
              : match.score
                ? 'ИТОГОВЫЙ СЧЁТ'
                : 'НАЧАЛО МАТЧА'}
          </Text>
        </View>
        <Club club={match.away} compact={compact} />
      </View>

      <View style={styles.bottomline}>
        <Text style={styles.date}>{formatMatchDate(match.startsAt)}</Text>
        <Text style={styles.homeAway}>Хозяева · Гости</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 24,
    marginBottom: 12,
  },
  liveCard: { borderColor: colors.liveBorder },
  compactCard: { padding: 16 },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: colors.background,
  },
  liveStatus: { backgroundColor: colors.greenLight },
  postponedStatus: { backgroundColor: colors.amberLight },
  statusText: { fontSize: 11, fontWeight: '600', color: colors.muted },
  liveText: { color: colors.green },
  postponedText: { color: colors.amber },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  matchup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 23,
  },
  club: { flex: 1, alignItems: 'center', gap: 5, minWidth: 0 },
  crest: {
    width: 48,
    height: 55,
    borderRadius: 13,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  smallCrest: { width: 40, height: 46 },
  crestText: {
    color: colors.crestText,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  smallCrestText: { fontSize: 16 },
  crestStripe: {
    position: 'absolute',
    width: 65,
    height: 4,
    backgroundColor: colors.crestText,
    opacity: 0.25,
    bottom: 9,
    transform: [{ rotate: '-25deg' }],
  },
  clubName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
  },
  smallClubName: { fontSize: 14, lineHeight: 19 },
  city: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
    textAlign: 'center',
  },
  scoreBlock: { width: 154, alignItems: 'center', gap: 8 },
  smallScoreBlock: { width: 92 },
  score: {
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  smallScore: { fontSize: 27, lineHeight: 35 },
  noScore: { color: colors.subtle, fontWeight: '500' },
  scoreCaption: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  bottomline: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  date: { color: colors.muted, fontSize: 11 },
  homeAway: { color: colors.subtle, fontSize: 10 },
});
