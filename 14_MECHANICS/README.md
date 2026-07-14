**Tags:** core, mechanics

# MECHANICS

Версия: 1.0
Дата: 2026-07-14

---

## Назначение

Переиспользуемые игровые механики. Каждая работает в любом жанре.

Это **самый ценный раздел Studio OS**. Большинство современных казуальных игр — это комбинация нескольких механик.

## Список механик

| Механика | Файл |
|---|---|
| Offline Progress | OFFLINE_PROGRESS.md |
| Quests | QUESTS.md |
| Achievements | ACHIEVEMENTS.md |
| Daily Reward | DAILY_REWARD.md |
| Battle Pass | BATTLE_PASS.md |
| Prestige | PRESTIGE.md |
| Rebirth | REBIRTH.md |
| Chests | CHESTS.md |
| Loot Tables | LOOT.md |
| Crafting | CRAFTING.md |
| Upgrades | UPGRADES.md |
| Skills | SKILLS.md |
| Inventory | INVENTORY.md |
| Shop | SHOP.md |
| Energy / Lives | ENERGY.md |
| Ads | ADS.md |
| Leaderboard | LEADERBOARD.md |
| Cloud Save | CLOUD_SAVE.md |
| Tutorial | TUTORIAL.md |
| Streak | STREAK.md |

## Принципы

1. **Механика = контракт.** У неё есть вход (state) и выход (обновлённый state).
2. **Механика не знает про жанр.** Offline Progress работает одинаково в Merge и в Clicker.
3. **Механика может включать другие механики.** Prestige использует Daily Reward.
4. **Механика опциональна.** Каждая добавляется отдельно.

## Связь с жанрами

| Жанр | Типичные механики |
|---|---|
| Merge | Offline, Quests, Achievements, Daily, Chests |
| Clicker | Upgrades, Achievements, Prestige |
| Idle | Offline, Prestige, Rebirth, Battle Pass |
| Tycoon | Quests, Achievements, Shop, Upgrades |
| Match-3 | Energy, Daily, Quests, Streak |
| Survivor | Upgrades, Skills, Rebirth |
| TD | Upgrades, Skills, Energy |
| Collector | Achievements, Chests, Loot |

## Антипаттерны

- ❌ Все механики сразу в v1.0
- ❌ Механика знает про жанр
- ❌ Механика требует другие механики
- ❌ Механика без UI

## Когда добавлять

| Фаза | Механики |
|---|---|
| MVP (v1.0) | Offline, Quests, Achievements, Daily |
| v1.1 | Chests, Upgrades, Shop |
| v1.2 | Prestige / Rebirth |
| v2.0 | Battle Pass, Skills |
