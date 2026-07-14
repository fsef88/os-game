**Tags:** rebirth

# REBIRTH

Версия: 1.0

---

## Что это

Мягкий prestige. Сброс части прогресса, сохранение достижений. Альтернатива жёсткому prestige.

---

## Отличие от Prestige

| Prestige | Rebirth |
|---|---|
| Жёсткий сброс | Мягкий сброс |
| Большой бонус | Малый бонус |
| Раз в несколько дней | Можно раз в день |
| Меняет геймплей | Добавляет слой |

---

## Формула

```ts
function rebirth(state: State): RebirthResult {
  const earned = state.totalEarned;
  const bonus = Math.floor(Math.log10(earned + 1) * 5) / 100;
  return { bonus, newCurrency: Math.floor(earned / 10000) };
}
```

### Пример

```
1K earned   → +1% bonus, 0 currency
10K earned  → +5% bonus, 1 currency
100K earned → +10% bonus, 10 currency
1M earned   → +15% bonus, 100 currency
```

## Что сбрасывается

Сбрасывается: монеты, уровень (или часть), building count, grid.

НЕ сбрасывается: achievements, premium currency, rebirth currency, cosmetics.

## Что даётся

### Бонус к income

```ts
state.rebirthMultiplier = 1 + state.rebirthBonus;
```

### Новая валюта (Souls / Stars)

```ts
interface RebirthState {
  count: number;
  currency: number;
  multiplier: number;
}
```

### Что можно купить за souls
- Премиум buildings
- Cosmetics
- Boost длительностью
- Skip timers
- Exclusive upgrades

## Когда показывать

```
🌟 Rebirth

Сейчас: 1.5x к доходу
При rebirth: 1.55x к доходу + 5 ⭐

[Rebirth]
```

Доступен:
- Total earned > 10K
- Уровень > 5
- После 1 часа игры

## Преимущества перед Prestige

- Не ломает привычки игрока
- Можно часто (раз в день)
- Меньше стресса при решении
- Больше подходит для casual

## Чек-лист

- [ ] Формула бонуса (log-based)
- [ ] Мягкий сброс
- [ ] Souls / Stars валюта
- [ ] Магазин за souls
- [ ] Сохранение multiplier
- [ ] UI с предпросмотром


# CHESTS / LOOT BOXES

Версия: 1.0

---

## Что это

Случайная награда. Элемент неожиданности.

---

## Типы

```ts
{ id: 'common',    name: 'Обычный сундук',     cost: 100,   rarity: 'common' }
{ id: 'rare',      name: 'Редкий сундук',       cost: 500,   rarity: 'rare' }
{ id: 'epic',      name: 'Эпический сундук',    cost: 2500,  rarity: 'epic' }
{ id: 'legendary', name: 'Легендарный сундук',  cost: 10000, rarity: 'legendary' }
```

## Loot Tables

```ts
const LOOT_TABLES = {
  common: [
    { item: 'coins',     amount: 100,    weight: 50 },
    { item: 'coins',     amount: 200,    weight: 30 },
    { item: 'coins',     amount: 500,    weight: 15 },
    { item: 'boost_2x',  amount: 5,      weight: 4 },
    { item: 'crystal',   amount: 1,      weight: 1 },
  ],
  rare: [
    { item: 'coins',     amount: 1000,   weight: 40 },
    { item: 'boost_2x',  amount: 15,     weight: 15 },
    { item: 'crystal',   amount: 5,      weight: 10 },
    { item: 'rare_item', amount: 1,      weight: 5 },
  ],
};
```

## Выпадение

### Weighted random

```ts
function rollLoot(table: string): LootResult {
  const entries = LOOT_TABLES[table];
  const totalWeight = entries.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of entries) {
    if (roll < entry.weight) return entry;
    roll -= entry.weight;
  }
  return entries[entries.length - 1];
}
```

### Pity system

```ts
let commonChestsSinceEpic = 0;
const PITY_THRESHOLD = 10;

function rollLootWithPity(player: State, table: string): LootResult {
  commonChestsSinceEpic++;
  if (commonChestsSinceEpic >= PITY_THRESHOLD && table === 'common') {
    commonChestsSinceEpic = 0;
    return { item: 'crystal', amount: 1 };
  }
  return rollLoot(table);
}
```

## Disclosure (для модерации)

Если есть IAP, **обязательно** показывать шансы:

```
Обычный сундук
💰 100 монет      50%
💰 200 монет      30%
💰 500 монет      15%
⚡ boost 2x       4%
💎 1 кристалл     1%
```

## Чек-лист

- [ ] Loot tables определены
- [ ] Weighted random
- [ ] Pity system
- [ ] Анимация открытия
- [ ] Disclosure для IAP
