import { useCallback, useEffect, useRef, useState } from 'react';
import { getMatches, MatchRequestError } from '../api/getMatches';
import type { MatchesResponse } from './types';

type State = {
  data: MatchesResponse | null;
  isLoading: boolean;
  error: string | null;
  updatedAt: Date | null;
};

export function useMatches() {
  const [state, setState] = useState<State>({
    data: null,
    isLoading: true,
    error: null,
    updatedAt: null,
  });
  const request = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState((previous) => ({ ...previous, isLoading: true, error: null }));
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const data = await getMatches(controller.signal);
      if (request.current === controller && !controller.signal.aborted) {
        setState({
          data,
          isLoading: false,
          error: null,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      if (request.current !== controller) return;
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: controller.signal.aborted
          ? 'Сервер не ответил вовремя. Попробуйте ещё раз.'
          : error instanceof MatchRequestError
            ? error.message
            : 'Не удалось загрузить матчи. Попробуйте ещё раз.',
      }));
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return () => {
      const controller = request.current;
      request.current = null;
      controller?.abort();
    };
  }, [refresh]);

  return {
    ...state,
    isLoading: state.isLoading && state.data === null,
    isRefreshing: state.isLoading && state.data !== null,
    refresh,
  };
}
