import type { Match, MatchFilter } from './types';

export function filterMatches(matches: Match[], filter: MatchFilter, query = '') {
  const search = query.trim().toLocaleLowerCase('ru-RU').replace(/ё/g, 'е');

  return matches.filter((match) => {
    const matchesStatus = filter === 'all' ||
      (filter === 'upcoming' && ['scheduled', 'postponed'].includes(match.status)) ||
      (filter === 'finished' && match.status === 'finished');
    const clubs = `${match.home.name} ${match.away.name}`
      .toLocaleLowerCase('ru-RU').replace(/ё/g, 'е');
    return matchesStatus && clubs.includes(search);
  });
}

export function formatMatchDate(startsAt: string | null) {
  if (!startsAt || Number.isNaN(Date.parse(startsAt))) return 'Дата уточняется';

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  }).format(new Date(startsAt));
}

export function getMatchStatusLabel(match: Match) {
  switch (match.status) {
    case 'scheduled': return 'Предстоит';
    case 'finished': return 'Завершён';
    case 'postponed': return 'Перенесён';
    case 'live': return match.minute != null ? `В эфире · ${match.minute}′` : 'В эфире';
    default: return 'Статус уточняется';
  }
}
