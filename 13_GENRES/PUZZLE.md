**Tags:** puzzle

# PUZZLE

Версия: 1.0

---

## Что это

Игрок решает головоломки (slide, sudoku, drop, 2048). Каждый уровень — вызов.

**Примеры:** 2048, Threes, Tetris, Sudoku.

---

## Под-жанры

| Под-жанр | Сложность | Для ИИ |
|---|---|---|
| 2048-like | Простая | Идеально |
| Slide (15-puzzle) | Простая | Идеально |
| Block puzzle (Tetris-like) | Средняя | Хорошо |
| Bubble shooter | Средняя | Хорошо |
| Sudoku | Высокая | Сложно |
| Crossword | Высокая | Сложно |

**Рекомендация:** для первого puzzle — **2048-like** или **slide**.

---

## Core Loop (2048)

```
Свайп в любую сторону
  ↓
Все плитки сдвигаются
  ↓
Соседние одинаковые → сливаются (x2)
  ↓
+1 новая плитка (2 или 4)
  ↓
Проверка game over
  ↓
Score / next target
```

## Ключевые механики (MECHANICS)

✅ Energy
✅ Daily Reward
✅ Quests
✅ Streak

Опционально:
- IAP (жизни)
- Achievements
- Ads (continue)

## Уникальные формулы

### 2048 spawn

```ts
function spawnTile(): void {
  const empty = getEmptyCells();
  if (empty.length === 0) return;
  const cell = empty[Math.floor(Math.random() * empty.length)];
  cell.value = Math.random() < 0.9 ? 2 : 4;
}
```

### Slide + merge (one row)

```ts
function slideRow(row: number[]): number[] {
  // 1. Убрать нули
  let filtered = row.filter(v => v !== 0);
  // 2. Merge
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i+1]) {
      filtered[i] *= 2;
      filtered[i+1] = 0;
    }
  }
  // 3. Убрать нули
  filtered = filtered.filter(v => v !== 0);
  // 4. Дополнить нулями
  while (filtered.length < GRID_SIZE) filtered.push(0);
  return filtered;
}
```

### Magic Numbers

```
GRID_SIZE: 4 (2048)
SPAWN_2_CHANCE: 0.9
SPAWN_4_CHANCE: 0.1
WIN_TILE: 2048
ENERGY_PER_LEVEL: 1
ENERGY_REGEN: 5 min
```

## UI-особенности

- Сетка 4x4 (2048) или 8x8 (судоку)
- Анимация сдвига
- Анимация merge (пульс)
- Score вверху
- Game over экран
- Continue за рекламу

## Антипаттерны

- Слишком долгие уровни (5+ минут)
- Огромные доски (судоку 25x25)
- Нет визуального feedback
- Сложность не плавная
- Нет continue за рекламу

## Когда НЕ делать puzzle

- Нет идей для 30+ уровней
- Не любишь балансить сложность
- Первый проект студии (сложно)

## Связь с другими жанрами

Puzzle + Match-3 = один жанр (похожие).
Puzzle + Story = Wordscapes (хорошо).