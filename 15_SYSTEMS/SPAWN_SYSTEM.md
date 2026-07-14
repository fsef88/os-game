**Tags:** spawn, systems

# SPAWN SYSTEM

Версия: 1.0

---

## Связь с BIBLE

Для понимания принципов → 13_GENRES/

---


## Назначение

Появление новых объектов: автоматический spawn, ручной spawn, ограничения.

Используется: Merge, Match-3, Tower Defense, Tycoon.

---

## Типы spawn'а

### 1. Автоматический (по таймеру)

```ts
class SpawnSystem {
  private interval: number;
  private nextSpawn: number;
  private maxCount: number;

  start() {
    setInterval(() => this.spawn(), this.interval);
  }

  spawn() {
    if (this.getCurrentCount() >= this.maxCount) return;
    const obj = this.createObject();
    this.addToGrid(obj);
  }

  getCurrentCount(): number {
    return state.get().grid.filter(cell => cell.object).length;
  }
}
```

### 2. По тапу игрока

```ts
function onTapEmptySlot(slot: Slot) {
  if (slot.isEmpty() && canAfford('spawn')) {
    const obj = createRandomObject(state.get().playerLevel);
    slot.set(obj);
    spendMoney(getSpawnCost());
  }
}
```

### 3. По достижению

```ts
function onQuestComplete(quest: Quest) {
  const reward = quest.reward;
  if (reward.type === 'spawn') {
    addToRandomEmptySlot(createObject(reward.itemId));
  }
}
```

## Где появляется

### Random

```ts
function getRandomEmptySlot(grid: Grid): Slot | null {
  const empty = grid.filter(s => s.isEmpty() && s.isUnlocked);
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}
```

### Smart (предпочитать merge-пары)

```ts
function getSmartEmptySlot(grid: Grid, newObj: Object): Slot | null {
  // Найти слот, где рядом есть пара для merge
  for (const slot of grid) {
    if (!slot.isEmpty() || !slot.isUnlocked) continue;
    const neighbor = getNeighbor(slot);
    if (neighbor && neighbor.canMergeWith(newObj)) {
      return slot;
    }
  }
  return getRandomEmptySlot(grid);
}
```

## Что появляется

### По уровню игрока

```ts
function createObject(playerLevel: number): Object {
  // Базовый объект — Семечко
  // С увеличением уровня — выше шанс редких
  const rareChance = Math.min(0.05, playerLevel * 0.001);
  const isRare = Math.random() < rareChance;
  return {
    level: 0,
    isRare,
    isGolden: !isRare && Math.random() < 0.02,
  };
}
```

### По источнику

| Источник | Что спавнится | Лимит |
|---|---|---|
| Auto spawn | Базовый объект (tier 0) | max 1 in grid |
| Player tap | Базовый объект | по деньгам |
| Quest reward | Указанный объект | 1 |
| Chest | Случайный, weighted | 1 |
| Rewarded | Базовый x3 | по таймеру |

## Ограничения

### По сетке

```ts
const MAX_OBJECTS = 16; // 4x4
```

### По редкости

```ts
// Не более 1 золотого на сетке
function spawn(): boolean {
  const goldens = countGoldens(state.get().grid);
  if (goldens >= MAX_GOLDENS && newObj.isGolden) return false;
  return true;
}
```

## Тайминги

| Действие | Cooldown |
|---|---|
| Auto spawn (между появлениями) | 5-30 сек |
| Player spawn (между ручными) | 0 (если есть деньги) |
| Chest open | 1 раз в день |
| Rewarded bonus spawn | 1 раз в день |

## Анимация

При появлении:
- Fade in (200ms)
- Slight bounce
- Sound effect

## Связь с GENRE

| Жанр | Использование |
|---|---|
| Merge | Spawn базового объекта каждые 5-30 сек |
| Match-3 | Spawn новых плиток после match |
| Tower Defense | Spawn врагов каждую волну |
| Tycoon | Spawn visitors (авто) |
| Survivor | Spawn врагов (постоянно) |

## Чек-лист

- [ ] Spawn по таймеру работает
- [ ] Spawn по тапу работает
- [ ] Random vs Smart выбор
- [ ] Лимит по сетке соблюдается
- [ ] Редкость ограничена
- [ ] Анимация появления
- [ ] Звук появления
