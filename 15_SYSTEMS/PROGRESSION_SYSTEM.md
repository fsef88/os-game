**Tags:** producer, progression, systems

# PROGRESSION SYSTEM

Версия: 1.0

---

## Связь с BIBLE

Для понимания принципов → 06_BIBLES/PLAYER_PSYCHOLOGY.md

---


## Назначение

Управление прогрессом игрока: уровни, XP, unlocks, prestige.

Используется: 100% игр.

---

## Типы прогрессии

### 1. Линейный (уровни)

```ts
const level = Math.floor(xp / 100);
const xpToNext = 100 - (xp % 100);
```

### 2. Экспоненциальный (цены)

```ts
const cost = baseCost * Math.pow(growth, owned);
```

### 3. Ступенчатый (tier'ы)

```ts
function getTier(xp: number): number {
  if (xp < 1000) return 0;
  if (xp < 5000) return 1;
  if (xp < 20000) return 2;
  return 3;
}
```

### 4. Смешанный (unlocks)

```ts
// Уровень + выполненные квесты + собранная коллекция
function isUnlocked(feature: string, state: State): boolean {
  return state.level >= feature.minLevel
      && state.questsCompleted.includes(feature.requiredQuest)
      && state.collectionProgress >= feature.minCollection;
}
```

## Уровни

### Опыт

```ts
// Источники XP
const xpSources = {
  merge: 1,
  sell: 2,
  quest_complete: 50,
  achievement: 100,
  level_up: 0, // нельзя
};
```

### Формула

```ts
// Линейная (для casual)
function xpForLevel(level: number): number {
  return level * 100; // 100, 200, 300...
}

// Экспоненциальная (для long-term)
function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}
```

## Unlock'и

### Что блокировать

- Новые tier'ы (открываются по уровню)
- Новые системы (после 2-3 дня игры)
- Премиум-контент (после prestige)
- Cosmetics (опционально)

### Что НЕ блокировать

- Core loop (всегда доступен)
- Save/load (всегда)
- Базовые апгрейды (с 1 уровня)

## Prestige (сброс)

### Когда

- Поздняя игра (7+ дней)
- Player замедлился
- Хочется нового ощущения

### Формула

```ts
function getPrestigeBonus(state: State): number {
  const totalEarned = state.totalEarned;
  // 1% bonus за каждые 1000 earned
  return Math.floor(totalEarned / 1000) * 0.01;
}

// Пример: 1M earned = 10% bonus
```

### Что сбрасывать

✅ Монеты, уровень, прогресс  
✅ Building count, upgrade level  
❌ Достижения (некоторые — навсегда)  
❌ Premium currency  
❌ Cosmetics

### Что давать

- +X% к income permanently
- Новая валюта (prestige points)
- Доступ к новому контенту

## Multipliers

Глобальные множители для баланса:

```ts
state.multipliers = {
  tap: 1,           // базовый tap
  income: 1,        // базовый income
  costReduction: 0, // скидка на цены (cosmetic/iap)
  xp: 1,            // бонус к XP
  rare: 1,          // шанс rare (default 1)
};
```

## Player Level vs Game Progression

| Параметр | Player Level | Game Progression |
|---|---|---|
| Что отслеживает | Общий опыт игрока | Прогресс в текущей игре |
| Сбрасывается | Никогда | При prestige |
| Награды | Unlock'и | Новый контент |
| Видимость | Всегда видно | Всегда видно |

## Связь с MECHANICS

- **OFFLINE_PROGRESS** — использует progression для расчёта
- **DAILY_REWARD** — даёт XP бонус
- **ACHIEVEMENTS** — увеличивают player level
- **PRESTIGE** — сбрасывает progression, сохраняет level
- **BATTLE_PASS** — сезонный progression

## Чек-лист

- [ ] Источники XP определены
- [ ] Формула уровня выбрана
- [ ] Unlock'и работают
- [ ] Prestige функция (если нужен)
- [ ] Multipliers не конфликтуют
