# BALANCE

**Версия:** 0.2.0

## Базовые числа

```text
grid = 3x3
startingUnlockedCells = 6
unlockCellCosts = [20, 40, 70]
catalystBaseCost = 25
catalystGrowth = 1.8
rewardMultiplierPerCatalyst = 0.25
orderRewards = {
  tier1: 12,
  tier2: 28,
  tier3: 65,
  tier4: 150
}
```

## Тиры

| Tier | Название | Роль |
|---|---|---|
| 0 | Spark | базовый ингредиент |
| 1 | Glow Herb | первый полноценный заказ |
| 2 | Moon Bloom | mid-tier discovery |
| 3 | Aether Crystal | сильный reward spike |
| 4 | Sun Elixir | верхний MVP-tier |

## UX targets

- первый merge < 20 сек;
- первый order completion < 90 сек;
- первая новая клетка < 2 мин;
- первый catalyst upgrade < 3 мин.
