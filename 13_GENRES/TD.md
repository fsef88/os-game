**Tags:** tower-defense

# TOWER DEFENSE

Версия: 1.0

---

## Что это

Игрок строит башни на пути, чтобы остановить волны врагов. Стратегия + tower placement.

**Примеры:** Bloons TD, Kingdom Rush, Plants vs Zombies.

---

## Core Loop

```
Выбирает башню
  ↓
Размещает на карте
  ↓
Стартует волна
  ↓
Враги идут по пути
  ↓
Башни стреляют автоматически
  ↓
Враг умер → монеты
  ↓
Upgrade башни или новые
  ↓
Финальная волна → победа
```

## Meta Loop

```
Уровень 1 (лёгкий)
  ↓
Уровень 2 (больше волн)
  ↓
Уровень N (новые типы башен)
  ↓
Hard mode
  ↓
Endless mode
```

## Ключевые механики (MECHANICS)

✅ Upgrades (башни)
✅ Skills (special abilities)
✅ Quests
✅ Energy / Lives
✅ Achievements

Опционально:
- IAP
- Leaderboard
- Battle Pass

## Уникальные формулы

### Башня

```ts
interface Tower {
  id: string;
  name: string;
  baseCost: number;
  damage: number;
  range: number;
  fireRate: number; // ms между выстрелами
  special?: '"'"'slow'"'"' | '"'"'splash'"'"' | '"'"'poison'"'"';
  upgrades: TowerUpgrade[];
}
```

### Враг

```ts
interface Enemy {
  hp: number;
  speed: number;     // клеток/сек
  reward: number;
  armor?: number;    // снижает damage
  flying?: boolean;   // только flying towers
}
```

### Wave

```ts
interface Wave {
  enemies: Array<{ type: string; count: number; delay: number }>;
  bonus?: number; // за completion
}
```

## UI-особенности

- Карта с путём
- Слоты для башен (или свободная расстановка)
- Панель башен внизу
- HP врагов над головой
- Wave progress
- Money counter

## Антипаттерны

- Слишком много типов башен (>5) (сложно)
- Длинные волны (5+ минут)
- Нет визуального feedback
- Сложность резко растёт
- Pay-to-skip waves

## Когда НЕ делать TD

- Не любишь стратегию
- Нет времени на баланс волн
- Нет идей для 20+ уровней

## Связь с другими жанрами

TD + Survivor = overlap (auto-attack + enemies).
TD + Idle = длинные сессии с прогрессией.