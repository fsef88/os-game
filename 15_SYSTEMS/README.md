**Tags:** core, systems

# SYSTEMS

Версия: 1.0
Дата: 2026-07-14

---

## Связь с BIBLE

Для понимания принципов → 00_CORE/MISSION.md

---


## Назначение

Универсальные системы, которые используются **в любой игре** независимо от жанра.

Каждая система — отдельный модуль с чёткими границами.

## Список систем

| Система | Файл | Используется в |
|---|---|---|
| Save | SAVE_SYSTEM.md | 100% игр |
| Economy | ECONOMY_SYSTEM.md | 100% игр |
| UI | UI_SYSTEM.md | 100% игр |
| Input | INPUT_SYSTEM.md | 100% игр |
| Audio | AUDIO_SYSTEM.md | 100% игр |
| Progression | PROGRESSION_SYSTEM.md | 100% игр |
| Spawn | SPAWN_SYSTEM.md | Merge, Match-3, Tycoon |
| Animation | ANIMATION_SYSTEM.md | 100% игр |
| Notification | NOTIFICATION_SYSTEM.md | 100% игр |
| Event (in-game) | EVENT_SYSTEM.md | 100% игр |
| IAP | IAP_SYSTEM.md | IAP-игры |
| Localization | I18N_SYSTEM.md | 100% игр |

## Принципы

1. **Система = 1 модуль** в коде. Один файл, одна ответственность.
2. **Система не знает про жанр.** Она работает в merge так же, как в tycoon.
3. **Система принимает данные, возвращает данные.** Без побочных эффектов на UI.
4. **Система тестируется отдельно.** Можно запустить в консоли.

## Жизненный цикл системы

```
init()    — настройка при старте игры
update()  — каждый кадр (если нужно)
save()    — сохранение состояния
load()    — загрузка состояния
reset()   — сброс (для prestige)
```

## Антипаттерны

- ❌ Система знает про UI (должна отдавать данные, UI подписывается)
- ❌ Система вызывает другие системы напрямую (через события)
- ❌ Система содержит жанровую логику (вынести в GENRE)
- ❌ Глобальные переменные (всё через state)

## Связь с GENRE и MECHANICS

```
GENRE (Merge/Clicker/Idle)     — что делает игрок
  ↓ использует
SYSTEMS (Save/Economy/UI)      — как это работает
  ↓ наполняется
MECHANICS (Quests/Prestige)    — что удерживает игрока
```

Пример: Merge-жанр использует Spawn System + Grid UI, плюс Mechanic Offline Progress.
