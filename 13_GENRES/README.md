**Tags:** core, genres

# GENRES

Версия: 1.0
Дата: 2026-07-14

---

## Назначение

Жанровые спецификации. Каждый файл описывает:
- Core loop (что делает игрок)
- Meta loop (что удерживает)
- Ключевые механики
- Уникальные подводные камни
- Референсы

## Tier S (обязательно, ~80-90% рынка)

| Жанр | Файл | Сложность |
|---|---|---|
| Merge | MERGE.md | Средняя |
| Clicker | CLICKER.md | Простая |
| Idle | IDLE.md | Средняя |
| Tycoon | TYCOON.md | Сложная |

## Tier A (после Tier S)

| Жанр | Файл | Подходит для Яндекс |
|---|---|---|
| Match-3 | MATCH3.md | Отлично |
| Puzzle | PUZZLE.md | Хорошо |
| Builder | BUILDER.md | Хорошо |
| Tower Defense | TD.md | Средне |
| Survivor | SURVIVOR.md | Хорошо |
| Incremental | INCREMENTAL.md | Отлично |
| Collector | COLLECTOR.md | Хорошо |

## Tier B (тематические вариации)

Использовать как тему для Tycoon (см. TYCOON.md):
- Fishing, Restaurant, Cafe, Hotel, Airport, Zoo, Aquarium
- Museum, Farming, Cooking, Train, Factory

## Структура жанрового файла

Каждый файл содержит:
1. Что это
2. Примеры успешных игр
3. Core loop
4. Meta loop
5. Ключевые механики (какие MECHANICS подключить)
6. Уникальные формулы
7. UI-особенности
8. Антипаттерны
9. Magic Numbers
10. Когда НЕ делать

## Принципы

1. Жанр — это НЕ про "логику". Это про "что игрок делает каждую секунду".
2. Один жанр = один core loop. Не смешивать.
3. 80% успеха — это retention. Не core loop.
4. Каждый жанр требует уникальный UI.

## Связь с другими разделами

- **MECHANICS** подключаются к жанру
- **SYSTEMS** обеспечивают фундамент
- Жанр НЕ переопределяет системы

## Комбинации

Игра = жанр + набор механик.

Примеры:
- "Merge + Daily + Offline + Quests" = Merge Farm
- "Clicker + Prestige + Achievements" = простой кликер
- "Idle + Battle Pass + Rebirth" = long-term idle
- "Tycoon + Shop + Upgrades" = city builder

## Следующие шаги

1. Реализовать Tier S (4 жанра) полностью
2. Сделать 1-2 игры в каждом жанре
3. Добавить Tier A по запросу
4. Tier B — не отдельные файлы, а темы для Tycoon
