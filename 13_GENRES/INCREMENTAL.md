**Tags:** incremental

# INCREMENTAL

Версия: 1.0

---

## Что это

Idle глубже обычного. Огромные числа, prestige, rebirth, бесконечная прогрессия. Для хардкорщиков.

**Примеры:** Antimatter Dimensions, Synergism, Kittens Game, Universal Paperclips.

---

## Core Loop

```
Производит ресурсы
  ↓
Покупает генераторы
  ↓
Открывает новые механики
  ↓
Prestige (сброс за бонус)
  ↓
Цикл повторяется быстрее
  ↓
Rebirth (новые системы)
  ↓
Endgame (бесконечный)
```

## Ключевые механики (MECHANICS)

✅ Offline Progress
✅ Prestige
✅ Rebirth
✅ Upgrades
✅ Achievements

Опционально:
- Battle Pass
- Skills
- Chests

## Уникальные формулы

### Прогрессия чисел (Number walls)

```ts
function getCost(base: number, growth: number, owned: number, mult = 1): number {
  return Math.floor(base * Math.pow(growth, owned) * mult);
}
```

### Prestige bonus (log)

```ts
function getPrestigeBonus(state: State): number {
  return Math.log10(state.totalEarned) * 0.1; // 10% за 10x earned
}
```

### Multiple prestige layers

```ts
// Layer 1: 1.0 → 1.5
// Layer 2: 1.5 → 2.0 (после Layer 1 +10 levels)
// Layer 3: 2.0 → 3.0 (после Layer 2 +20 levels)
```

## UI-особенности

- Компактный HUD с большими числами
- Дерево unlock'ов
- Settings (формат чисел: K/M/B/T/Q)
- Auto-buy
- Auto-prestige
- Несколько ресурсов (3-5)

## Антипаттерны

- Слишком быстро (1М за минуту) — нет интереса
- Слишком медленно (1М за час) — скучно
- Слишком много ресурсов (>5) — путается
- Endgame недостижим (1 год AFK)
- Не объясняется "что делать" (assumed знание)

## Когда НЕ делать incremental

- Для casual аудитории (слишком сложно)
- Если времени мало (incremental = long-term)
- Если не любишь абстрактные цифры

## Связь с другими жанрами

Incremental = deep Idle.
Incremental + Tycoon = например, Kittens Game (много ресурсов).
Incremental + Survivor = нет пересечений.