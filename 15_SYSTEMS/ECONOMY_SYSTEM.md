**Tags:** economy, systems

# ECONOMY SYSTEM

Версия: 1.0

---

## Связь с BIBLE

Для понимания принципов → 06_BIBLES/ECONOMY_BIBLE.md

---


## Назначение

Управление валютами, ценами, балансом, инфляцией.

Используется: 100% игр.

---

## Архитектура

```ts
class EconomySystem {
  private balances: Map<string, number>;
  private prices: Map<string, PriceConfig>;
  private income: Map<string, IncomeConfig>;

  // CRUD
  get(currency: string): number;
  add(currency: string, amount: number, source?: string): void;
  spend(currency: string, amount: number): boolean;

  // Pricing
  getPrice(itemId: string): number;
  getNextPrice(itemId: string, owned: number): number;

  // Income
  getIncomePerSec(): number;
  getIncomePerTap(): number;

  // Inflation control
  getSinkOptions(): SinkOption[];
  getInflationIndex(): number; // 0-1, где 1 = критично
}
```

## Валюты

### Soft (основная)

```ts
{
  id: 'coins',
  name: 'Монеты',
  sources: ['merge', 'sell', 'quest_reward', 'offline'],
  sinks: ['buy_slot', 'buy_upgrade', 'boost', 'prestige'],
  startBalance: 100,
  maxBalance: Infinity, // или cap
}
```

### Hard (премиум)

```ts
{
  id: 'crystals',
  name: 'Кристаллы',
  sources: ['rewarded_ad', 'achievement', 'iap'],
  sinks: ['skip_timer', 'premium_boost', 'cosmetic'],
  startBalance: 0,
  maxBalance: 9999,
}
```

## Ценообразование

### Прогрессия

```ts
function getPrice(base: number, growth: number, owned: number): number {
  return Math.floor(base * Math.pow(growth, owned));
}

// Примеры growth:
// 1.1 — медленная (long-term)
// 1.3 — средняя (default)
// 1.5 — быстрая (casual)
// 2.0 — агрессивная (late game, prestige)
```

### Динамическая коррекция

```ts
function getAdjustedPrice(base: number, growth: number, owned: number, playerBalance: number): number {
  const standard = getPrice(base, growth, owned);
  // Если игрок слишком богат — ускоряем инфляцию
  if (playerBalance > base * 100) return standard * 1.5;
  return standard;
}
```

## Доход

### Per tap

```ts
function getTapReward(state: GameState): number {
  return state.tapBase * state.tapMultiplier * state.boostMultiplier;
}
```

### Per second (idle/auto)

```ts
function getIncomePerSec(state: GameState): number {
  return Object.values(state.buildings).reduce((sum, b) => {
    const building = BUILDINGS[b.id];
    return sum + (building.baseProduction * b.level * b.count);
  }, 0) * state.globalMultiplier * state.boostMultiplier;
}
```

## Инфляция

### Как обнаружить

- Игрок копит > 5 мин без трат
- Цена следующей покупки < 1% от баланса

### Как лечить

1. **Новые tier'ы** (лучший способ)
2. **Sink'и**: prestige, re-roll, cosmetics
3. **Динамическая редкость**: меньше rare'ов при высоком балансе
4. **Рост цен**: costGrowth > 1.0

## Sink'и (стоки денег)

| Действие | Стоимость | Цель |
|---|---|---|
| Upgrade | variable | progression |
| New slot | high | expansion |
| Boost | medium | urgency |
| Re-roll | medium | randomness |
| Prestige | all balance | meta-progression |
| Cosmetic | high | self-expression |

## Связь с MECHANICS

Эта система нужна для:
- **OFFLINE_PROGRESS** — расчёт offline earnings
- **PRESTIGE** — сброс баланса за бонус
- **DAILY_REWARD** — начисление наград
- **QUESTS** — выплата reward'ов
- **SHOP** — отображение цен

## Связь с GENRE

| Жанр | Особенности |
|---|---|
| Merge | монеты за merge, цены на слоты |
| Clicker | монеты за tap + auto |
| Idle | монеты/с от зданий |
| Tycoon | монеты от посетителей |
| Match-3 | монеты за уровни, lives |
| Survivor | монеты за kills, gold за run |
| TD | монеты за wave |
| Collector | ничего, коллекция — главная |

## Чек-лист

- [ ] 1-2 валюты (не больше)
- [ ] Цены по формуле
- [ ] Доход считается
- [ ] Sink'и работают
- [ ] Инфляция под контролем
