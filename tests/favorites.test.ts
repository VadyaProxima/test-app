/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  parseFavoriteIds,
  toggleFavorite,
} from '../src/features/match-favorites/model/favorites';

test('favorites restore missing storage as empty and deduplicate saved ids', () => {
  assert.deepEqual(parseFavoriteIds(null), []);
  assert.deepEqual(parseFavoriteIds('["m1","m2","m1"]'), ['m1', 'm2']);
});

test('corrupt storage is rejected rather than interpreted as favorites', () => {
  for (const raw of ['broken json', '{}', '[null]', '[42]', '[""]', '["  "]']) {
    assert.throws(() => parseFavoriteIds(raw));
  }
});

test('favorite toggles are immutable and work for the first id', () => {
  const initial = ['m1'];
  assert.deepEqual(toggleFavorite(initial, 'm1'), []);
  assert.deepEqual(toggleFavorite(initial, 'm2'), ['m1', 'm2']);
  assert.deepEqual(initial, ['m1']);
  assert.deepEqual(['m1', 'm2', 'm1'].reduce(toggleFavorite, []), ['m2']);
});
