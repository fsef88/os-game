import { sdk } from './sdk';
import ru from './i18n/ru.json';
import en from './i18n/en.json';

type Translations = Record<string, string>;
type SupportedLang = 'ru' | 'en';

const dict: Record<SupportedLang, Translations> = { ru, en };
let currentLang: SupportedLang = 'ru';

export function initI18n() {
  const sdkLang = sdk.getLanguage();
  const browserLang = navigator.language.toLowerCase();
  const lang = sdkLang || browserLang;
  currentLang = lang.startsWith('en') ? 'en' : 'ru';
}

export function t(key: string, fallback?: string): string {
  return dict[currentLang][key] || fallback || key;
}
