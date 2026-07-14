**Tags:** daily, reward

# DAILY REWARD

Версия: 1.0

---

## Что это

Награда за ежедневный вход. Стимулирует retention D1, D7, D30.

---

## Структура

```ts
interface DailyReward {
  day: number;
  reward: {
    coins?: number;
    crystals?: number;
    items?: string[];
    special?: 'chest' | 'boost' | 'pet';
  };
  isMilestone?: boolean;
}
```

## Пример (7-дневный цикл)

```ts
const DAILY_REWARDS = [
  { day: 1, reward: { coins: 100 } },
  { day: 2, reward: { coins: 200 } },
  { day: 3, reward: { coins: 500 } },
  { day: 4, reward: { coins: 800 } },
  { day: 5, reward: { coins: 1500 } },
  { day: 6, reward: { coins: 2500 } },
  { day: 7, reward: { coins: 5000, crystals: 10, special: 'chest' }, isMilestone: true },
];
```

## Логика

### Хранение

```ts
interface DailyState {
  lastClaimed: number;
  currentDay: number;
  streak: number;
  isFrozen: boolean;
  freezeAvailable: number;
}
```

### Проверка доступности

```ts
function canClaimDaily(): boolean {
  const daily = state.get().daily;
  const elapsed = (Date.now() - daily.lastClaimed) / 1000 / 3600;
  return elapsed > 20; // > 20 часов
}
```

### Клейм

```ts
function claimDaily(): boolean {
  if (!canClaimDaily()) return false;

  const daily = state.get().daily;
  const dayIndex = (daily.currentDay - 1) % DAILY_REWARDS.length;
  const reward = DAILY_REWARDS[dayIndex];

  giveReward(reward.reward);
  analytics.track('daily_claimed', { day: daily.currentDay });

  state.set({
    daily: {
      ...daily,
      lastClaimed: Date.now(),
      currentDay: daily.currentDay + 1,
      streak: daily.streak + 1,
    },
  });

  toast.show(`День ${daily.currentDay}: +${formatNumber(reward.reward.coins)} монет`);
  return true;
}
```

### Стрик (подряд дней)

```ts
function checkStreakBreak() {
  const daily = state.get().daily;
  const elapsed = (Date.now() - daily.lastClaimed) / 1000 / 3600;

  if (elapsed > 48) {
    state.set({
      daily: { ...daily, currentDay: 1, streak: 0, isFrozen: false },
    });
  }
}
```

## Freeze (заморозка)

Если игрок пропустил день, можно использовать freeze, чтобы не сломать стрик.

```ts
function useDailyFreeze(): boolean {
  const daily = state.get().daily;
  if (daily.freezeAvailable <= 0) return false;

  state.set({
    daily: {
      ...daily,
      isFrozen: true,
      freezeAvailable: daily.freezeAvailable - 1,
      lastClaimed: Date.now(),
    },
  });
  return true;
}
```

### Как получить freeze
- За 7-дневный стрик
- За rewarded ad (1 раз в день)
- За IAP

## UI

### Модалка при входе
```
[Daily Reward!]

День 5/7
+1500 монет
[Забрать]  [Завтра]
```

### Календарь
```
[✓] День 1
[✓] День 2
[✓] День 3
[✓] День 4
[•] День 5 (сегодня)
[ ] День 6
[ ] День 7
```

## Баланс

```
Day 1:    100
Day 2:    200
Day 3:    500
Day 4:    800
Day 5:    1500
Day 6:    2500
Day 7:    5000 + 10 crystals + 1 chest
```

Сумма за 7 дней = 10 600 монет + 10 crystals + 1 chest.
Это примерно 1-2 часа активной игры.

## Чек-лист

- [ ] 7+ наград
- [ ] Модалка при входе
- [ ] Сохранение lastClaimed
- [ ] Streak считается
- [ ] Reset после 48 ч
- [ ] Freeze (опционально)
- [ ] UI в HUD
