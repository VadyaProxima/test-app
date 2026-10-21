import { MATCHES_URL } from '../../../config';
import type { Match, MatchesResponse, Team } from '../model/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTeam(value: unknown): value is Team {
  return isRecord(value) && typeof value.id === 'string' &&
    typeof value.name === 'string' && typeof value.city === 'string';
}

function isScore(value: unknown) {
  return value === null || (isRecord(value) &&
    Number.isInteger(value.home) && Number(value.home) >= 0 &&
    Number.isInteger(value.away) && Number(value.away) >= 0);
}

function isMatch(value: unknown): value is Match {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0 &&
    (value.startsAt === null || typeof value.startsAt === 'string') &&
    typeof value.status === 'string' && isTeam(value.home) && isTeam(value.away) &&
    isScore(value.score) &&
    (value.minute === undefined || (typeof value.minute === 'number' && Number.isFinite(value.minute)));
}

export function parseMatchesResponse(value: unknown): MatchesResponse {
  if (!isRecord(value) || !Number.isInteger(value.round) ||
      !Array.isArray(value.matches) || !value.matches.every(isMatch)) {
    throw new Error('Сервер вернул данные в неожиданном формате.');
  }
  const ids = new Set(value.matches.map((match) => match.id));
  if (ids.size !== value.matches.length) {
    throw new Error('В ответе сервера повторяются идентификаторы матчей.');
  }
  return { round: Number(value.round), matches: value.matches };
}

export async function getMatches(signal: AbortSignal): Promise<MatchesResponse> {
  const response = await fetch(MATCHES_URL, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`Не удалось загрузить матчи (HTTP ${response.status}).`);
  return parseMatchesResponse(await response.json());
}
