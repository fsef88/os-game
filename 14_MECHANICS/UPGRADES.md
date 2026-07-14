**Tags:** upgrades

# UPGRADES

Версия: 1.0

---

## Что это

Улучшения для игрока: tap power, income boost, unlock new features.

---

## Типы

### 1. Tap upgrade (clicker)

```ts
{
  id: 'tap_1',
  name: 'Сильный тап',
  description: '+50% к тапу',
  baseCost: 50,
  costMult: 1.5,
  maxLevel: 10,
  effect: { type: 'tap_mult', value: 1.5 },
}
```

### 2. Income upgrade (idle)

```ts
{
  id: 'income_1',
  name: 'Удобрение',
  description: '+10% к доходу',
  baseCost: 100,
  costMult: 1.4,
  maxLevel: 20,
  effect: { type: 'income_mult', value: 1.1 },
}
```

### 3. Building (idle/tycoon)

```ts
{
  id: 'building_field',
  name: 'Поле',
  description: 'Производит пшеницу',
  baseCost: 100,
  costMult: 1.15,
  maxLevel: null,
  effect: { type: 'production', value: 1, building: 'wheat' },
  requires: { level: 1 },
}
```

### 4. Unlock (one-time)

```ts
{
  id: 'unlock_auto_buy',
  name: 'Авто-покупка',
  description: 'Здания покупаются автоматически',
  baseCost: 5000,
  costMult: 1,
  maxLevel: 1,
  effect: { type: 'feature', feature: 'auto_buy' },
}
```

## Формула цены

```ts
function getUpgradeCost(upgrade: Upgrade, level: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, level));
}
```

## Применение эффекта

```ts
function applyUpgrade(upgrade: Upgrade, level: number) {
  const effect = upgrade.effect;
  switch (effect.type) {
    case 'tap_mult':
      state.set(s => ({ tapMultiplier: s.tapMultiplier * effect.value }));
      break;
    case 'income_mult':
      state.set(s => ({ incomeMultiplier: s.incomeMultiplier * effect.value }));
      break;
    case 'feature':
      state.set(s => ({ features: { ...s.features, [effect.feature]: true } }));
      break;
  }
}
```

## UI

```
⚡ Улучшения

[Сильный тап]           Ур. 3/10
+50% к тапу              200 монет
[Купить]

[Удобрение]             Ур. 5/20
+10% к доходу            500 монет
[Купить]
```

## Баланс

| Тип | baseCost | costMult | maxLevel |
|---|---|---|---|
| Tap (early) | 50 | 1.5 | 10 |
| Tap (late) | 5000 | 1.8 | 5 |
| Income (early) | 100 | 1.4 | 20 |
| Income (late) | 10000 | 1.5 | 10 |
| Building | 100 | 1.15 | unlimited |

### Cumulative cost

При costMult 1.5 и maxLevel 10:
- 1 уровень: 50
- 10 уровень: 5766
- Сумма всех: ~12000

При costMult 1.15 и unlimited:
- Уровень 50: 55000
- Уровень 100: 1.3M

## Чек-лист

- [ ] Список upgrade'ов (10-30)
- [ ] Формула цены
- [ ] Применение эффекта
- [ ] UI с прогрессом
- [ ] Disabled state
- [ ] Max level
- [ ] Сохранение уровня