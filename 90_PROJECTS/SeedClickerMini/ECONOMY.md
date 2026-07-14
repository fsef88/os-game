# ECONOMY

**Версия:** 0.1.0

## Валюты

### Soft currency: Coins

**Назначение:** основная валюта прогрессии  
**Источники:** тап по семечку, авто-доход  
**Тратится на:** tap upgrade, auto-income upgrade

## Прогрессия

### Тип: exponential-lite

```text
tap_upgrade_cost(level) = round(25 * 1.6^level)
auto_income_cost(level) = round(60 * 1.8^level)
```

## Источники дохода

| Источник | Сумма | Условие |
|---|---|---|
| Seed tap | tapPower | каждый тап |
| Auto income tick | autoIncomePerSecond / 5 | 5 раз в секунду, если куплен income |

## Sink'и

| Действие | Стоимость | Зачем |
|---|---|---|
| Tap upgrade | растущая | ускорить активную игру |
| Auto income upgrade | растущая | открыть и усилить пассивную игру |

## Цель золотого часа

Для пилота вместо часа важнее первые 3 минуты:
- 10+ тапов;
- 1 tap upgrade;
- 1 auto-income upgrade;
- ощущение ускорения.

## Баланс

См. [BALANCE.md](./BALANCE.md)
