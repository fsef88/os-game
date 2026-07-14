**Tags:** offline, producer

# OFFLINE PROGRESS

Версия: 1.0

---

## Что это

Игрок зарабатывает ресурсы, пока отсутствует.

Это **самая важная механика retention** для casual-игр.

---

## Формула (стандартная)

```ts
function calculateOfflineEarnings(state: State, elapsedSec: number): {
  earnings: number;
  capped: boolean;
} {
  const onlineEarning = state.incomePerSec;
  const offlineEarning = onlineEarning * elapsedSec * 0.5; // 50% от online
  const cap = onlineEarning * 3600 * 4; // cap = 4 часа online-дохода
  const capped = offlineEarning > cap;
  const earnings = Math.min(offlineEarning, cap);
  return { earnings, capped };
}
```

### Параметры

```
offlinePercent:        0.5   (50% от online)
maxOfflineSeconds:     14400 (4 часа)
minOfflineSeconds:     300   (5 минут — иначе игнорируем)
capVsOnline:           3-4   (cap = X часов online-дохода)
```

## Поток

### При выходе из игры

```ts
window.addEventListener('beforeunload', () => {
  state.set({ lastSeen: Date.now() });
  saveGame(state, true); // force save
});
```

### При входе в игру

```ts
function onGameStart() {
  const lastSeen = state.get().lastSeen || Date.now();
  const elapsed = (Date.now() - lastSeen) / 1000;

  if (elapsed > 300) { // больше 5 минут
    const { earnings, capped } = calculateOfflineEarnings(state.get(), elapsed);
    if (earnings > 0) {
      modal.show({
        title: 'С возвращением!',
        body: `Ты заработал ${formatNumber(earnings)} монет, пока отсутствовал.${capped ? ' (максимум)' : ''}`,
        buttons: [
          { text: 'Забрать!', onClick: () => {
            addMoney(earnings, 'offline');
            analytics.track('offline_claimed', { amount: earnings });
          }},
        ],
      });
    }
  }
}
```

## Edge cases

### Свежая установка

```ts
// Если lastSeen нет — игнорируем offline
if (!state.get().lastSeen) return;
```

### Очень долгое отсутствие

```ts
// Ограничиваем 4 часами (cap)
const cap = onlineEarning * 3600 * 4;
const earnings = Math.min(offlineEarning, cap);
```

### После prestige

```ts
// Offline считается от нового income
const baseIncome = state.get().incomePerSec * state.get().prestigeMultiplier;
```

## Варианты реализации

### Стандартный (рекомендую)

```ts
const earnings = onlineIncome * elapsedSec * 0.5;
const cap = onlineIncome * 3600 * 4;
return Math.min(earnings, cap);
```

### Прогрессивный

```ts
function getOfflinePercent(elapsedHours: number): number {
  if (elapsedHours < 1) return 0.5;
  if (elapsedHours < 4) return 0.5;
  if (elapsedHours < 12) return 0.4;
  return 0.3;
}
```

### Rewarded boost

```ts
modal.show({
  body: `+${formatNumber(earnings)} монет`,
  buttons: [
    { text: 'Удвоить (реклама)', onClick: () => showRewardedThenClaim(earnings * 2) },
    { text: 'Забрать', onClick: () => addMoney(earnings, 'offline') },
  ],
});
```

## Что НЕ считается offline

- ❌ Tap earnings (только idle)
- ❌ Merge rewards (только idle income)
- ❌ Daily reward (отдельная механика)
- ❌ Quest progress

Только **пассивный income** (buildings, pets, multipliers).

## Чек-лист

- [ ] Сохранение lastSeen
- [ ] Расчёт при входе
- [ ] Cap 4 часа
- [ ] Модалка с суммой
- [ ] Запись в analytics
- [ ] Не показывать < 5 мин
- [ ] Не показывать при свежей установке
