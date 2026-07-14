**Tags:** loot

# LOOT TABLES

Версия: 1.0

---

## Что это

Таблицы вероятностей для случайных наград.

Используется: chests, gacha, random rewards, spawn, drop.

---

## Структура

```ts
interface LootEntry {
  item: string;
  amount: number | [number, number];
  weight: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  conditions?: (state: State) => boolean;
}

type LootTable = LootEntry[];
```

## Пример

```ts
const ENEMY_DROP = [
  { item: 'gold',   amount: [1, 5],   weight: 60 },
  { item: 'potion', amount: 1,         weight: 25, rarity: 'common' },
  { item: 'gem',    amount: 1,         weight: 10, rarity: 'rare' },
  { item: 'weapon', amount: 1,         weight: 4,  rarity: 'epic' },
];
```

## Алгоритм

```ts
function rollLoot(table: LootTable, state?: State): LootEntry {
  const valid = table.filter(e => !e.conditions || e.conditions(state));
  const totalWeight = valid.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of valid) {
    if (roll < entry.weight) {
      if (Array.isArray(entry.amount)) {
        const [min, max] = entry.amount;
        return { ...entry, amount: min + Math.floor(Math.random() * (max - min + 1)) };
      }
      return entry;
    }
    roll -= entry.weight;
  }
  return valid[valid.length - 1];
}
```

## Rarity (редкость)

```ts
const RARITY_THRESHOLDS = {
  common:    0.7,
  rare:      0.2,
  epic:      0.08,
  legendary: 0.02,
};
```

## Pity

```ts
class LootPity {
  private counter: Map<string, number>;

  track(tableId: string, rarity: string) {
    if (rarity === 'common') return;
    const current = this.counter.get(tableId) || 0;
    this.counter.set(tableId, current + 1);
  }

  shouldGuarantee(tableId: string, threshold: number): boolean {
    return (this.counter.get(tableId) || 0) >= threshold;
  }

  reset(tableId: string) {
    this.counter.set(tableId, 0);
  }
}
```

## Антипаттерны

- Только epic/legendary (inflate)
- Только common (boring)
- Без disclosure (mod rules)

## Чек-лист

- [ ] Tables определены
- [ ] Weighted random
- [ ] Pity system
- [ ] Disclosure (если IAP)
