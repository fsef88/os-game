**Tags:** prestige

# PRESTIGE

Версия: 1.0

---

## Что это

Сброс прогресса за постоянный бонус. Продлевает жизнь игры.

---

## Когда добавлять

- Поздняя игра (7+ дней)
- Игрок замедлился
- Есть что предложить взамен

Не в v1.0 (рано), не в первые 3 дня, без ясной выгоды.

---

## Формула бонуса

### Стандартная

```ts
function getPrestigeBonus(state: State): number {
  // 0.1% bonus за каждую 1000 earned
  // 1M earned = 10% bonus
  const totalEarned = state.get().totalEarned || 0;
  return Math.floor(totalEarned / 1000) * 0.001;
}
```

### Альтернативная (тир-бонус)

```ts
function getPrestigeBonus(state: State): number {
  const maxTier = state.get().maxTierReached || 0;
  return maxTier * 0.05; // 5% за каждый max tier
}
```

## Что сбрасывается

Сбрасывается:
- Монеты, уровень
- Building count, upgrade levels
- Grid state (merge)
- Quest progress (текущие)

НЕ сбрасывается:
- Достижения (большинство)
- Premium currency (кристаллы)
- Cosmetics
- Player ID
- Статистика (total playtime, total earned)

## Что даётся

```ts
interface PrestigeReward {
  prestigeLevel: number;
  prestigePoints: number;
  bonusMultiplier: number;
  unlocks?: string[];
}
```

## Реализация

```ts
function doPrestige() {
  const state2 = state.get();
  const bonus = getPrestigeBonus(state2);

  modal.show({
    title: 'Престиж',
    body: `Сбросить прогресс за +${formatPercent(bonus)} к доходу?`,
    buttons: [
      { text: 'Отмена' },
      { text: 'Престиж!', onClick: () => {
        const keep = {
          achievements: state2.achievements,
          crystals: state2.crystals,
          totalPlayTime: state2.totalPlayTime,
          totalEarned: state2.totalEarned,
          prestigeLevel: (state2.prestigeLevel || 0) + 1,
          prestigeMultiplier: 1 + (state2.prestigeMultiplier || 0) + bonus,
        };

        state.set({ ...getInitialState(), ...keep });
        saveGame();
        analytics.track('prestige', { level: keep.prestigeLevel, bonus });
      }},
    ],
  });
}
```

## Когда показывать

### В меню

```
🏆 Prestige
Текущий бонус: +0%
Следующий: +12% (нужно 120к earned)
[Престиж]
```

### Когда доступен
- После 1 часа игры
- После level 5
- Когда игрок замедлился

### Когда НЕ доступен
- Первые 30 минут
- Уровень < 3
- Total earned < 10K

## Баланс

| Earned | Bonus | Время до prestige |
|---|---|---|
| 10K | +1% | 30 мин |
| 100K | +10% | 3 часа |
| 1M | +100% (×2) | 1 день |
| 10M | +1000% (×11) | 7 дней |

При бонусе x11 игрок за час заработает то, что раньше за день. Это правильный темп.

## Чек-лист

- [ ] Формула бонуса
- [ ] Что сбрасывается / сохраняется
- [ ] Подтверждение
- [ ] Анимация
- [ ] Звук
- [ ] UI с прогрессом
- [ ] Аналитика
- [ ] Сохранение prestige state
