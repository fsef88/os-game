**Tags:** energy

# ENERGY / LIVES

Версия: 1.0

---

## Что это

Ограниченный ресурс для действий (puzzle, level-based).

---

## Когда использовать

- Puzzle (жизни)
- Level-based (energy)
- Match-3

НЕ для merge, idle, clicker.

---

## Структура

```ts
interface EnergyState {
  current: number;
  max: number;
  regenPerMinutes: number;
  lastRegenAt: number;
}
```

## Примеры

### Lives (5 жизней, 5 мин на реген)

```ts
const MAX_LIVES = 5;
const LIFE_REGEN_MIN = 5;
```

### Energy (10 единиц, 3 мин на реген)

```ts
const MAX_ENERGY = 10;
const ENERGY_REGEN_MIN = 3;
```

## Логика

### Потратить

```ts
function spendEnergy(amount = 1): boolean {
  const e = state.get().energy;
  if (e.current < amount) return false;
  state.set({
    energy: { ...e, current: e.current - amount, lastRegenAt: Date.now() },
  });
  return true;
}
```

### Восстановление (таймер)

```ts
function checkEnergyRegen() {
  const e = state.get().energy;
  if (e.current >= e.max) return;

  const now = Date.now();
  const elapsed = now - e.lastRegenAt;
  const regenMs = e.regenPerMinutes * 60 * 1000;
  const newCurrent = Math.min(e.max, e.current + Math.floor(elapsed / regenMs));

  if (newCurrent !== e.current) {
    const remainder = elapsed % regenMs;
    state.set({
      energy: { ...e, current: newCurrent, lastRegenAt: now - remainder },
    });
  }
}

setInterval(checkEnergyRegen, 1000);
```

### Получить бесплатно

```ts
function offerRefill() {
  showRewardedAd(() => {
    state.set(s => ({
      energy: { ...s.energy, current: s.energy.max, lastRegenAt: Date.now() },
    }));
    analytics.track('energy_refilled');
  });
}
```

## UI

### HUD

```
❤️ 3/5
```

При тапе:
```
[Энергия]
3/5
+1 через 2 мин

[Бесплатно за рекламу] [5 💎]
```

### Disabled

- Кнопка "Играть" disabled если current = 0
- Показывать "Нет энергии" + кнопка refill

## Баланс

| Параметр | Lives (puzzle) | Energy (level) |
|---|---|---|
| Max | 5 | 10 |
| Regen | 5 мин | 3 мин |
| Полный refill | 25 мин | 30 мин |
| Стоимость level | — | 1 energy |

## Чек-лист

- [ ] Lives считаются
- [ ] Regen работает
- [ ] Refill за рекламу
- [ ] Refill за hard currency
- [ ] UI в HUD
- [ ] Disabled state
- [ ] Сохранение в save
