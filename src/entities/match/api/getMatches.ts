import { MATCHES_URL } from '../../../config';
import type { Match, MatchesResponse, Team } from '../model/types';

export class MatchRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MatchRequestError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonblankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonnegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isTeam(value: unknown): value is Team {
  return (
    isRecord(value) &&
    isNonblankString(value.id) &&
    isNonblankString(value.name) &&
    isNonblankString(value.city)
  );
}

function isScore(value: unknown) {
  return (
    value === null ||
    (isRecord(value) &&
      isNonnegativeInteger(value.home) &&
      isNonnegativeInteger(value.away))
  );
}

function isMatch(value: unknown): value is Match {
  return (
    isRecord(value) &&
    isNonblankString(value.id) &&
    (value.startsAt === null || typeof value.startsAt === 'string') &&
    isNonblankString(value.status) &&
    isTeam(value.home) &&
    isTeam(value.away) &&
    isScore(value.score) &&
    (value.minute === undefined || isNonnegativeInteger(value.minute))
  );
}

export function parseMatchesResponse(value: unknown): MatchesResponse {
  if (
    !isRecord(value) ||
    !isNonnegativeInteger(value.round) ||
    value.round === 0 ||
    !Array.isArray(value.matches) ||
    !value.matches.every(isMatch)
  ) {
    throw new MatchRequestError('Сервер вернул данные в неожиданном формате.');
  }
  const ids = new Set(value.matches.map((match) => match.id));
  if (ids.size !== value.matches.length) {
    throw new MatchRequestError(
      'В ответе сервера повторяются идентификаторы матчей.',
    );
  }
  return { round: Number(value.round), matches: value.matches };
}

export async function getMatches(
  signal: AbortSignal,
): Promise<MatchesResponse> {
  let response: Response;
  try {
    response = await fetch(MATCHES_URL, { signal, cache: 'no-store' });
  } catch (error) {
    if (
      signal.aborted ||
      (error instanceof Error && error.name === 'AbortError')
    )
      throw error;
    throw new MatchRequestError(
      'Не удалось загрузить матчи. Проверьте подключение к интернету.',
    );
  }
  if (!response.ok) {
    throw new MatchRequestError(
      `Не удалось загрузить матчи (HTTP ${response.status}).`,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    if (
      signal.aborted ||
      (error instanceof Error && error.name === 'AbortError')
    )
      throw error;
    throw new MatchRequestError(
      error instanceof SyntaxError
        ? 'Сервер вернул некорректный JSON.'
        : 'Не удалось прочитать ответ сервера. Проверьте подключение к интернету.',
    );
  }
  return parseMatchesResponse(data);
}
