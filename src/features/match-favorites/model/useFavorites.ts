import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FAVORITES_STORAGE_KEY,
  parseFavoriteIds,
  toggleFavorite,
} from './favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const hydrated = useRef(false);
  const pendingToggles = useRef<string[]>([]);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      let saved: string[] = [];
      try {
        saved = parseFavoriteIds(
          await AsyncStorage.getItem(FAVORITES_STORAGE_KEY),
        );
      } catch {
        if (!cancelled)
          setStorageError('Не удалось прочитать сохранённое избранное.');
      }
      if (cancelled) return;

      // Нажатия до завершения чтения применяются поверх сохранённых отметок.
      const restored = pendingToggles.current.reduce(toggleFavorite, saved);
      pendingToggles.current = [];
      hydrated.current = true;
      setFavorites(restored);
      setIsHydrated(true);
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || !hasChanges) return;
    let cancelled = false;

    // Последовательная запись защищает от потери последних быстрых нажатий.
    saveQueue.current = saveQueue.current
      .then(() =>
        AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites)),
      )
      .then(() => {
        if (!cancelled) setStorageError(null);
      })
      .catch(() => {
        if (!cancelled)
          setStorageError(
            'Не удалось сохранить избранное. Отметки доступны до закрытия приложения.',
          );
      });

    return () => {
      cancelled = true;
    };
  }, [favorites, hasChanges, isHydrated]);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  const toggle = useCallback((id: string) => {
    if (!hydrated.current) pendingToggles.current.push(id);
    setFavorites((current) => toggleFavorite(current, id));
    setHasChanges(true);
  }, []);

  return { favorites, isFavorite, toggle, isHydrated, storageError };
}
