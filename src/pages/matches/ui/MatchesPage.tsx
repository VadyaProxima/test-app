import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors } from '../../../shared/config';
import { useMatchesPage } from '../model/useMatchesPage';
import { MatchesControls } from './MatchesControls';
import { MatchesFooter } from './MatchesFooter';
import { MatchesHeader } from './MatchesHeader';
import { MatchesResults } from './MatchesResults';

export function MatchesPage() {
  const model = useMatchesPage();
  const { width, height } = useWindowDimensions();
  const compact = width < 600;
  const dense = compact || height < 850;

  return (
    <View style={styles.root}>
      <View style={[styles.viewport, compact && styles.compactViewport]}>
        {height >= 540 && (
          <MatchesHeader
            round={model.data?.round}
            liveCount={model.liveCount}
            compact={compact}
            dense={dense}
            showHero={height >= 620}
          />
        )}
        <MatchesControls
          total={model.total}
          favoritesCount={model.favoritesCount}
          filter={model.filter}
          setFilter={model.setFilter}
          query={model.query}
          setQuery={model.setQuery}
          busy={model.busy}
          isRefreshing={model.isRefreshing}
          refresh={model.refresh}
          updatedAt={model.updatedAt}
          compact={compact}
          compactToolbar={width < 820}
        />
        <MatchesResults model={model} />
        <MatchesFooter compact={dense} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  viewport: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    paddingHorizontal: 36,
  },
  compactViewport: { paddingHorizontal: 16 },
});
