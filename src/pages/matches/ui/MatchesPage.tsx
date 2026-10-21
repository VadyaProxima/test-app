import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { UpdatedAgo } from '../../../components/UpdatedAgo';
import { filterMatches, MatchCard, useMatches, type MatchFilter } from '../../../entities/match';
import { useFavorites } from '../../../features/match-favorites';
import { colors } from '../../../shared/theme/colors';
import { FadeIn } from '../../../shared/ui/FadeIn';

const filters: { value: MatchFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'finished', label: 'Завершённые' },
];

export function MatchesPage() {
  const { data, isLoading, isRefreshing, error, updatedAt, refresh } = useMatches();
  const { favorites, isFavorite, toggle } = useFavorites();
  const [filter, setFilter] = useState<MatchFilter>('all');
  const [query, setQuery] = useState('');
  const compact = useWindowDimensions().width < 600;
  const matches = data?.matches ?? [];
  const visibleMatches = filterMatches(matches, filter, query);
  const liveCount = matches.filter((match) => match.status === 'live').length;

  function resetFilters() {
    setFilter('all');
    setQuery('');
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={visibleMatches}
        keyExtractor={(match) => match.id}
        extraData={favorites}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, compact && styles.compactContent]}
        onRefresh={refresh}
        refreshing={isRefreshing}
        renderItem={({ item }) => (
          <FadeIn key={`${filter}:${item.id}`}>
            <MatchCard match={item} favorite={isFavorite(item.id)} onToggleFavorite={() => toggle(item.id)} />
          </FadeIn>
        )}
        ListHeaderComponent={
          <>
            <View style={styles.navbar}>
              <View style={styles.brand}>
                <View style={styles.brandIcon}><Text style={styles.brandIconText}>м</Text></View>
                <Text style={styles.brandName}>матчдэй<Text style={styles.brandPeriod}>.</Text></Text>
              </View>
              <View style={styles.navPill}><View style={styles.navDot} /><Text style={styles.navText}>ФУТБОЛ</Text></View>
            </View>

            <View style={[styles.hero, compact && styles.compactHero]}>
              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>КАЖДЫЙ МАТЧ. КАЖДАЯ ЭМОЦИЯ.</Text>
                <Text accessibilityRole="header" style={[styles.title, compact && styles.compactTitle]}>Матчи тура</Text>
                <Text style={styles.subtitle}>Большой футбол — в одном месте.</Text>
                <View style={styles.heroBadges}>
                  <View style={styles.roundBadge}><Text style={styles.roundBadgeText}>{data ? `${data.round}-й тур` : 'Текущий тур'}</Text></View>
                  {liveCount > 0 && <View style={styles.liveBadge}><View style={styles.heroLiveDot} /><Text style={styles.liveBadgeText}>В эфире: {liveCount}</Text></View>}
                </View>
              </View>
              {!compact && <View style={styles.pitch} accessibilityElementsHidden>
                <View style={styles.pitchLine} /><View style={styles.pitchCircle} /><View style={styles.pitchGoal} />
                <Text style={styles.pitchNumber}>{data?.round ?? '12'}</Text>
                <Text style={styles.pitchLabel}>ТУР</Text>
              </View>}
            </View>

            <View style={styles.sectionHeading}>
              <View style={styles.headingRow}><Text accessibilityRole="header" style={styles.sectionTitle}>Расписание матчей</Text><Text style={styles.count}>{matches.length}</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Обновить матчи" disabled={isLoading || isRefreshing} onPress={refresh} style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed, (isLoading || isRefreshing) && styles.disabled]}>
                {isRefreshing ? <ActivityIndicator size="small" color={colors.ink} /> : <Text style={styles.refreshIcon}>↻</Text>}
                <Text style={styles.refreshText}>{isRefreshing ? 'Обновляем' : 'Обновить'}</Text>
              </Pressable>
            </View>

            <View style={[styles.toolbar, compact && styles.compactToolbar]}>
              <View style={styles.filters}>
                {filters.map(({ value, label }) => (
                  <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)} style={({ pressed }) => [styles.filter, filter === value && styles.activeFilter, compact && styles.compactFilter, pressed && styles.pressed]}>
                    <Text style={[styles.filterText, filter === value && styles.activeFilterText]}>{label}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={[styles.search, compact && styles.compactSearch]}>
                <View style={styles.searchIcon}><View style={styles.searchHandle} /></View>
                <TextInput value={query} onChangeText={setQuery} placeholder="Найти клуб" placeholderTextColor={colors.muted} accessibilityLabel="Поиск по названию клуба" autoCorrect={false} style={styles.searchInput} />
                {query.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Очистить поиск" onPress={() => setQuery('')} hitSlop={8}><Text style={styles.clear}>×</Text></Pressable>}
              </View>
            </View>

            <View style={styles.metadata}>
              <Text style={styles.timezone}>Время указано в вашем часовом поясе</Text>
              {updatedAt && <UpdatedAgo since={updatedAt} />}
            </View>
            {error && <View accessibilityRole="alert" style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={refresh} disabled={isLoading || isRefreshing} style={styles.retryButton}><Text style={styles.retryText}>Повторить</Text></Pressable>
            </View>}
          </>
        }
        ListEmptyComponent={
          <FadeIn key={filter}>
          <View style={styles.empty}>
            {isLoading ? <><ActivityIndicator size="large" color={colors.green} /><Text style={styles.emptyTitle}>Загружаем матчи</Text><Text style={styles.emptyText}>Готовим расписание тура…</Text></> : error && !data ? <><Text style={styles.emptySymbol}>!</Text><Text style={styles.emptyTitle}>Не удалось загрузить матчи</Text><Text style={styles.emptyText}>Проверьте соединение и попробуйте ещё раз.</Text></> : <><Text style={styles.emptySymbol}>—</Text><Text style={styles.emptyTitle}>{query || filter !== 'all' ? 'Матчи не найдены' : 'В этом туре пока нет матчей'}</Text><Text style={styles.emptyText}>{query || filter !== 'all' ? 'Попробуйте другое название клуба или измените фильтр.' : 'Обновите расписание чуть позже.'}</Text>{(query || filter !== 'all') && <Pressable accessibilityRole="button" onPress={resetFilters} style={styles.resetButton}><Text style={styles.retryText}>Сбросить фильтры</Text></Pressable>}</>}
          </View>
          </FadeIn>
        }
        ListFooterComponent={<View style={styles.footer}><View style={styles.footerLine} /><Text style={styles.footerText}>Футбол, за которым хочется следить.</Text><Text style={styles.footerHint}>Отмечайте любимые матчи звёздочкой</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 1000, alignSelf: 'center', paddingHorizontal: 36, paddingBottom: 30 },
  compactContent: { paddingHorizontal: 16 },
  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 27 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: { backgroundColor: colors.ink, width: 31, height: 31, borderRadius: 9, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  brandIconText: { color: colors.accent, fontWeight: '900', fontSize: 23, marginTop: -4 },
  brandName: { fontSize: 24, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  brandPeriod: { color: colors.green },
  navPill: { flexDirection: 'row', gap: 6, alignItems: 'center', borderColor: colors.border, borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 11, backgroundColor: colors.surface },
  navDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.green },
  navText: { fontSize: 9, letterSpacing: 1.2, fontWeight: '700', color: colors.ink },
  hero: { backgroundColor: colors.ink, borderRadius: 24, padding: 36, overflow: 'hidden', minHeight: 250, flexDirection: 'row', marginBottom: 36 },
  compactHero: { padding: 24, minHeight: 226, marginBottom: 28 },
  heroCopy: { flex: 1, justifyContent: 'center', zIndex: 1 },
  eyebrow: { color: '#B8C5CF', fontSize: 9, fontWeight: '700', letterSpacing: 1.9 },
  title: { color: '#FFFFFF', fontSize: 49, lineHeight: 62, fontWeight: '800', letterSpacing: -2, marginTop: 11 },
  compactTitle: { fontSize: 37, lineHeight: 48, letterSpacing: -1.5 },
  subtitle: { color: '#B6BFCD', fontSize: 13, marginTop: 4 },
  heroBadges: { flexDirection: 'row', gap: 12, marginTop: 25, alignItems: 'center' },
  roundBadge: { backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6 },
  roundBadgeText: { fontSize: 11, fontWeight: '800', color: colors.ink },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  liveBadgeText: { color: '#D9E4D7', fontSize: 11 },
  pitch: { width: 228, position: 'absolute', right: -17, top: 25, bottom: 25, borderWidth: 1, borderColor: '#435548', borderRadius: 5, transform: [{ rotate: '-14deg' }] },
  pitchLine: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: '#435548' },
  pitchCircle: { position: 'absolute', width: 82, height: 82, borderRadius: 42, borderWidth: 1, borderColor: '#435548', top: 59, left: 72 },
  pitchGoal: { position: 'absolute', top: 50, bottom: 50, right: 0, width: 36, borderWidth: 1, borderColor: '#435548' },
  pitchNumber: { color: colors.accent, fontWeight: '900', fontSize: 116, letterSpacing: -8, position: 'absolute', top: 7, left: 25, transform: [{ rotate: '14deg' }] },
  pitchLabel: { color: '#91A384', fontSize: 10, fontWeight: '700', letterSpacing: 5, position: 'absolute', bottom: 15, left: 84, transform: [{ rotate: '14deg' }] },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 21, fontWeight: '700', color: colors.ink, letterSpacing: -0.6 },
  count: { backgroundColor: '#E8EBEF', color: colors.muted, fontSize: 11, fontWeight: '700', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4, overflow: 'hidden' },
  refreshButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 12, borderRadius: 9, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  refreshIcon: { color: colors.ink, fontSize: 21 },
  refreshText: { color: colors.ink, fontSize: 11, fontWeight: '600' },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.5 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 17 },
  compactToolbar: { flexDirection: 'column', alignItems: 'stretch' },
  filters: { flexDirection: 'row', gap: 4, backgroundColor: '#E9ECF0', padding: 4, borderRadius: 11 },
  filter: { paddingHorizontal: 16, minHeight: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  compactFilter: { flex: 1, paddingHorizontal: 6 },
  activeFilter: { backgroundColor: colors.surface },
  filterText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  activeFilterText: { color: colors.ink },
  search: { flexDirection: 'row', alignItems: 'center', width: 210, gap: 10, minHeight: 44, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 14 },
  compactSearch: { width: '100%' },
  searchIcon: { width: 12, height: 12, borderRadius: 7, borderWidth: 1.5, borderColor: colors.muted, marginRight: 2 },
  searchHandle: { position: 'absolute', width: 5, height: 1.5, backgroundColor: colors.muted, right: -4, bottom: -2, transform: [{ rotate: '45deg' }] },
  searchInput: { flex: 1, minWidth: 0, fontSize: 12, color: colors.ink, paddingVertical: 12, paddingRight: 12 },
  clear: { fontSize: 20, color: colors.muted },
  metadata: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 18 },
  timezone: { color: colors.muted, fontSize: 10 },
  errorBanner: { backgroundColor: '#FFF0ED', borderRadius: 12, padding: 16, marginBottom: 16, gap: 10, alignItems: 'flex-start' },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 20 },
  retryButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 7, backgroundColor: colors.surface },
  retryText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 55, paddingHorizontal: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, gap: 12 },
  emptySymbol: { fontSize: 30, color: colors.muted, width: 52, height: 52, textAlign: 'center', lineHeight: 52, backgroundColor: colors.background, borderRadius: 26, overflow: 'hidden' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  emptyText: { fontSize: 13, lineHeight: 21, color: colors.muted, textAlign: 'center' },
  resetButton: { backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginTop: 6 },
  footer: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  footerLine: { width: 32, height: 3, backgroundColor: '#C6CEBF', borderRadius: 2, marginBottom: 8 },
  footerText: { fontSize: 11, fontWeight: '600', color: colors.muted },
  footerHint: { fontSize: 10, color: '#9BA3AE' },
});
