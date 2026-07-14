# BALANCE

**Версия:** 0.1.0

## Базовые числа

```text
startingMoney = 0
tapBase = 1
tapUpgradeBaseCost = 25
tapUpgradeGrowth = 1.6
autoIncomeBaseCost = 60
autoIncomeGrowth = 1.8
autoIncomePerLevel = 1 coin/sec
```

## Примеры прогрессии

### Tap Upgrade

| Level | Cost | Tap Power |
|---|---:|---:|
| 0 | 25 | 1 |
| 1 | 40 | 2 |
| 2 | 64 | 3 |
| 3 | 102 | 4 |
| 4 | 164 | 5 |

### Auto Income

| Level | Cost | Income / sec |
|---|---:|---:|
| 0 | 60 | 0 |
| 1 | 108 | 1 |
| 2 | 194 | 2 |
| 3 | 350 | 3 |
| 4 | 630 | 4 |

## UX targets

- первый upgrade < 20 секунд;
- первый passive income < 45 секунд;
- игрок не сидит без решения дольше 10-15 секунд.
