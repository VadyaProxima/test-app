import { useState } from 'react';
import {
  filterMatches,
  useMatches,
  type MatchFilter,
} from '../../../entities/match';
import { useFavorites } from '../../../features/match-favorites';

export type MatchesTab = MatchFilter | 'favorites';

export function useMatchesPage() {
  const matchesRequest = useMatches();
  const favoritesState = useFavorites();
  const [filter, setFilter] = useState<MatchesTab>('all');
  const [query, setQuery] = useState('');
  const matches = matchesRequest.data?.matches ?? [];
  const favoriteMatches = matches.filter((match) =>
    favoritesState.isFavorite(match.id),
  );
  const visibleMatches = filterMatches(
    filter === 'favorites' ? favoriteMatches : matches,
    filter === 'favorites' ? 'all' : filter,
    query,
  );

  function resetFilters() {
    setFilter('all');
    setQuery('');
  }

  return {
    ...matchesRequest,
    ...favoritesState,
    filter,
    setFilter,
    query,
    setQuery,
    visibleMatches,
    resetFilters,
    total: matches.length,
    favoritesCount: favoriteMatches.length,
    liveCount: matches.filter((match) => match.status === 'live').length,
    busy: matchesRequest.isLoading || matchesRequest.isRefreshing,
    loading:
      matchesRequest.isLoading ||
      (filter === 'favorites' && !favoritesState.isHydrated),
    failed: Boolean(matchesRequest.error && !matchesRequest.data),
    filtered:
      Boolean(query.trim()) || filter === 'upcoming' || filter === 'finished',
  };
}
