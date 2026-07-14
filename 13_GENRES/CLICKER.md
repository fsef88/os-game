**Tags:** clicker

# CLICKER

Версия: 1.0

---

## Что это

Игрок тапает по экрану → получает монеты → покупает upgrade'ы → тапает сильнее. Простейший core loop.

**Примеры:** Cookie Clicker, Adventure Capitalist, Egg Inc, Bitcoin Billionaire.

---

## Core Loop

```
Тап по экрану
  ↓
+ монеты (рассчитывается по формуле)
  ↓
Видит, сколько заработал
  ↓
Когда хватает — покупает upgrade
  ↓
Тапает сильнее или быстрее
  ↓
Открывает новый tier upgrade'ов
```

## Meta Loop

```
Тап → монеты → upgrade → сильнее тап
  ↓
Открытие авто-тапа (idle)
  ↓
Открытие prestige (всё быстрее)
  ↓
Цифры в миллионах
  ↓
Prestige → новый цикл
```

## Ключевые механики (MECHANICS)

✅ Upgrades (обязательно)
✅ Achievements
✅ Ads (boost x2)
✅ Prestige (после 1М)

Опционально:
- Offline Progress (если есть idle)
- Chests
- Leaderboard

## Уникальные формулы

### Тап reward

```ts
function calculateTapReward(): number {
  const s = state.get();
  return Math.floor(s.tapBase * s.tapMultiplier * s.boostMultiplier);
}
```

### Upgrade цена

```ts
function getUpgradeCost(upgrade: Upgrade, level: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, level));
}
```

### Примеры upgrade'ов

```ts
const UPGRADES = [
  { id: '"'"'tap_1'"'"', name: '"'"'Сильный тап'"'"', baseCost: 50,   costMult: 1.5, effect: { type: '"'"'tap_mult'"'"', value: 1.5 } },
  { id: '"'"'tap_2'"'"', name: '"'"'Супер тап'"'"',   baseCost: 500,  costMult: 1.5, effect: { type: '"'"'tap_mult'"'"', value: 5 } },
  { id: '"'"'auto_1'"'"', name: '"'"'Авто-тап 1'"'"', baseCost: 200,  costMult: 1.7, effect: { type: '"'"'auto'"'"', value: 1 } },
  { id: '"'"'auto_2'"'"', name: '"'"'Авто-тап 2'"'"', baseCost: 2000, costMult: 1.7, effect: { type: '"'"'auto'"'"', value: 5 } },
];
```

### Magic Numbers

```ts
const TAP_BASE = 1;
const costMult = 1.5; // или 1.15 для медленного
const maxLevel = 10; // для тапов, 20 для income
const offlineMaxHours = 4; // если есть idle
```

## UI-особенности

- Большая кнопка по центру (200x200+)
- Floating text "+N" при тапе
- HUD вверху: монеты, доход/с
- Кнопка upgrade'ов сбоку или снизу
- Progress bar до следующего upgrade

## Антипаттерны

- Слишком медленный старт (1 тап = 1 монета, без прогрессии)
- Слишком быстрый (1М за 1 минуту)
- Тап-спам без feedback (раздражает)
- Огромные числа без форматирования ("1000000" вместо "1M")
- Все upgrade'ы одинаковые (нет стратегии)
- Престиж в первый день (пугает)

## Когда НЕ делать clicker

- Игрок ожидает depth (clicker простой по дизайну)
- Хочется социальный элемент (clicker соло)
- Конкурентный рынок (много похожих)

## Связь с другими жанрами

Clicker + Idle = natural evolution (авто-тап = idle).
Clicker + Merge = необычно, но можно (например, "tap to merge").
Clicker + Tycoon = смешно, но работает (tycoon с быстрым началом).