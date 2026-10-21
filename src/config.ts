// По умолчанию — data/matches.json из публичного репозитория проекта.
// Для другого сервера задайте EXPO_PUBLIC_MATCHES_URL в .env.local.
export const MATCHES_URL =
  process.env.EXPO_PUBLIC_MATCHES_URL ??
  'https://raw.githubusercontent.com/VadyaProxima/test-app/main/data/matches.json';
