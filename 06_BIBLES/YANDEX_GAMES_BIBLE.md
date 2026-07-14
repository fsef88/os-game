**Tags:** bible, yandex

# YANDEX GAMES BIBLE
**Status:** Stable
**Owner:** Studio
**Version:** 1.4
**Last Reviewed:** 2026-07-14

---



Версия: 1.0  
Дата: 2026-07-14  
Источник: реальный опыт Merge Farm, документация Yandex Games SDK v2

---

## 1. SDK

### Подключение

```html
<script src="https://yandex.ru/games/sdk/v2"></script>
```

Один тег в `<head>`. Никаких npm-пакетов. Никаких polyfill.

### Инициализация

```js
const sdk = await YaGames.init();
const player = sdk.getPlayer({ scopes: false });
const adv = sdk.getAdv();
const lang = sdk.environment.i18n.lang;  // 'ru', 'en', ...
```

### Адаптер-обёртка (ОБЯЗАТЕЛЬНО)

SDK на локальной разработке и в preview-режиме не работает. Без адаптера игра падает с ошибкой.

```js
// YandexSDK
class YandexSDK {
  async saveData(data) { try { await player.setData(data, true); return true; } catch (e) { return false; } }
  async getData()       { try { return await player.getData() || {}; } catch (e) { return {}; } }
  async showRewarded(onReward, onClose, onError) {
    adv.showRewardedVideo({
      callbacks: {
        onOpen:     () => {},
        onRewarded: () => onReward && onReward(),
        onClose:    () => onClose && onClose(),
        onError:    (e) => onError && onError(e),
      }
    });
  }
  async showInterstitial(onClose, onError) {
    adv.showFullscreenAdv({
      callbacks: {
        onClose: (wasShown) => onClose && onClose(wasShown),
        onError: (e) => onError && onError(e),
      }
    });
  }
  setLeaderboardScore(name, score) { /* sdk.getLeaderboards().then(...) */ }
  getLanguage() { return sdk.environment.i18n.lang; }
  notifyGameReady() { sdk.features.LoadingAPI?.ready(); }
}

// MockSDK — для локальной разработки
class MockSDK {
  isMock() { return true; }
  async saveData(d) { localStorage.setItem('save', JSON.stringify(d)); return true; }
  async getData()    { return JSON.parse(localStorage.getItem('save') || '{}'); }
  async showRewarded(onR) { console.log('[Mock] Rewarded'); onR && onR(); }
  async showInterstitial(onC) { console.log('[Mock] Interstitial'); onC && onC(true); }
  setLeaderboardScore(name, score) {
    // мок: пишет в localStorage, добавляет 3 фейковых игрока
  }
  getLanguage() { return 'ru'; }
  notifyGameReady() {}
}

// Обёртка выбора
class SDK {
  constructor() { this.activeSDK = window.YaGames ? new YandexSDK() : new MockSDK(); }
  // проксируем все методы
}
```

**Правило:** Игра НИКОГДА не должна падать, если SDK не загрузился.

---

## 2. РЕКЛАМА

### Rewarded (вознаграждаемая)

Когда показывать:
- Ускорение (x2 income на 30 мин)
- Пропуск таймера
- Открытие премиум-контента
- Удвоение оффлайн-дохода
- Бесплатный буст

Когда НЕ показывать:
- В первые 60 секунд игры
- Во время обучения
- В первом merge
- Подряд больше 2 раз за сессию

Паттерн вызова (из Merge Farm):
```js
showRewarded(() => {
  // дать награду
  activateBoost(30);  // минуты
  playReward();
  showFloatingText('Доход удвоен на 30 мин! ⚡');
}, () => {
  // закрыли без награды
  playError();
}, () => {
  // ошибка показа
});
```

### Interstitial (полноэкранная)

Когда показывать:
- Между сессиями
- После "Game Over"-подобного события (НЕЛЬЗЯ после проигрыша в казуалке)
- После возврата из offline
- При выходе из меню (НЕ при входе)

Когда НЕ показывать:
- В первые 30 секунд
- Во время merge-цепочки
- При активном таймере
- Подряд чаще 1 раза в 60 секунд
- Без cooldwon между показами

### Cooldown

```js
const AD_COOLDOWN = 60; // секунд между interstitial
let lastAdTime = 0;
function canShowAd() { return Date.now() - lastAdTime > AD_COOLDOWN * 1000; }
```

---

## 3. СОХРАНЕНИЯ

### Двойная стратегия

```js
async save(state) {
  // 1. Всегда локально
  localStorage.setItem('merge_farm_save', JSON.stringify(state));
  // 2. В облако Yandex (только критичное)
  await this.sdk.saveData(this.cloudStateFrom(state));
}

async load() {
  // 1. Пробуем облако
  const cloud = await this.sdk.getData();
  // 2. Если облако пустое — берём локальный сейв
  const local = JSON.parse(localStorage.getItem('merge_farm_save') || 'null');
  // 3. Мерджим: приоритет у более нового timestamp
  return mergeByTimestamp(cloud, local);
}
```

### Что хранить локально (всё)

Полный state игры: slots, levels, money, achievements, inventory, stats.

### Что хранить в облаке (только важное)

- Прогресс коллекции
- Деньги
- Открытые уровни
- Уровень игрока
- DailyStreak

НЕ хранить в облаке:
- session_state (текущая сессия)
- UI state
- analytics

### Оффлайн-доход

Из Merge Farm:
```
offlineEarningPercentage: 0.5   // 50% от того, что заработал бы
maxOfflineTimeSeconds:    14400 // 4 часа
minOfflineTimeSeconds:    300   // меньше 5 минут — не считаем
offlineEarnCapVsEarned:   3     // cap = 3x от текущего дохода за онлайн
```

При входе:
- прошло X секунд (X > 300)
- offline = currentIncomePerSec * X * 0.5
- cap = maxEarningRate * 3
- offline = min(offline, cap)
- показать модалку с offline-наградой

---

## 4. ОГРАНИЧЕНИЯ

### Размер билда
- HTML/JS/CSS: **до 5 МБ** (жёсткий лимит Yandex)
- После архивации ZIP: до 8 МБ
- Запрещено: огромные шрифты, base64-картинки, видео > 1 МБ

### Производительность
- FPS ≥ 30 на мобильном (iPhone 8 / Samsung A10 — baseline)
- Стартовый экран < 3 сек
- Любая анимация ≤ 1 сек
- DOM-элементов на сцене ≤ 200

### Сеть
- Save/Load: до 1 МБ
- Все ассеты встроены в билд (никаких CDN кроме SDK)
- Шрифты: только system-ui или предзагруженные WOFF2

### Браузеры
- Chrome 80+
- Safari 14+
- Yandex Browser
- Встроенный браузер VK, OK, Mail.ru

---

## 5. МОДЕРАЦИЯ

### Что запрещено

- Контент 18+
- Азартные игры (даже похожие механики — казино-стиль)
- Насилие (даже мультяшное)
- Покупка за реальные деньги внутри игры без оформления IAP
- Нецензурная лексика, даже в достижениях
- Использование брендов и торговых марок
- Темы наркотиков, алкоголя, политики, религии
- Запрещённые страны в сюжете
- Звук без возможности отключения
- Сбор персональных данных сверх разрешённого

### Что разрешено

- Казуальные механики (merge, clicker, idle)
- Виртуальные валюты без IAP
- Вознаграждаемая реклама (Rewarded)
- Interstitial между сессиями
- Лидерборды
- Достижения

### Требования к иконке

- 512x512 PNG
- Без прозрачности
- Скруглённые углы НЕ делать (платформа добавляет)
- Понятный силуэт на маленьком размере
- Без текста (или минимум)

### Скриншоты

- 4-8 штук
- Разрешение 1920x1080 или мобильное
- Должны показывать реальный геймплей
- Без UI-элементов редактирования
- Разнообразие сцен

### Описание

- Краткое (1-2 предложения)
- Полное (200-500 символов)
- Ключевые слова (для поиска)
- Возрастной рейтинг (обычно 6+ или 12+)

---

## 6. МОБИЛЬНЫЕ УСТРОЙСТВА

### Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

### Особенности

- `user-scalable=no` — зум запрещён
- `viewport-fit=cover` — для notch/island
- `touch-action: manipulation` — нет двойного тапа
- `user-select: none` — текст не выделяется

### Safe Area

```css
padding-top: env(safe-area-inset-top, 0);
padding-bottom: env(safe-area-inset-bottom, 0);
```

### Жесты

- Не блокировать свайп
- Главная кнопка — большой tap-target (минимум 44x44 px)
- Жест "назад" — работает в UI

### Ориентация

- Лучше поддерживать обе ориентации
- Если только одна — обычно portrait для merge/clicker, landscape для tycoon
- Блокировку ориентации делать аккуратно

---

## 7. ПУБЛИКАЦИЯ

### Этапы

1. Собрать ZIP (index.html в корне, всё в одном файле или рядом)
2. Создать черновик на https://yandex.com/dev/games
3. Заполнить карточку
4. Загрузить билд
5. Отправить на модерацию (1-7 дней)
6. Исправить замечания (если есть)
7. Опубликовать

### Чек-лист перед загрузкой

- [ ] index.html в корне ZIP
- [ ] Все ассеты включены
- [ ] SDK тег есть
- [ ] Игра запускается без сети
- [ ] Save/Load работают
- [ ] Rewarded и Interstitial вызываются
- [ ] FPS ≥ 30
- [ ] Нет ошибок в console
- [ ] Иконка 512x512
- [ ] 4+ скриншота
- [ ] Описание заполнено
- [ ] Версия и changelog готовы

### После модерации

- [ ] Проверить первый запуск у реальных игроков
- [ ] Посмотреть первые 24 часа метрик
- [ ] Сделать hotfix если нужно
- [ ] Написать postmortem
- [ ] Запланировать v1.1

---

## 8. ЧАСТЫЕ ОШИБКИ

❌ Нет Mock SDK — игра падает на локальной разработке  
❌ Сохранение только в облако — игрок теряет прогресс  
❌ Interstitial в первые 30 секунд — модерация завернёт  
❌ Нет cooldown между рекламами — игроки жалуются  
❌ Звук без возможности отключить — модерация завернёт  
❌ IAP без публикации в Yandex — модерация завернёт  
❌ Огромный билд > 5 МБ — игра не загрузится  
❌ Нет viewport meta — игра не масштабируется  
❌ Нет safe area — перекрывается notch  
❌ Нет fallback для медленных устройств — лаги

---

## 9. МИНИМАЛЬНЫЙ ЧЕК-ЛИСТ ПЕРЕД ЗАГРУЗКОЙ

```text
[ ] index.html в корне ZIP
[ ] SDK подключён
[ ] Mock SDK для локальной разработки
[ ] Save локальный + облако
[ ] Offline считается (cap, %)
[ ] Rewarded с наградой
[ ] Interstitial с cooldown
[ ] Viewport + safe area
[ ] FPS проверен на мобильном
[ ] Нет ошибок в console
[ ] Иконка 512x512
[ ] Скриншоты 4+
[ ] Описание заполнено
[ ] CHANGELOG.md обновлён
[ ] VERSION.md обновлён
```

## See also

- `15_SYSTEMS/README.md`
- `14_MECHANICS/ADS.md`
- `14_MECHANICS/DAILY_REWARD.md`
