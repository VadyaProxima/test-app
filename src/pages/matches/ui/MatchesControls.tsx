import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../../../shared/config';
import { UpdatedAgo } from '../../../shared/ui';
import type { MatchesTab } from '../model/useMatchesPage';

const filters: { value: MatchesTab; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'finished', label: 'Завершённые' },
  { value: 'favorites', label: 'Избранное' },
];

type Props = {
  total: number;
  favoritesCount: number;
  filter: MatchesTab;
  query: string;
  setFilter: (filter: MatchesTab) => void;
  setQuery: (query: string) => void;
  busy: boolean;
  isRefreshing: boolean;
  refresh: () => void;
  updatedAt: Date | null;
  compact: boolean;
  compactToolbar: boolean;
};

export function MatchesControls({
  total,
  favoritesCount,
  filter,
  query,
  setFilter,
  setQuery,
  busy,
  isRefreshing,
  refresh,
  updatedAt,
  compact,
  compactToolbar,
}: Props) {
  const [searchFocused, setSearchFocused] = useState(false);
  return (
    <>
      <View style={styles.sectionHeading}>
        <View style={styles.headingRow}>
          <Text
            accessibilityRole="header"
            style={[styles.sectionTitle, compact && styles.compactTitle]}
          >
            Расписание матчей
          </Text>
          <Text style={styles.count}>{total}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Обновить матчи"
          disabled={busy}
          onPress={refresh}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.pressed,
            busy && styles.disabled,
          ]}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={styles.refreshIcon}>↻</Text>
          )}
          <Text style={[styles.refreshText, compact && styles.hidden]}>
            {isRefreshing ? 'Обновляем' : 'Обновить'}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.toolbar, compactToolbar && styles.compactToolbar]}>
        <View style={styles.filters}>
          {filters.map(({ value, label }) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === value }}
              onPress={() => setFilter(value)}
              style={({ pressed }) => [
                styles.filter,
                filter === value && styles.activeFilter,
                compact && styles.compactFilter,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  compact && styles.compactFilterText,
                  filter === value && styles.activeFilterText,
                ]}
              >
                {label}
                {value === 'favorites' ? ` · ${favoritesCount}` : ''}
              </Text>
            </Pressable>
          ))}
        </View>
        <View
          style={[
            styles.search,
            compactToolbar && styles.compactSearch,
            searchFocused && styles.searchFocused,
          ]}
        >
          <View style={styles.searchIcon}>
            <View style={styles.searchHandle} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Найти клуб"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Поиск по названию клуба"
            autoCorrect={false}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Очистить поиск"
              onPress={() => setQuery('')}
              hitSlop={8}
            >
              <Text style={styles.clear}>×</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.metadata}>
        <Text style={styles.timezone}>Время указано в вашем часовом поясе</Text>
        {updatedAt && <UpdatedAgo since={updatedAt} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.6,
  },
  compactTitle: { fontSize: 18 },
  hidden: { display: 'none' },
  count: {
    backgroundColor: colors.raised,
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshIcon: { color: colors.text, fontSize: 21 },
  refreshText: { color: colors.text, fontSize: 11, fontWeight: '600' },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.5 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  compactToolbar: { flexDirection: 'column', alignItems: 'stretch' },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    backgroundColor: colors.surface,
    padding: 4,
    borderRadius: 11,
  },
  filter: {
    paddingHorizontal: 16,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  compactFilter: { flexGrow: 1, paddingHorizontal: 4 },
  activeFilter: { backgroundColor: colors.accent },
  filterText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  compactFilterText: { fontSize: 10 },
  activeFilterText: { color: colors.accentInk },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 210,
    gap: 10,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  compactSearch: { width: '100%' },
  searchFocused: { borderColor: colors.green },
  searchIcon: {
    width: 12,
    height: 12,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.muted,
    marginRight: 2,
  },
  searchHandle: {
    position: 'absolute',
    width: 5,
    height: 1.5,
    backgroundColor: colors.muted,
    right: -4,
    bottom: -2,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 12,
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
  clear: { fontSize: 20, color: colors.muted },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timezone: { color: colors.muted, fontSize: 10 },
});
