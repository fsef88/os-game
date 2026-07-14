# GAME DESIGN

**Название:** Alchemy Lab  
**Версия:** 0.1.0

## Why play?

Потому что игрок сразу понимает базовую магию процесса: два одинаковых ингредиента рождают что-то новое и визуально более ценное.

## Why stay?

Каждое новое открытие открывает не просто больший number, а новый объект в журнале, более ценный заказ и ощущение прогресса мастерской.

## Why return?

Система заказов и журнала хорошо расширяется: в следующих версиях можно добавить daily contracts, rare ingredients и временные события.

## Core Loop (подробно)

1. Игрок нажимает `Gather Ingredient`.
2. На столе появляется базовая `Spark`.
3. Игрок собирает вторую такую же и объединяет их.
4. Получает новый tier — например, `Glow Herb`.
5. Видит заказ на конкретный tier.
6. Выполняет заказ и получает essence.
7. Тратит essence на расширение стола или усиление катализатора.

## Meta Loop (подробно)

- discovery loop: открывать всё более редкие tier'ы;
- economy loop: закрывать заказы ради essence;
- board loop: бороться за место на столе;
- upgrade loop: покупать клетки и усиливать reward multiplier.

## Прогрессия

- Tier progression: Spark → Herb → Bloom → Crystal → Elixir
- Board progression: 6 активных клеток → 9 активных клеток
- Reward progression: catalyst повышает ценность заказов

## Экономика

См. [ECONOMY.md](./ECONOMY.md)

## Retention-механики

Текущий пилот:
- discovery journal;
- requests / orders;
- board pressure.

План v0.2:
- daily alchemy contracts;
- rare ingredient chance;
- special order chains.

## Контент

### Алхимическая цепочка MVP
- Spark
- Glow Herb
- Moon Bloom
- Aether Crystal
- Sun Elixir

### Системы MVP
- merge
- order board
- journal
- upgrades

## Onboarding (первые 30 секунд)

- игрок видит пустой стол и кнопку сбора ингредиента;
- быстро получает первые две Spark;
- совершает первый merge;
- понимает, что задача — открывать и собирать.

## First 10 minutes

Для пилота важны первые 3–5 минут:
- сделать 3–5 merge;
- выполнить хотя бы 1 заказ;
- открыть 1 клетку;
- усилить катализатор;
- увидеть 3+ открытия в журнале.

## Win condition

Для пилота победа = игрок понимает discovery loop и хочет открыть следующий tier.

## Когда игра заканчивается

В MVP формального конца нет. Игрок упирается в дальнейшее расширение журнала и экономических апгрейдов.
