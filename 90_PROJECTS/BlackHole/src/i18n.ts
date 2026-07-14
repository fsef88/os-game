export function initI18n() {
  // Внутри прототипа Black Hole весь игровой UI фиксированно остаётся на русском.
}

export function t(_key: string, fallback?: string): string {
  return fallback || '';
}
