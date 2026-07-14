export function initI18n() {
  // По прямому запросу пользователя весь UI этого пилота фиксированно остаётся на русском.
}

export function t(_key: string, fallback?: string): string {
  return fallback || '';
}
