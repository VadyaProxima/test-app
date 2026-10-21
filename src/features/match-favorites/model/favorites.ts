export const FAVORITES_STORAGE_KEY = 'matches-task:favorites:v1';

export function parseFavoriteIds(raw: string | null): string[] {
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (
    !Array.isArray(value) ||
    !value.every((id) => typeof id === 'string' && id.trim().length > 0)
  ) {
    throw new Error('Invalid saved favorites');
  }
  return [...new Set(value)];
}

export function toggleFavorite(favorites: string[], id: string) {
  return favorites.includes(id)
    ? favorites.filter((favoriteId) => favoriteId !== id)
    : [...favorites, id];
}
