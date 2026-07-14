**Tags:** collector

# COLLECTOR

Версия: 1.0

---

## Что это

Главная цель — собрать коллекцию. Прогресс = закрытые "клетки" в альбоме.

**Примеры:** Pokemon Go, Marvel Snap, Brawl Stars (brawlers), Diskord Pets.

---

## Core Loop

```
Получает случайный предмет
  ↓
Добавляет в коллекцию
  ↓
Заполняет "клетку"
  ↓
Видит прогресс (%)
  ↓
Хочет закрыть следующую
```

## Meta Loop

```
Коллекция 1 (10 предметов)
  ↓
Закрытие → unlock новых
  ↓
Коллекция 2 (20 предметов)
  ↓
...
```

## Ключевые механики (MECHANICS)

✅ Achievements
✅ Chests
✅ Daily Reward
✅ Loot

Опционально:
- IAP
- Trade (сложно)

## Уникальные формулы

### Коллекция

```ts
interface Collection {
  id: string;
  name: string;
  totalItems: number;
  items: CollectionItem[];
  rewardOnComplete: Reward;
}

interface CollectionItem {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  chance: number;
  obtainedAt?: number;
}
```

### Получение

```ts
function tryObtainItem(collection: Collection): CollectionItem | null {
  const unobtained = collection.items.filter(i => !i.obtainedAt);
  if (unobtained.length === 0) return null;
  // weighted random
  return rollLoot(unobtained.map(i => ({ ...i, weight: 1 / i.rarity })));
}
```

## UI-особенности

- Сетка предметов (видна коллекция)
- "???" для не полученных
- Прогресс-бар (X из Y)
- Кнопка "получить" (за ресурсы)
- Hover для preview

## Антипаттерны

- 100+ предметов в одной коллекции (infodump)
- Нет visual reward за новый предмет
- Pay-only для редких
- Слишком быстро закрытие (5 минут)
- Слишком долго (1 год)

## Когда НЕ делать collector

- Не любишь "собирать всё"
- Нет идей для визуально интересных предметов

## Связь с другими жанрами

Collector + Merge = естественно (collect через merge).
Collector + Match-3 = собираешь карты за уровни.
Collector + Tycoon = собираешь гостей / здания.