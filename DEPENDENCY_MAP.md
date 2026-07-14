# DEPENDENCY MAP

Версия: 1.0
Дата: 2026-07-14

---

## Архитектура зависимостей

```
GENRE (что делает игрок)
  ↓ использует
MECHANICS (какая логика)
  ↓ использует
SYSTEMS (как работает)
  ↓ использует
COMPONENTS (как выглядит)
  ↓ собирается в
PROJECT (конкретная игра)
```

Каждый слой **нижестоящий** не знает про **вышестоящий**.
- Component не знает про Genre
- System не знает про Mechanic
- Mechanic не знает про Component

Но **вышестоящий** может использовать **нижестоящий**:
- Genre выбирает Mechanics
- Mechanic использует System
- System использует Component

---

## Конкретные зависимости

### GENRE → MECHANICS

| Genre | Рекомендуемые Mechanics |
|---|---|
| Merge | Offline + Quests + Achievements + Daily + Chests + Streak |
| Clicker | Upgrades + Achievements + Ads + Prestige (позже) |
| Idle | Offline + Upgrades + Prestige + Rebirth + Battle Pass (v2) |
| Tycoon | Upgrades + Quests + Shop + Achievements + Daily |
| Match-3 | Energy + Daily + Quests + Streak + Ads (continue) |
| Puzzle | Energy + Daily + Quests + Streak + Ads (continue) |
| TD | Upgrades + Skills + Quests + Energy + Leaderboard |
| Survivor | Upgrades + Skills + Loot + Achievements + Ads (revive) |
| Incremental | Offline + Prestige + Rebirth + Upgrades + Achievements |
| Collector | Achievements + Chests + Loot + Daily + Quests |
| Builder | Upgrades + Shop + Quests + Daily + Achievements |

### MECHANICS → SYSTEMS

| Mechanic | Требует Systems |
|---|---|
| Offline Progress | Save + Economy + UI + Animation |
| Quests | Save + UI + Event + Analytics |
| Achievements | Save + UI + Event + Analytics |
| Daily Reward | Save + UI + Event + Time |
| Streak | Save + UI + Time + Event |
| Prestige | Save + Economy + UI + Animation |
| Rebirth | Save + Economy + UI |
| Upgrades | Save + Economy + UI |
| Chests | Save + Loot + UI + Animation + Audio |
| Loot Tables | (только данные) |
| Skills | Save + UI + Input + Animation |
| Inventory | Save + UI |
| Crafting | Save + Inventory + UI + Time |
| Shop | Save + Economy + UI + IAP (если есть) |
| Energy/Lives | Save + UI + Time |
| Ads | Save + Event + UI |
| Leaderboard | Save + UI + Cloud Save |
| Cloud Save | Save + Event |
| Tutorial | UI + Event + Save |
| Battle Pass | Save + UI + Event + Time |

### SYSTEMS → COMPONENTS

| System | Требует Components |
|---|---|
| Save | (фоновый, без UI) |
| Economy | CurrencyPanel + HUD |
| UI | Button + Popup + Toast + HUD + CurrencyPanel |
| Input | (фоновый) |
| Audio | (фоновый) |
| Progression | HUD + Notification |
| Spawn | Animation + Notification |
| Animation | (CSS, без UI) |
| Notification | Notification + Toast |
| Event | (фоновый) |
| IAP | Popup + ConfirmDialog |
| Localization | Window (settings) |

### COMPONENTS → COMPONENTS

| Component | Зависит от |
|---|---|
| Popup | (базовый) |
| Window | (наследует Popup-стилистику) |
| ConfirmDialog | Popup |
| RewardScreen | Popup + Audio |
| TutorialArrow | (поверх UI) |
| HUD | (фоновый) |
| Notification | (поверх UI) |
| Toast | (поверх UI) |
| CurrencyPanel | (часть HUD) |
| Loading | (полноэкранный) |
| Button | (базовый) |

---

## Зависимости "снизу вверх" (что важно при изменении)

```
Component меняется часто
  → System не знает, не сломается
System меняется редко
  → Mechanic может сломаться, если меняется API
Mechanic меняется ещё реже
  → Genre может стать нерелевантным
Genre меняется почти никогда
  → Это основа продукта
```

Правило: **изменяй снизу вверх, не сверху вниз**.

- Можно изменить Component без пересмотра Mechanic
- Можно изменить System без пересмотра Genre
- Нельзя изменить Genre без пересмотра всех нижестоящих

---

## Пример: добавить новую механику

Допустим, хотим добавить "Daily Challenge" (механика).

1. Создать `14_MECHANICS/DAILY_CHALLENGE.md` — определить логику
2. Понять, какие Systems нужны: Save, UI, Event, Time → уже есть
3. Понять, какой Component нужен: Notification (ежедневное уведомление) → уже есть
4. Связать через `01_BEHAVIOR/MINIMAL_CHANGE.md` — минимальные изменения
5. Записать решение в `20_DECISIONS/0007-daily-challenge.md` (новый ADR)

---

## Пример: добавить новый жанр

Допустим, хотим добавить "Word Game".

1. Создать `13_GENRES/WORD.md` — определить core loop
2. Выбрать Mechanics из существующих: Quests, Achievements, Streak
3. Использовать существующие Systems
4. Использовать существующие Components
5. Записать в `CHANGELOG.md` как новый жанр

---

## Пример: добавить новый компонент

Допустим, хотим добавить "ProgressBar".

1. Создать `16_COMPONENTS/PROGRESS_BAR.md` с TypeScript кодом
2. Использовать в Mechanic (например, для Quest progress)
3. Стилизовать в `11_REFERENCE/STUDIO_PRINCIPLES.md` (UI стиль)
4. Записать в `CHANGELOG.md`

---

## Правило обратной связи

Когда меняется верхний слой (например, Mechanic), проверить:
- Не сломались ли зависимые Components?
- Не устарели ли связанные GENRE?
- Не нужно ли обновить ADR?

Когда меняется нижний слой (например, Component), проверить:
- Все ли Mechanics продолжают работать?
- Не нужно ли обновить SYSTEMS?

---

## Версионирование по слоям

Каждый слой имеет свою версию:

- **CORE** — 1.0 (философия, не меняется)
- **BEHAVIOR** — 1.0 (как ИИ думает, редко)
- **RULES** — 1.0 (формальные правила, редко)
- **ROLES** — 1.0 (роли, стабильны)
- **PIPELINE** — 1.0 (процесс, стабилен)
- **GENRES** — 1.0 (жанры, добавляются редко)
- **MECHANICS** — 1.1 (механики, добавляются по запросу)
- **SYSTEMS** — 1.0 (системы, стабильны)
- **COMPONENTS** — 1.0 (компоненты, добавляются по запросу)
- **DECISIONS** — растёт с проектом

Изменения в любом слое отражаются в `CHANGELOG.md`.
