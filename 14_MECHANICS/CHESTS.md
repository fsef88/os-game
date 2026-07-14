# CHESTS

**Версия:** 1.0  
**Дата:** 2026-07-14

---

## Что это

Сундуки / кейсы / boxes — механика отложенной или мгновенной награды с визуальным открытием.

## Когда использовать

Подходит для:
- Merge
- Collector
- Idle (редко)
- Event rewards

Не подходит для MVP, если core loop ещё не работает.

## Зачем нужны

- дать mid-session цель;
- усилить anticipation;
- упаковать bundle reward в один UX-момент;
- поддержать rewarded ads и daily reward.

## Минимальная модель

```ts
interface ChestReward {
  coins?: number;
  crystals?: number;
  itemId?: string;
  itemCount?: number;
}

interface Chest {
  id: string;
  rarity: 'common' | 'rare' | 'epic';
  rewards: ChestReward[];
  openTimeSec?: number;
}
```

## Правила хорошего сундука

- награда заметна;
- анимация короткая;
- не ломает экономику;
- игрок понимает, за что получил сундук;
- opening не блокирует игру слишком долго.

## Чек-лист

- [ ] понятный источник сундука
- [ ] понятная редкость
- [ ] награда не мусорная
- [ ] анимация < 2 сек
- [ ] есть лог события в аналитике
