**Tags:** tycoon

# TYCOON

Версия: 1.0

---

## Что это

Игрок строит империю (бизнес / город / парк). Управление + стратегия + размещение.

**Примеры:** Tiny Tower, Airport Inc, Build a Lot, Roller Coaster Tycoon.

---

## Core Loop

```
Размещает здание
  ↓
Здание привлекает посетителей / производит
  ↓
Доход от посетителей
  ↓
Содержание (cost)
  ↓
Upgrade зданий
  ↓
Новые здания / расширение
```

## Meta Loop

```
Здание tier 1
  ↓
Здание tier 2 (нужно посетителей)
  ↓
Здание tier 3
  ↓
Новая зона / новый тип зданий
  ↓
Престиж / следующая эпоха
```

## Ключевые механики (MECHANICS)

✅ Upgrades
✅ Shop
✅ Quests
✅ Achievements
✅ Offline Progress

Опционально:
- Prestige (для long-term)
- Chests
- Daily Reward

## Уникальные формулы

### Типы зданий (парк)

```ts
const BUILDING_TYPES = [
  { id: '"'"'ride'"'"',  name: '"'"'Аттракцион'"'"',  baseCost: 500,   visitors: 5,   revenue: 0,   tier: 1 },
  { id: '"'"'food'"'"',  name: '"'"'Еда'"'"',         baseCost: 300,   visitors: 0,   revenue: 0,   timeBoost: 1.2, tier: 1 },
  { id: '"'"'gift'"'"',  name: '"'"'Сувениры'"'"',    baseCost: 1000,  visitors: 0,   revenue: 50,  tier: 1 },
  { id: '"'"'decor'"'"', name: '"'"'Декор'"'"',       baseCost: 200,   visitors: 2,   revenue: 0,   tier: 1 },
];
```

### Посетители

```ts
function getVisitors(): number {
  return Object.values(state.get().buildings).reduce((sum, b) => {
    const type = BUILDING_TYPES.find(t => t.id === b.type);
    return sum + (type?.visitors || 0) * b.level;
  }, 0);
}
```

### Доход

```ts
function getRevenue(): number {
  return getVisitors() * 0.5; // 0.5 монет/посетитель
}
```

### Magic Numbers

```ts
baseCellCost: 100
cellCostGrowth: 2.0 (быстрее чем merge, больше клеток)
visitorPerAttraction: 5
revenuePerVisitor: 0.5
offlinePercent: 0.5
offlineMaxHours: 4
```

## UI-особенности

- Сетка 5x5 или 6x6 (часто расширяемая)
- Размещение по тапу на клетку
- Типы зданий в панели внизу
- Upgrade зданий (level 2, 3, ...)
- Расширение сетки за кристаллы

## Tier B (тематические вариации)

Tycoon — это **фреймворк** для разных тематик:
- Restaurant, Cafe, Hotel, Airport
- Fishing, Zoo, Aquarium, Museum
- Farming, Cooking, Train, Factory

Каждый = набор building types с разными именами и эффектами.

## Антипаттерны

- Слишком много пустого пространства
- Здания не влияют друг на друга (выбор не важен)
- Дорогое расширение сетки (застревает)
- Нет визуального feedback
- Один тип зданий на всю игру (скучно)

## Когда НЕ делать tycoon

- Нет идей для 3-4 типов зданий с синергией
- Не любишь размещение вручную
- Хочется быстрый core loop (tycoon медленнее)

## Связь с другими жанрами

Tycoon + Idle = один жанр (синергия).
Tycoon + Match-3 = мини-игры в меню.
Tycoon + Merge = странно (размещение vs слияние).


# MATCH-3

Версия: 1.0

---

## Что это

Игрок меняет местами 2 соседних элемента, чтобы собрать 3+ в ряд. Match исчезает, новые падают сверху.

**Примеры:** Candy Crush, Toon Blast, Homescapes, Royal Match.

---

## Core Loop

```
Тап на элемент 1
  ↓
Тап на соседний элемент 2
  ↓
Swap (если валидно)
  ↓
3+ в ряд → match
  ↓
Элементы исчезают, score
  ↓
Новые падают сверху
  ↓
Цепочки → combo bonus
```

## Meta Loop

```
Уровень 1
  ↓
10-20 уровней (прогрессия сложности)
  ↓
Больше типов элементов
  ↓
Спец-элементы (бомбы, линии)
  ↓
Сюжет (для some)
  ↓
Новые зоны
```

## Ключевые механики (MECHANICS)

✅ Energy (обязательно)
✅ Daily Reward
✅ Quests
✅ Streak

Опционально:
- IAP (наборы жизней)
- Boosters
- Leaderboard

## Уникальные формулы

### Сетка

```ts
const GRID_SIZE = 8; // 8x8
const TILE_TYPES = 6; // 6 цветов
```

### Score

```ts
function calculateScore(matches: Match[]): number {
  return matches.reduce((sum, m) => sum + m.length * 10, 0);
}
```

### Combo

```ts
function calculateComboBonus(chainCount: number): number {
  return chainCount * 1.5; // +50% за каждую цепочку
}
```

### Goal

```ts
interface LevelGoal {
  type: '"'"'score'"'"' | '"'"'collect'"'"' | '"'"'clear'"'"';
  target: number;
  itemId?: string;
  moves: number; // лимит ходов
}
```

## UI-особенности

- Сетка 8x8 или 9x9
- Анимация падения элементов
- Highlight при hover/tap (что можно swap)
- Goal вверху
- Moves counter
- Boosters (1-2 на уровень)

## Антипаттерны

- Слишком долгие уровни (5+ минут)
- Paywall на жизнях (каждые 2 уровня)
- Слишком однообразные элементы
- Нет визуального feedback при match
- Random без seed (нельзя пройти)

## Когда НЕ делать match-3

- Нет идей для 20+ уникальных уровней
- Не любишь level-based дизайн
- Нет времени балансить сложность

## Связь с другими жанрами

Match-3 + Merge = "3-merge" (редко, но бывает).
Match-3 + Story = Royal Match (хорошо работает).