import { useCallback, useState } from 'react';

// Избранное живёт в памяти до закрытия приложения.
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  const toggle = useCallback((id: string) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id],
    );
  }, []);

  return { favorites, isFavorite, toggle };
}
