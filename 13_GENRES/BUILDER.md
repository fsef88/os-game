**Tags:** builder, ui

# BUILDER

Версия: 1.0

---

## Что это

Игрок строит и украшает. Город, ферма, аквариум. Акцент на визуал и кастомизацию.

**Примеры:** Township, Hay Day, CityVille, FarmVille 3.

---

## Core Loop

```
Запрашивает ресурсы (через тап)
  ↓
Ресурсы появляются
  ↓
Тратит на новое здание / декор
  ↓
Здание размещается
  ↓
Эстетика улучшается
  ↓
Открывает новые зоны
```

## Meta Loop

```
Зона 1
  ↓
Зона 2 (после level)
  ↓
Зона 3
  ↓
Декор / скины
  ↓
Расширение
```

## Ключевые механики (MECHANICS)

✅ Upgrades
✅ Quests
✅ Daily Reward
✅ Achievements

Опционально:
- IAP (decoration packs)
- Trade (с соседями)

## Уникальные формулы

### Здание

```ts
interface Building {
  id: string;
  name: string;
  baseCost: { wood: number; stone: number };
  production?: { type: string; perSec: number };
  size: { w: number; h: number };
  theme: string; // визуальный стиль
}
```

### Сетка

```ts
const GRID_SIZE = 12; // 12x12 для города
```

## UI-особенности

- Isometric или top-down view
- Drag для прокрутки
- Pinch для zoom
- Bottom panel: здания для размещения
- Кнопка "снести"

## Антипаттерны

- Огромная сетка (пустая)
- Здания не синергируют
- Дорогое расширение
- Нет визуального различия между зданиями
- Долгое ожидание ресурсов

## Когда НЕ делать builder

- Не любишь placement
- Хочется быстрый core loop
- Не можешь придумать визуальную тему

## Связь с другими жанрами

Builder = Tycoon с акцентом на визуал.
Builder + Idle = Township (ресурсы копятся).
Builder + Match-3 = мини-игры в меню.