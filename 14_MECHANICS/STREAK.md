**Tags:** streak

# STREAK

Версия: 1.0

---

## Что это

Подряд дней входа. Стимулирует D1, D7, D30.

См. также `DAILY_REWARD.md` — там основная реализация.

---

## Отличие от Daily Reward

| Daily Reward | Streak |
|---|---|
| Награда каждый день | Бонус за подряд |
| Сбрасывается каждую неделю | Растёт непрерывно |
| Базовая | Дополнительная |

---

## Структура

```ts
interface StreakState {
  current: number;
  max: number;
  lastLoginDate: string;
  freezeAvailable: number;
}
```

## Логика

### Обновление при входе

```ts
function updateStreak() {
  const s = state.get().streak;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (s.lastLoginDate === today) return;

  if (s.lastLoginDate === yesterday) {
    state.set({
      streak: { ...s, current: s.current + 1, max: Math.max(s.max, s.current + 1), lastLoginDate: today },
    });
  } else {
    if (s.freezeAvailable > 0) {
      state.set({ streak: { ...s, current: s.current + 1, freezeAvailable: s.freezeAvailable - 1, lastLoginDate: today } });
    } else {
      state.set({ streak: { ...s, current: 1, lastLoginDate: today } });
    }
  }
}
```

## Награды за стрик

| Day | Бонус |
|---|---|
| 3 | +100 coins |
| 7 | +500 coins + 1 chest |
| 14 | +1000 coins + 5 crystals |
| 30 | +5000 coins + 10 crystals + legendary chest |
| 100 | +50000 coins + 50 crystals + special skin |

### Раздача

```ts
const STREAK_REWARDS = {
  3: { coins: 100 },
  7: { coins: 500, chest: 'common' },
  14: { coins: 1000, crystals: 5 },
  30: { coins: 5000, crystals: 10, chest: 'legendary' },
};

function giveStreakReward(streak: number) {
  if (STREAK_REWARDS[streak]) {
    giveReward(STREAK_REWARDS[streak]);
    modal.show({ title: `Streak ${streak} дней!`, body: 'Специальная награда', reward: STREAK_REWARDS[streak] });
  }
}
```

## Freeze (заморозка)

### Получить freeze
- За 7-дневный стрик
- За 14-дневный стрик
- За IAP
- За rewarded (1 в неделю)

### Использовать
- Автоматически (если доступен)
- Вручную (кнопка в настройках)

## UI

### HUD

```
🔥 5 дней
```

### Модалка при входе

```
🔥 Streak 5 дней!

+500 монет + chest
[Забрать!]

[Нет, спасибо]
```

## Антипаттерны

- Слишком жёсткий reset
- Слишком ценные ранние награды
- Без freeze

## Чек-лист

- [ ] Считается current
- [ ] Считается max
- [ ] Reset после 48ч
- [ ] Freeze работает
- [ ] Награды выдаются
- [ ] UI в HUD