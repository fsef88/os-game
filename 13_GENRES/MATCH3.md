**Tags:** match-3

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
