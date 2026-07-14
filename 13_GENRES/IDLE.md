**Tags:** idle

# IDLE

Версия: 1.0

---

## Что это

Игрок строит "производственную цепочку" (здания → ресурсы → новые здания). Доход идёт даже AFK.

**Примеры:** Adventure Capitalist, Egg Inc, Idle Miner Tycoon, Realm Grinder.

---

## Core Loop

```
Покупает здание
  ↓
Здание производит ресурсы
  ↓
Доход накапливается (даже AFK)
  ↓
Игрок забирает (collect)
  ↓
Покупает ещё зданий
  ↓
Открывает новые tier'ы
```

## Meta Loop

```
Tier 1: базовые здания
  ↓
Tier 2: средние
  ↓
Tier 3: продвинутые
  ↓
Tier 4: элитные
  ↓
Prestige / Rebirth
  ↓
Всё сначала, но с бонусом
```

## Ключевые механики (MECHANICS)

✅ Offline Progress (обязательно)
✅ Prestige / Rebirth
✅ Upgrades
✅ Achievements
✅ Daily Reward

Опционально:
- Battle Pass (для v2.0)
- Chests
- Skills

## Уникальные формулы

### Здание

```ts
interface Building {
  id: string;
  name: string;
  baseCost: number;
  costMult: number;       // 1.15 (медленно)
  baseProduction: number; // в секунду
  tier: number;
  unlocksAt?: { tier: number, count: number };
}
```

### Цена

```ts
function getBuildingCost(building: Building, owned: number): number {
  return Math.floor(building.baseCost * Math.pow(building.costMult, owned));
}
```

### Производство

```ts
function getTotalIncomePerSec(): number {
  return Object.entries(state.get().buildings).reduce((sum, [id, count]) => {
    const b = BUILDINGS.find(b => b.id === id);
    return sum + (b.baseProduction * count);
  }, 0);
}
```

### Пример зданий (ферма)

```ts
const BUILDINGS = [
  { id: '"'"'field'"'"',  name: '"'"'Поле'"'"',     baseCost: 100,   costMult: 1.15, baseProduction: 1,   tier: 1 },
  { id: '"'"'garden'"'"', name: '"'"'Сад'"'"',      baseCost: 150,   costMult: 1.15, baseProduction: 1.5, tier: 1 },
  { id: '"'"'mill'"'"',   name: '"'"'Мельница'"'"', baseCost: 1000,  costMult: 1.15, baseProduction: 5,   tier: 2, unlocksAt: { tier: 1, count: 5 } },
  { id: '"'"'bakery'"'"', name: '"'"'Пекарня'"'"',  baseCost: 10000, costMult: 1.15, baseProduction: 30,  tier: 3, unlocksAt: { tier: 2, count: 5 } },
];
```

### Magic Numbers

```ts
baseCost: 100
costMult: 1.15 (медленно)
productionMultiplier: 1.5 (per level)
offlinePercent: 0.5
offlineMaxHours: 4
prestigeBonus: 0.1 за 1000 production
```

## UI-особенности

- Список зданий с ценой и доходом
- "Collect" кнопка для накопленных монет
- Прогресс-бар до следующего unlock
- Tier'ы визуально разделены
- Idle-индикатор (часики для regen)

## Антипаттерны

- Слишком долгое начало (1 час до первого здания)
- Здания одного tier одинаковые (нет выбора)
- Нет визуального feedback (здание "молчит")
- Prestige ломает save (теряются достижения)
- Дорогое расширение (застревает)

## Когда НЕ делать idle

- Если игрок ожидает экшн (idle про созерцание)
- Если времени мало (idle про долгие сессии)

## Связь с другими жанрами

Idle + Prestige = natural.
Idle + Clicker = часто комбинируют.
Idle + Tycoon = один жанр (разные эпохи).