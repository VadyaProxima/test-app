/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  getMatches,
  MatchRequestError,
  parseMatchesResponse,
} from '../src/entities/match/api/getMatches';
import {
  filterMatches,
  formatMatchDate,
  getMatchStatusLabel,
} from '../src/entities/match/model/matches';

const fixture = JSON.parse(
  readFileSync(new URL('../data/matches.json', import.meta.url), 'utf8'),
);
const { matches } = parseMatchesResponse(fixture);

test('filters keep live in all and postponed in upcoming', () => {
  assert.equal(filterMatches(matches, 'all').length, 8);
  assert.deepEqual(
    filterMatches(matches, 'upcoming').map(({ id }) => id),
    ['m5', 'm6', 'm7', 'm8'],
  );
  assert.deepEqual(
    filterMatches(matches, 'finished').map(({ id }) => id),
    ['m1', 'm2', 'm3'],
  );
});

test('search matches both clubs, trims whitespace and ignores case', () => {
  assert.deepEqual(
    filterMatches(matches, 'all', '  сПаРтАк ').map(({ id }) => id),
    ['m1'],
  );
  assert.deepEqual(
    filterMatches(matches, 'all', 'пари').map(({ id }) => id),
    ['m5'],
  );
  assert.equal(filterMatches(matches, 'finished', 'акрон').length, 0);
  assert.equal(filterMatches(matches, 'all', 'несуществующий клуб').length, 0);
});

test('missing dates and zero scores survive parsing', () => {
  assert.deepEqual(matches[1].score, { home: 0, away: 0 });
  assert.equal(matches[6].startsAt, null);
  assert.equal(formatMatchDate(null), 'Дата уточняется');
  assert.equal(formatMatchDate('invalid'), 'Дата уточняется');
});

test('date formatting follows the device time zone', () => {
  const expected = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(matches[0].startsAt!));
  assert.equal(formatMatchDate(matches[0].startsAt), expected);
});

test('unknown status is retained with a Russian fallback', () => {
  const unknown = { ...matches[0], status: 'cancelled' };
  assert.equal(
    parseMatchesResponse({ round: 1, matches: [unknown] }).matches.length,
    1,
  );
  assert.equal(getMatchStatusLabel(unknown), 'Статус уточняется');
  assert.equal(filterMatches([unknown], 'all').length, 1);
  assert.equal(filterMatches([unknown], 'upcoming').length, 0);
  assert.equal(
    getMatchStatusLabel({ ...unknown, status: 'live', minute: 0 }),
    'В эфире · 0′',
  );
});

test('empty responses are valid; malformed and duplicate matches are rejected', () => {
  assert.deepEqual(parseMatchesResponse({ round: 12, matches: [] }), {
    round: 12,
    matches: [],
  });
  assert.throws(() => parseMatchesResponse(null));
  assert.throws(() =>
    parseMatchesResponse({
      round: 12,
      matches: [{ ...matches[0], home: null }],
    }),
  );
  assert.throws(() =>
    parseMatchesResponse({ round: 12, matches: [matches[0], matches[0]] }),
  );
});

test('HTTP failures are surfaced instead of returning fixture data', async (context) => {
  context.mock.method(
    globalThis,
    'fetch',
    async () => new Response('', { status: 503 }),
  );
  await assert.rejects(getMatches(new AbortController().signal), /HTTP 503/);
});

test('successful HTTP JSON is parsed', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => Response.json(fixture));
  assert.deepEqual(await getMatches(new AbortController().signal), fixture);
});

test('round must be a positive safe integer', () => {
  for (const round of [
    0,
    -1,
    1.5,
    '12',
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    assert.throws(
      () => parseMatchesResponse({ round, matches: [] }),
      MatchRequestError,
    );
  }
});

test('match identity, status and club fields cannot be blank', () => {
  for (const empty of ['', ' \n\t ']) {
    for (const field of ['id', 'status']) {
      assert.throws(
        () =>
          parseMatchesResponse({
            round: 1,
            matches: [{ ...matches[0], [field]: empty }],
          }),
        MatchRequestError,
      );
    }
    for (const side of ['home', 'away'] as const) {
      for (const field of ['id', 'name', 'city']) {
        const invalid = {
          ...matches[0],
          [side]: { ...matches[0][side], [field]: empty },
        };
        assert.throws(
          () => parseMatchesResponse({ round: 1, matches: [invalid] }),
          MatchRequestError,
        );
      }
    }
  }
});

test('score and minute reject negative, fractional and unsafe numbers', () => {
  for (const value of [
    -1,
    0.5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    '0',
    null,
  ]) {
    for (const field of ['home', 'away']) {
      const invalid = {
        ...matches[0],
        score: { home: 0, away: 0, [field]: value },
      };
      assert.throws(
        () => parseMatchesResponse({ round: 1, matches: [invalid] }),
        MatchRequestError,
      );
    }
    assert.throws(
      () =>
        parseMatchesResponse({
          round: 1,
          matches: [{ ...matches[0], minute: value }],
        }),
      MatchRequestError,
    );
  }
  const valid = { ...matches[0], score: { home: 0, away: 0 }, minute: 0 };
  assert.deepEqual(
    parseMatchesResponse({ round: 1, matches: [valid] }).matches,
    [valid],
  );
});

test('invalid date strings are retained for the date fallback', () => {
  const match = { ...matches[0], startsAt: 'invalid' };
  const response = parseMatchesResponse({ round: 1, matches: [match] });
  assert.equal(
    formatMatchDate(response.matches[0].startsAt),
    'Дата уточняется',
  );
});

test('malformed JSON has a readable Russian error', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => new Response('{broken'));
  await assert.rejects(getMatches(new AbortController().signal), {
    name: 'MatchRequestError',
    message: 'Сервер вернул некорректный JSON.',
  });
});

test('network errors are localized without exposing the original message', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('Network request failed');
  });
  await assert.rejects(getMatches(new AbortController().signal), {
    name: 'MatchRequestError',
    message: 'Не удалось загрузить матчи. Проверьте подключение к интернету.',
  });
});

test('abort during fetch keeps the original cancellation error', async (context) => {
  const controller = new AbortController();
  const aborted = new DOMException('The operation was aborted', 'AbortError');
  context.mock.method(globalThis, 'fetch', async () => {
    controller.abort();
    throw aborted;
  });
  await assert.rejects(
    getMatches(controller.signal),
    (error) => error === aborted,
  );
});

test('abort while reading JSON keeps the original cancellation error', async (context) => {
  const aborted = new DOMException('The operation was aborted', 'AbortError');
  const response = new Response();
  context.mock.method(response, 'json', async () => {
    throw aborted;
  });
  context.mock.method(globalThis, 'fetch', async () => response);
  await assert.rejects(
    getMatches(new AbortController().signal),
    (error) => error === aborted,
  );
});
