import { FlatList, StyleSheet, View } from 'react-native';
import { MatchCard } from '../../../entities/match';
import { FavoriteButton } from '../../../features/match-favorites';
import { FadeIn } from '../../../shared/ui';
import type { useMatchesPage } from '../model/useMatchesPage';
import { MatchesEmptyState } from './MatchesEmptyState';
import { MatchesNotices } from './MatchesNotices';

type Props = { model: ReturnType<typeof useMatchesPage> };

export function MatchesResults({ model }: Props) {
  return (
    <View style={styles.viewport}>
      <FlatList
        testID="matches-results"
        style={styles.list}
        contentContainerStyle={styles.content}
        data={model.visibleMatches}
        keyExtractor={(match) => match.id}
        extraData={model.favorites}
        keyboardShouldPersistTaps="handled"
        onRefresh={model.refresh}
        refreshing={model.isRefreshing}
        ListHeaderComponent={
          <MatchesNotices
            error={model.error}
            storageError={model.storageError}
            busy={model.busy}
            refresh={model.refresh}
          />
        }
        renderItem={({ item }) => (
          <FadeIn key={`${model.filter}:${item.id}`}>
            <MatchCard
              match={item}
              actions={
                <FavoriteButton
                  active={model.isFavorite(item.id)}
                  onPress={() => model.toggle(item.id)}
                />
              }
            />
          </FadeIn>
        )}
        ListEmptyComponent={
          <FadeIn key={model.filter}>
            <MatchesEmptyState
              loading={model.loading}
              failed={model.failed}
              favoritesOnly={model.filter === 'favorites'}
              filtered={model.filtered}
              onReset={model.resetFilters}
            />
          </FadeIn>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, minHeight: 0, overflow: 'hidden' },
  list: { flex: 1, minHeight: 0 },
  content: { paddingBottom: 4 },
});
