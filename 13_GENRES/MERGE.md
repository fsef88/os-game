**Tags:** merge

# MERGE

Версия: 1.0
Дата: 2026-07-14

---

## Что это

Игрок объединяет два одинаковых объекта в один более редкий. Главный цикл — discovery нового tier.

**Примеры:** Merge Mansion, Merge Dragons, Чудо-Ферма (Merge Farm), Suika Game.

---

## Core Loop

```
Два объекта одного tier
  ↓
Игрок перетаскивает один на другой
  ↓
Анимация слияния + звук
  ↓
Появление нового объекта (tier + 1)
  ↓
Монеты + очки коллекции
  ↓
Открытие нового tier
  ↓
Поиск следующей пары
```

## Meta Loop

```
Tier 0: Семечко
  ↓
Tier 1-3: простые овощи
  ↓
Tier 4-6: средние
  ↓
Tier 7-10: редкие
  ↓
Tier 11+: легендарные
  ↓
Коллекция закрыта → prestige / новый сюжет
```

## Ключевые механики (MECHANICS)

✅ Offline Progress (обязательно)
✅ Quests
✅ Achievements
✅ Daily Reward
✅ Chests
✅ Streak

Опционально:
- Prestige (после 7+ дней)
- Leaderboard (по коллекции)

## Уникальные формулы

### Сетка

```ts
const GRID_SIZE = 4; // 4x4 = 16 клеток
const STARTING_UNLOCKED = 4;
```

### Стоимость слотов

Из Merge Farm:
```ts
const slotUnlockCosts = [0, 0, 0, 0, 500, 800, 1500, 2500, 5000, 8000, 25000];
// 1.5x рост
```

### Tier'ы

```ts
const VEGETABLES = [
  { id: 0,  name: '"'"'Семечко'"'"',  cost: 0,    reward: 1 },
  { id: 1,  name: '"'"'Росток'"'"',   cost: 2,    reward: 3 },
  { id: 2,  name: '"'"'Редис'"'"',    cost: 5,    reward: 10 },
  { id: 3,  name: '"'"'Морковь'"'"',  cost: 15,   reward: 30 },
  { id: 4,  name: '"'"'Томат'"'"',    cost: 40,   reward: 80 },
  { id: 5,  name: '"'"'Картофель'"'"', cost: 100,  reward: 200 },
  { id: 6,  name: '"'"'Огурец'"'"',   cost: 250,  reward: 500 },
  { id: 7,  name: '"'"'Баклажан'"'"', cost: 600,  reward: 1200 },
  { id: 8,  name: '"'"'Перец'"'"',    cost: 1500, reward: 3000 },
  { id: 9,  name: '"'"'Кабачок'"'"',  cost: 3500, reward: 7000 },
  { id: 10, name: '"'"'Тыква'"'"',    cost: 8000, reward: 16000 },
];
// 11+ tier'"'"'ов = 4-5 дней до максимума
```

### Редкость

```ts
const goldenChance = 0.02;   // 2%
const rainbowChance = 0.005; // 0.5%
```

## Оффлайн-формула

Из Merge Farm:
```
offlinePercent: 0.5
maxOfflineTimeSeconds: 14400 (4 часа)
offlineEarnCapVsEarned: 3
```

## UI-особенности

- Сетка 4x4 (16 клеток) — оптимально для мобильного
- Drag-and-drop для слияния
- Tap — выбор, tap на другой — переместить
- Visual feedback при merge (анимация, частицы, звук)
- Locked slots видны, но с замком и ценой
- Hint (подсветка) при простое > 10 сек — куда merge''"'"'ить

## Антипаттерны

- Сетка 5x5 и больше (сложно для мобильного)
- Слишком много tier''"'"'ов (30+) — игрок устаёт
- Tier 0 (семечко) занимает всю сетку (застревает)
- Нет визуальной разницы между tier'"'"'ами (скучные)
- Merge без анимации (пресно)
- Длинный онбординг (5+ шагов)

## Magic Numbers

```
gridSize: 4
startingUnlocked: 4
slotCostGrowth: 1.5
tierCount: 11
goldenChance: 0.02
rainbowChance: 0.005
offlinePercent: 0.5
offlineMaxHours: 4
```

## Когда НЕ делать merge

- Игрок не любит drag-and-drop
- Хочется короткие сессии (merge требует время)
- Если уже есть похожая игра в сторе (конкуренция)

## Референсы

- Merge Farm (своя игра)
- Merge Mansion
- Merge Dragons
- Suika Game (drop-merge)
- Triple Match (3-way merge)

## Связь с другими жанрами

Merge + Idle = Merge Idle (больше прогрессии за счёт idle).
Merge + Match-3 = не работает (разные механики).
Merge + Tycoon = странно (обычно merge самодостаточен).
