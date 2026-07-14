# ARCHITECTURE
**Status:** Stable
**Owner:** Studio
**Version:** 1.4
**Last Reviewed:** 2026-07-14

---



Версия: 1.0
Дата: 2026-07-14

**Tags:** core, architecture, overview

---

## Общая схема

```
Жанр (Genre)
   ↓ выбирает
Механика (Mechanic)
   ↓ использует
Система (System)
   ↓ потребляет
Компонент (Component)
   ↓ собирается в
Код (Project)
```

## Направление знаний

```
CORE        — зачем всё это
↓
BEHAVIOR    — как ИИ думает
↓
RULES       — формальные правила
↓
ROLES       — кто есть кто
↓
PIPELINE    — путь от идеи до релиза
↓
BIBLES      — глубокие справочники
↓
REFERENCE   — базовые знания
↓
GENRES      — что делает игрок
↓
MECHANICS   — какая логика
↓
SYSTEMS     — как работает
↓
COMPONENTS  — как выглядит
↓
DECISIONS   — почему именно так
```

## Направление применения

```
Studio OS (знания)
   ↓ применяется
TEMPLATE (заготовка)
   ↓ копируется
PROJECT (конкретная игра)
   ↓ примеряется
EXAMPLES (реальные кейсы)
```

## Конструктор игры

```
Игра = Жанр + набор Механик + базовые Системы + UI Компоненты

Примеры:
  Merge Farm   = MERGE + Offline + Quests + Achievements + Daily + Save + UI + Audio + Button + Popup + HUD + RewardScreen
  Clicker      = CLICKER + Upgrades + Prestige + Ads + Save + UI + Audio + Button + HUD
  Idle         = IDLE + Prestige + Rebirth + Offline + Save + UI + Audio + Button + Window (achievements)
  Tycoon       = TYCOON + Shop + Upgrades + Quests + Achievements + Save + UI + Button + CurrencyPanel
```

## Слои и их границы

| Слой | Отвечает на | Не знает про |
|---|---|---|
| BIBLE | Почему? Какие принципы? | Конкретный код |
| SYSTEM | Как реализовано? | Конкретный жанр |
| MECHANIC | Какая логика нужна? | Конкретный UI |
| GENRE | Что делает игрок? | Конкретный проект |
| COMPONENT | Как выглядит? | Конкретный жанр |

## Наследование изменений

Изменения идут **снизу вверх** (от общего к частному):

- Изменил Component → могут сломаться Mechanic и System, использующие его
- Изменил System → могут сломаться Mechanic и Genre
- Изменил Mechanic → могут потребоваться новые Component
- Изменил Genre → может потребоваться новый набор Mechanic
- Изменил BIBLE → может потребоваться пересмотр System

Правило: **проверяй зависимости при изменении любого слоя.**

## См. также

- [INDEX.md](../INDEX.md) — каталог всех документов
- [DEPENDENCY_MAP.md](../DEPENDENCY_MAP.md) — детальные зависимости
- [STUDIO_SCOPE.md](STUDIO_SCOPE.md) — что делаем
- [NON_GOALS.md](NON_GOALS.md) — что не делаем
